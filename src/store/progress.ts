import { dayKey } from './ids';
import type { AppData, CardKind, ExerciseType, ModuleKind } from './types';

export const EXERCISE_TYPES: ExerciseType[] = [
  'futures',
  'invert',
  'connect',
  'perspectives',
  'partial',
  'failure',
  'wrong',
];

const CARD_KINDS: CardKind[] = ['assumption', 'reframe', 'experiment', 'future', 'insight'];

export type Progress = {
  sessions: Record<ModuleKind, number>;
  cards: Record<CardKind, number>;
  experimentsPlanned: number;
  experimentsReflected: number;
  /** Consecutive active days ending today, or yesterday if today is still open. */
  streak: number;
  /** Day keys for the last `days` days, oldest first, with whether anything happened. */
  recent: { day: string; active: boolean }[];
  exerciseTypes: Record<ExerciseType, number>;
  /** The exercise type practiced least, to suggest variety. Null before any training. */
  suggestType: ExerciseType | null;
};

function daysBack(now: number, n: number): string {
  const d = new Date(now);
  return dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - n).getTime());
}

/** Count-based progress only: no scores, no judgments of answer quality. */
export function computeProgress(data: AppData, now: number = Date.now(), days = 28): Progress {
  const sessions: Record<ModuleKind, number> = { lab: 0, future: 0, train: 0 };
  for (const s of data.sessions) sessions[s.module] += 1;
  sessions.train += data.training.length;

  const cards = Object.fromEntries(CARD_KINDS.map((k) => [k, 0])) as Record<CardKind, number>;
  for (const c of data.cards) cards[c.kind] += 1;

  const experiments = data.cards.filter((c) => c.kind === 'experiment');

  const activeDays = new Set<string>([
    ...data.training.map((t) => t.day),
    ...data.sessions.map((s) => dayKey(s.createdAt)),
  ]);

  let streak = 0;
  let offset = activeDays.has(daysBack(now, 0)) ? 0 : 1;
  while (activeDays.has(daysBack(now, offset))) {
    streak += 1;
    offset += 1;
  }

  const recent = Array.from({ length: days }, (_, i) => {
    const day = daysBack(now, days - 1 - i);
    return { day, active: activeDays.has(day) };
  });

  const exerciseTypes = Object.fromEntries(EXERCISE_TYPES.map((t) => [t, 0])) as Record<ExerciseType, number>;
  for (const t of data.training) exerciseTypes[t.type] += 1;
  const suggestType =
    data.training.length === 0
      ? null
      : EXERCISE_TYPES.reduce((min, t) => (exerciseTypes[t] < exerciseTypes[min] ? t : min));

  return {
    sessions,
    cards,
    experimentsPlanned: experiments.length,
    experimentsReflected: experiments.filter((c) => c.followUpNote).length,
    streak,
    recent,
    exerciseTypes,
    suggestType,
  };
}
