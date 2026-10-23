import type { Gesture, Mood } from '../rig/params';
import type { Line, SituationId } from './types';

/** Lines for one step; ids are `<prefix>.<index>` so both languages match. */
export function say(prefix: string, mood: Mood, ...texts: string[]): Line[] {
  return texts.map((text, i) => ({ id: `${prefix}.${i}`, text, mood }));
}

/** Same as say(), with a gesture override for every line. */
export function sayWith(prefix: string, mood: Mood, gesture: Gesture, ...texts: string[]): Line[] {
  return say(prefix, mood, ...texts).map((l) => ({ ...l, gesture }));
}

export function react(id: SituationId, mood: Mood, ...texts: string[]): Line[] {
  return say(`react.${id}`, mood, ...texts);
}
