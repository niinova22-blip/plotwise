import { useCallback, useEffect, useMemo, useState } from 'react';
import { models, setTelemetryEnabled, useTextEmbedder } from 'react-native-executorch';

import { retryDelayMs } from './retry';

/**
 * Must match tools/embed/build.py so prototype vectors live in the same space.
 * Pinned to the fp16 Core ML export, the closest to the fp32 model the
 * thresholds were tuned on (DEFAULT varies by device).
 */
const MODEL = models.textEmbeddings.PARAPHRASE_MULTILINGUAL_MINILM_L12_V2.COREML_FP16;
/** About the 128 tokens the Python side embeds. */
const MAX_CHARS = 500;

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
 * reaction engine falls back to its safe universal lines. A failed download
 * (say, no connection on first launch) is retried with a growing pause and
 * resumes from the bytes it already has.
 */
export function useEmbedder(): Embedder {
  const [attempt, setAttempt] = useState(0);
  // Briefly true between attempts: toggling preventLoad is what restarts the download.
  const [hold, setHold] = useState(false);
  const embedder = useTextEmbedder(MODEL, { preventLoad: hold });
  const run = embedder.embed;
  const ready = embedder.isReady && !embedder.error && !!run;
  const failed = !!embedder.error;

  useEffect(() => {
    if (!failed) return;
    const t = setTimeout(() => setHold(true), retryDelayMs(attempt));
    return () => clearTimeout(t);
  }, [failed, attempt]);

  // Holding clears the error, so the release lives in its own effect.
  useEffect(() => {
    if (!hold) return;
    const t = setTimeout(() => {
      setHold(false);
      setAttempt((a) => a + 1);
    }, 50);
    return () => clearTimeout(t);
  }, [hold]);

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
