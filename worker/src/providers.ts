import Anthropic from '@anthropic-ai/sdk';

/**
 * Model providers behind one interface, so the app never depends on a vendor.
 * Add a new provider by implementing `generate` and registering it in `makeProvider`.
 */
export type Effort = 'low' | 'medium' | 'high';

export type GenerateArgs = {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  effort: Effort;
};

export type GenerateResult =
  | { ok: true; json: unknown }
  | { ok: false; reason: 'refusal' | 'truncated' | 'invalid_json' };

export interface Provider {
  generate(args: GenerateArgs): Promise<GenerateResult>;
}

class AnthropicProvider implements Provider {
  private client: Anthropic;

  constructor(
    apiKey: string,
    private model: string,
  ) {
    this.client = new Anthropic({ apiKey, maxRetries: 2, timeout: 60_000 });
  }

  async generate({ system, user, schema, effort }: GenerateArgs): Promise<GenerateResult> {
    const response = await this.client.beta.messages.create({
      model: this.model,
      max_tokens: 8000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      output_config: { effort, format: { type: 'json_schema', schema } },
      messages: [{ role: 'user', content: user }],
    });

    if (response.stop_reason === 'refusal') return { ok: false, reason: 'refusal' };
    if (response.stop_reason === 'max_tokens') return { ok: false, reason: 'truncated' };

    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');
    try {
      return { ok: true, json: JSON.parse(text) };
    } catch {
      return { ok: false, reason: 'invalid_json' };
    }
  }
}

export function makeProvider(env: { AI_PROVIDER?: string; ANTHROPIC_API_KEY?: string; MODEL?: string }): Provider | null {
  switch (env.AI_PROVIDER ?? 'anthropic') {
    case 'anthropic':
      if (!env.ANTHROPIC_API_KEY) return null;
      return new AnthropicProvider(env.ANTHROPIC_API_KEY, env.MODEL || 'claude-opus-5-5');
    default:
      return null;
  }
}
