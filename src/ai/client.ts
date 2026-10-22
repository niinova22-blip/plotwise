import type { AiContext, AiErrorBody, AiInput, AiOutput, AiTask } from './contract';
import { demoRespond } from './demo';

const AI_URL = process.env.EXPO_PUBLIC_AI_URL;

let serverUnconfigured = false;

/** True when responses are canned samples: no proxy URL, or the proxy has no model key yet. */
export function isDemoMode() {
  return !AI_URL || serverUnconfigured;
}

export class AiError extends Error {
  constructor(
    public code: AiErrorBody['error'] | 'network',
    message?: string,
  ) {
    super(message ?? code);
  }
}

/**
 * Runs one AI task through the proxy. API keys live only on the proxy;
 * the app identifies itself with an anonymous install id used for quotas.
 */
export async function runAi<T extends AiTask>(
  task: T,
  input: AiInput<T>,
  context: AiContext,
  installId: string,
): Promise<AiOutput<T>> {
  if (!AI_URL || serverUnconfigured) return demoRespond(task, input, context);

  let res: Response;
  try {
    res = await fetch(`${AI_URL.replace(/\/$/, '')}/v1/think`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-install-id': installId },
      body: JSON.stringify({ task, context, input }),
    });
  } catch (e) {
    throw new AiError('network', e instanceof Error ? e.message : undefined);
  }

  if (!res.ok) {
    let body: AiErrorBody | null = null;
    try {
      body = (await res.json()) as AiErrorBody;
    } catch {
      // Non-JSON error page from the edge; fall through to a generic error.
    }
    if (body?.error === 'unconfigured') {
      // Lets builds ship before the proxy has a key; flips to real AI once it does.
      serverUnconfigured = true;
      return demoRespond(task, input, context);
    }
    throw new AiError(body?.error ?? 'upstream', body?.message);
  }
  return (await res.json()) as AiOutput<T>;
}
