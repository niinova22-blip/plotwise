import Anthropic from '@anthropic-ai/sdk';

import { AI_TASKS, type AiErrorBody, type AiRequestBody, type AiTask } from '../../src/ai/contract';

import { SYSTEM_PROMPT, userMessage } from './prompts';
import { makeProvider, type Effort } from './providers';
import { SCHEMAS } from './schemas';

export interface Env {
  ANTHROPIC_API_KEY?: string;
  AI_PROVIDER?: string;
  MODEL?: string;
  /** AI calls allowed per install per UTC day. */
  DAILY_LIMIT?: string;
  QUOTA?: KVNamespace;
}

const MAX_BODY_BYTES = 24_000;

const EFFORT: Record<AiTask, Effort> = {
  'lab.clarify': 'low',
  'lab.assumptions': 'low',
  'lab.reframe': 'medium',
  'lab.experiment': 'low',
  'future.scenarios': 'medium',
  'future.step': 'low',
  'train.feedback': 'low',
};

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type, x-install-id',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  });
}

const fail = (error: AiErrorBody['error'], status: number, message?: string) =>
  json({ error, message } satisfies AiErrorBody, status);

/** Soft daily quota in KV; eventual consistency is fine for cost control. */
async function takeQuota(env: Env, installId: string): Promise<boolean> {
  if (!env.QUOTA) return true;
  const limit = Number(env.DAILY_LIMIT ?? '40');
  const key = `q:${installId}:${new Date().toISOString().slice(0, 10)}`;
  const used = Number((await env.QUOTA.get(key)) ?? '0');
  if (used >= limit) return false;
  await env.QUOTA.put(key, String(used + 1), { expirationTtl: 60 * 60 * 48 });
  return true;
}

function parseBody(raw: string): AiRequestBody | null {
  try {
    const body = JSON.parse(raw) as AiRequestBody;
    if (!AI_TASKS.includes(body.task)) return null;
    if (body.context?.lang !== 'en' && body.context?.lang !== 'tr') return null;
    if (!Array.isArray(body.context.goals) || typeof body.input !== 'object' || !body.input) return null;
    return body;
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (url.pathname === '/health') return json({ ok: true, configured: !!env.ANTHROPIC_API_KEY });
    if (url.pathname !== '/v1/think' || request.method !== 'POST') return fail('bad_request', 404);

    const installId = request.headers.get('x-install-id') ?? '';
    if (!/^[\w-]{6,64}$/.test(installId)) return fail('unauthorized', 401);

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return fail('bad_request', 413, 'Input too long');
    const body = parseBody(raw);
    if (!body) return fail('bad_request', 400);

    const provider = makeProvider(env);
    if (!provider) return fail('unconfigured', 503);
    if (!(await takeQuota(env, installId))) return fail('quota', 429);

    try {
      const result = await provider.generate({
        system: SYSTEM_PROMPT,
        user: userMessage(body.task, body.context, body.input),
        schema: SCHEMAS[body.task],
        effort: EFFORT[body.task],
      });
      if (!result.ok) return fail('upstream', 502, result.reason);
      return json(result.json);
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) return fail('upstream', 503, 'rate_limited');
      if (e instanceof Anthropic.APIError) return fail('upstream', 502, `api_${e.status}`);
      return fail('upstream', 502);
    }
  },
} satisfies ExportedHandler<Env>;
