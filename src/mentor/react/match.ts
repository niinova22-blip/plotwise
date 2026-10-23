import { detectTopic, looksLikeCrisis, seedOf, type Topic } from '@/ai/offline/detect';
import type { Lang } from '@/i18n';

import type { Gesture, Mood } from '../rig/params';
import { getScript } from '../script';
import type { Line, SituationId } from '../script/types';
import raw from './prototypes.json';

type PrototypeFile = {
  model: string;
  threshold: number;
  margin: number;
  crisisThreshold: number;
  items: { id: string; vec: number[]; crisis?: boolean }[];
};
const data = raw as PrototypeFile;

export type Prototype = { id: SituationId; vec: Float32Array; crisis?: boolean };

export type Reaction = {
  situation: SituationId | null;
  lineId: string;
  line: Line;
  mood: Mood;
  gesture: Gesture | undefined;
  /** block = leave the flow for the support screen; offer = show support, allow continuing. */
  crisis: 'block' | 'offer' | null;
};

/** Cosine thresholds, tuned on the held-out set in tools/embed (see eval output). */
export const THRESHOLD = data.threshold;
export const MARGIN = data.margin;
export const CRISIS_THRESHOLD = data.crisisThreshold;

const TOPIC_PREFIX: Partial<Record<Topic, string[]>> = {
  career: ['work_'],
  startup: ['startup_', 'idea_', 'side_'],
  money: ['money_'],
  relationship: ['rel_'],
  study: ['study_'],
  move: ['move_'],
  health: ['health_'],
  creative: ['creative_'],
};

export const PROTOTYPES: Prototype[] = data.items.map((p) => ({
  id: p.id as SituationId,
  vec: Float32Array.from(p.vec),
  crisis: p.crisis || undefined,
}));

function dot(a: Float32Array, b: Float32Array) {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

/** Picks a line, avoiding recently used ones whenever there is an alternative. */
function pickLine(lines: Line[], text: string, recent: string[]): Line {
  const start = seedOf(text) % lines.length;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[(start + i) % lines.length];
    if (!recent.includes(l.id)) return l;
  }
  return lines[start];
}

function result(line: Line, situation: SituationId | null, crisis: Reaction['crisis']): Reaction {
  return { situation, lineId: line.id, line, mood: line.mood, gesture: crisis ? 'chest' : line.gesture, crisis };
}

/**
 * Chooses Ozan's reaction to what the user wrote. A confident, unambiguous
 * match gets a situation line; anything else gets a warm universal line, so a
 * niche message never gets a confidently wrong answer.
 */
export function match(
  vec: Float32Array | null,
  text: string,
  lang: Lang,
  recent: string[],
  protos: Prototype[] = PROTOTYPES,
): Reaction {
  const script = getScript(lang);
  const safeText = text.slice(0, 2000);

  if (looksLikeCrisis(safeText)) return result(pickLine(script.reactions.crisis_selfharm, safeText, recent), 'crisis_selfharm', 'block');

  const universal = () => result(pickLine(script.universal, safeText, recent), null, null);
  if (!vec || protos.length === 0) return universal();

  const scored = protos.map((p) => ({ p, s: dot(vec, p.vec) })).sort((a, b) => b.s - a.s);

  const crisisHit = scored.find((x) => x.p.crisis);
  if (crisisHit && crisisHit.s >= CRISIS_THRESHOLD)
    return result(pickLine(script.reactions[crisisHit.p.id], safeText, recent), crisisHit.p.id, 'offer');

  const ordinary = scored.filter((x) => !x.p.crisis);
  const [best, second] = ordinary;
  if (!best || best.s < THRESHOLD) return universal();

  let chosen = best;
  if (second && best.s - second.s < MARGIN) {
    // Too close to call on meaning alone; let the keyword topic break the tie, if it clearly can.
    const prefixes = TOPIC_PREFIX[detectTopic(safeText, lang)] ?? [];
    const fits = (id: string) => prefixes.some((p) => id.startsWith(p));
    if (fits(best.p.id) === fits(second.p.id)) return universal();
    chosen = fits(best.p.id) ? best : second;
  }
  return result(pickLine(script.reactions[chosen.p.id], safeText, recent), chosen.p.id, null);
}
