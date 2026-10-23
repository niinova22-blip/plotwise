import { useCallback, useMemo } from 'react';
import { models, setTelemetryEnabled, useTextEmbedder } from 'react-native-executorch';

/** Must match tools/embed/build.py so prototype vectors live in the same space. */
const MODEL = models.textEmbeddings.PARAPHRASE_MULTILINGUAL_MINILM_L12_V2.DEFAULT;
const MAX_CHARS = 1200;

setTelemetryEnabled(false);

export type Embedder = { ready: boolean; embed: (text: string) => Promise<Float32Array | null> };

function unit(v: Float32Array): Float32Array {
  let n = 0;
  for (let i = 0; i < v.length; i++) n += v[i] * v[i];
  n = Math.sqrt(n) || 1;
  return v.map((x) => x / n);
}

/**
 * On-device sentence embeddings. The model is fetched once on first launch and
 * cached; until then (or on any error) embed() resolves to null and the
 * reaction engine falls back to its safe universal lines.
 */
export function useEmbedder(): Embedder {
  const embedder = useTextEmbedder(MODEL);
  const run = embedder.embed;
  const ready = embedder.isReady && !embedder.error && !!run;

  const embed = useCallback(
    async (text: string) => {
      if (!ready || !run) return null;
      try {
        return unit(await run(text.slice(0, MAX_CHARS)));
      } catch {
        return null;
      }
    },
    [ready, run],
  );

  return useMemo(() => ({ ready, embed }), [ready, embed]);
}
