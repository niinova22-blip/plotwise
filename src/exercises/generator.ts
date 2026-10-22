/**
 * Picks and fills today's exercises on-device. Deterministic per day + slot so
 * the same exercise survives app restarts, but adapts to recent history:
 * avoids recently used templates and types, and leans toward the user's goals.
 */

import type { Lang } from '@/i18n';
import type { ExerciseType, Goal, TrainingEntry } from '@/store/types';

import { POOLS, TEMPLATES, type Template } from './templates';

export type Exercise = {
  templateId: string;
  type: ExerciseType;
  prompt: string;
  check: string[];
};

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small seeded PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weight(t: Template, history: TrainingEntry[], goals: Goal[]): number {
  const recentIds = history.slice(0, 30).map((h) => h.templateId);
  const recentTypes = history.slice(0, 3).map((h) => h.type);
  if (recentIds.includes(t.id)) return 0.05;
  let w = 1;
  if (recentTypes.includes(t.type)) w *= 0.3;
  if (t.goals?.some((g) => goals.includes(g))) w *= 1.8;
  return w;
}

function fill(text: string, lang: Lang, random: () => number): string {
  const used = new Map<string, Set<number>>();
  return text.replace(/\{(\w+?)(\d?)\}/g, (match, key: string) => {
    const pool = POOLS[key];
    if (!pool) return match;
    const taken = used.get(key) ?? new Set<number>();
    let index = Math.floor(random() * pool.length);
    for (let tries = 0; taken.has(index) && tries < pool.length; tries++) {
      index = (index + 1) % pool.length;
    }
    taken.add(index);
    used.set(key, taken);
    return pool[index][lang];
  });
}

export function pickExercise(
  lang: Lang,
  day: string,
  slot: number,
  history: TrainingEntry[],
  goals: Goal[],
): Exercise {
  const random = rng(hash(`${day}#${slot}#${history.length}`));
  const weights = TEMPLATES.map((t) => weight(t, history, goals));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = random() * total;
  let chosen = TEMPLATES[0];
  for (let i = 0; i < TEMPLATES.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      chosen = TEMPLATES[i];
      break;
    }
  }
  return {
    templateId: chosen.id,
    type: chosen.type,
    prompt: fill(chosen.text[lang], lang, random),
    check: chosen.check.map((c) => c[lang]),
  };
}

/** How many exercises a day's time budget allows. */
export function dailyCount(minutes: 5 | 10 | 15): number {
  return minutes === 5 ? 1 : minutes === 10 ? 2 : 3;
}
