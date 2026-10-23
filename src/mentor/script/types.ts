import type { Gesture, Mood } from '../rig/params';

/** One thing Ozan says. Ids are stable: they name the recorded clip. */
export type Line = { id: string; text: string; mood: Mood; gesture?: Gesture };

/** Situations Ozan can recognise in what the user writes (see react/situations.ts). */
export const SITUATIONS = [
  'work_people', 'work_boss', 'work_burnout', 'work_quit', 'work_bored', 'work_promotion', 'work_job_search', 'work_imposter',
  'idea_excited', 'startup_fear', 'startup_customers', 'startup_money', 'startup_partner', 'side_project_time',
  'money_worry', 'money_debt', 'money_spending', 'money_invest_fear',
  'rel_partner_conflict', 'rel_breakup', 'rel_lonely', 'rel_family_pressure', 'rel_friend_hurt', 'rel_boundaries', 'rel_dating',
  'study_choice', 'study_exam', 'study_motivation', 'study_change_field',
  'move_abroad', 'move_city', 'move_homesick',
  'health_sleep', 'health_exercise', 'health_stress', 'health_habit',
  'creative_block', 'creative_share_fear', 'creative_perfection', 'creative_start',
  'decision_stuck', 'fear_failure', 'fear_judgment', 'overthinking', 'procrastination', 'future_uncertain',
  'comparison', 'no_time', 'low_confidence', 'regret', 'big_change', 'good_news', 'too_late', 'meaning',
  'frustrated', 'sad_low', 'anxious', 'overwhelmed',
  'crisis_selfharm', 'crisis_hopeless',
] as const;

export type SituationId = (typeof SITUATIONS)[number];

type Steps<K extends string> = Record<K, Line[]>;

export type Script = {
  home: Steps<'first' | 'returning'>;
  lab: Steps<'describe' | 'clarify' | 'assumptions' | 'ownAssumption' | 'reframe' | 'provocation' | 'provocationLeadIn' | 'weigh' | 'experiment' | 'done'>;
  future: Steps<'goal' | 'scenarios' | 'story' | 'decision' | 'twist' | 'closing' | 'done'>;
  train: Steps<'intro' | 'feedback' | 'done' | 'another'>;
  /** Two or more lines per situation; one is picked, avoiding recent ones. */
  reactions: Record<SituationId, Line[]>;
  /** Warm lines that fit anything; used whenever the engine is unsure. */
  universal: Line[];
};
