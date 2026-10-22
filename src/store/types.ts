import type { Lang } from '@/i18n';

export type Goal = 'career' | 'startup' | 'creativity' | 'personal' | 'general';
export type ThemePref = 'system' | 'light' | 'dark';
export type CardKind = 'assumption' | 'reframe' | 'experiment' | 'future' | 'insight';
export type ModuleKind = 'lab' | 'future' | 'train';
export type ExerciseType =
  | 'futures'
  | 'invert'
  | 'connect'
  | 'perspectives'
  | 'partial'
  | 'failure'
  | 'wrong';

export type Profile = {
  onboarded: boolean;
  /** null follows the device language. */
  lang: Lang | null;
  theme: ThemePref;
  goals: Goal[];
  minutes: 5 | 10 | 15;
  installId: string;
};

/** A concrete takeaway saved at the end of a session. */
export type OutcomeCard = {
  id: string;
  kind: CardKind;
  title: string;
  body: string;
  sessionId: string;
  createdAt: number;
  /** Experiments get a check-in a few days later. */
  followUpAt?: number;
  followUpNote?: string;
};

export type Session = {
  id: string;
  module: ModuleKind;
  title: string;
  createdAt: number;
  /** Module-specific transcript, kept for later comparison. */
  data: unknown;
};

export type TrainingEntry = {
  id: string;
  templateId: string;
  type: ExerciseType;
  prompt: string;
  answer: string;
  /** Local day key, YYYY-MM-DD. */
  day: string;
  createdAt: number;
  usedAi: boolean;
};

export type AppData = {
  version: 1;
  profile: Profile;
  cards: OutcomeCard[];
  sessions: Session[];
  training: TrainingEntry[];
};
