import type { AiLang } from '@/ai/contract';
import { detectTopic } from '@/ai/offline/detect';

import type { OutcomeCard, Session } from './types';

/** An earlier session on the same topic, and the card from it most worth recalling. */
export type Echo = { session: Session; card: OutcomeCard | null };

/** What the user learned beats what they planned, which beats what they doubted. */
function rank(c: OutcomeCard): number {
  if (c.kind === 'experiment' && c.followUpNote) return 0;
  if (c.kind === 'experiment') return 1;
  if (c.kind === 'assumption') return 2;
  return 3;
}

/**
 * Links a new problem or goal to the most recent earlier Lab or Simulator
 * session about the same topic. Topics come from the offline keyword detector,
 * so an unclear text links to nothing rather than to something unrelated.
 */
export function findEcho(text: string, lang: AiLang, sessions: Session[], cards: OutcomeCard[]): Echo | null {
  const topic = detectTopic(text, lang);
  if (topic === 'general') return null;
  const session = [...sessions]
    .filter((x) => x.module !== 'train' && detectTopic(x.title, lang) === topic)
    .sort((a, b) => b.createdAt - a.createdAt)[0];
  if (!session) return null;
  const card = cards.filter((c) => c.sessionId === session.id).sort((a, b) => rank(a) - rank(b))[0] ?? null;
  return { session, card };
}
