import { PACKS } from '@/ai/offline/content';
import type { Lang } from '@/i18n';

import type { Mood } from '../rig/params';
import en from './en';
import tr from './tr';
import type { Line, Script } from './types';

const SCRIPTS: Record<Lang, Script> = { en, tr };

export function getScript(lang: Lang): Script {
  return SCRIPTS[lang];
}

export type VoicedLine = { id: string; text: string; mood: Mood };

/** Mood for content-bank strings, by their top-level section. */
const BANK_MOOD: Record<string, Mood> = {
  clarify: 'curious',
  assumptions: 'think',
  reframes: 'think',
  provocations: 'curious',
  opportunities: 'happy',
  risks: 'think',
  experiments: 'warm',
  future: 'curious',
  train: 'warm',
};

/** Bank fields that are labels, not sentences, and stay unvoiced. */
const SKIP = new Set(['labels', 'timebox', 'scenarios', 'narrative1', 'narrative2']);

function collectBank(value: unknown, path: string[], out: VoicedLine[]) {
  if (typeof value === 'function') return; // templates that embed the user's words
  if (typeof value === 'string') {
    out.push({ id: `bank.${path.join('.')}`, text: value, mood: BANK_MOOD[path[0]] ?? 'warm' });
    return;
  }
  if (Array.isArray(value)) value.forEach((v, i) => collectBank(v, [...path, String(i)], out));
  else if (value && typeof value === 'object')
    for (const [k, v] of Object.entries(value)) if (!SKIP.has(k)) collectBank(v, [...path, k], out);
}

function collectScript(value: unknown, out: VoicedLine[]) {
  if (Array.isArray(value)) value.forEach((v) => collectScript(v, out));
  else if (value && typeof value === 'object') {
    if ('id' in value && 'text' in value) {
      const l = value as Line;
      out.push({ id: l.id, text: l.text, mood: l.mood });
    } else Object.values(value).forEach((v) => collectScript(v, out));
  }
}

/** Every fixed sentence Ozan can say in this language: the script plus the offline content banks. */
export function voicedLines(lang: Lang): VoicedLine[] {
  const out: VoicedLine[] = [];
  collectScript(SCRIPTS[lang], out);
  const pack = PACKS[lang];
  for (const [k, v] of Object.entries(pack)) if (!SKIP.has(k)) collectBank(v, [k], out);
  return out;
}
