import type { Lang } from '@/i18n';

import { MANIFEST, type Clip } from './manifest';

export const FRAME_MS = 20;
const VOWELS = 'aeıioöuüâîûAEIİOÖUÜÂ';

/** Recorded clip for a line, or null when it was never rendered in this language. */
export function clipFor(lang: Lang, id: string): Clip | null {
  return MANIFEST[lang]?.[id] ?? null;
}

/** Small deterministic noise so the same text always moves the same way. */
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Mouth envelope (0..100 per 20 ms) made from the text itself, for lines with
 * no recording or when the voice is off: vowels open, consonants half-close,
 * punctuation pauses. rate/pause come from the mood.
 */
export function proceduralEnvelope(text: string, rate: number, pause: number): number[] {
  const env: number[] = [];
  const push = (value: number, ms: number) => {
    const frames = Math.max(1, Math.round(ms / FRAME_MS));
    for (let i = 0; i < frames; i++) env.push(value);
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const n = noise(i + text.length);
    if (VOWELS.includes(ch)) push(Math.round(45 + n * 45), 62 / rate);
    else if (ch === ' ') push(8, 40 / rate);
    else if (',;:'.includes(ch)) push(0, 260 * pause);
    else if ('.!?…'.includes(ch)) push(0, 420 * pause);
    else push(Math.round(5 + n * 18), 62 / rate);
  }
  if (env[env.length - 1] !== 0) push(0, 60);
  return env;
}
