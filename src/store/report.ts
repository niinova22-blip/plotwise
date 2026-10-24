import { dayKey } from './ids';
import type { AppData, ModuleKind } from './types';

/** Test-phase numbers a tester can choose to send the founder. Counts only, never text. */
export type TestReport = {
  firstSessionDone: boolean;
  /** Local day key of the first finished session or exercise. */
  firstDay: string | null;
  daysSinceFirst: number;
  activeDays: number;
  /** Active again 7–13 days after the first day (the D7 metric). */
  returnedWeek2: boolean;
  sessions: Record<ModuleKind, number>;
  cards: { total: number; useful: number; notUseful: number };
  experiments: { planned: number; reflected: number };
  lang: string;
  mentorVoice: boolean;
  quietMode: boolean;
};

/** Whole local days from `a` to `b` (both YYYY-MM-DD). */
function daysBetween(a: string, b: string): number {
  const toDate = (k: string) => {
    const [y, m, d] = k.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  };
  return Math.round((toDate(b) - toDate(a)) / 86_400_000);
}

export function testReport(data: AppData, now: number = Date.now()): TestReport {
  const days = [...new Set([...data.sessions.map((s) => dayKey(s.createdAt)), ...data.training.map((t) => t.day)])].sort();
  const firstDay = days[0] ?? null;

  const sessions: Record<ModuleKind, number> = { lab: 0, future: 0, train: 0 };
  for (const s of data.sessions) sessions[s.module] += 1;
  sessions.train += data.training.length;

  const experiments = data.cards.filter((c) => c.kind === 'experiment');

  return {
    firstSessionDone: firstDay !== null,
    firstDay,
    daysSinceFirst: firstDay ? daysBetween(firstDay, dayKey(now)) : 0,
    activeDays: days.length,
    returnedWeek2: firstDay !== null && days.some((d) => daysBetween(firstDay, d) >= 7 && daysBetween(firstDay, d) <= 13),
    sessions,
    cards: {
      total: data.cards.length,
      useful: data.cards.filter((c) => c.useful === true).length,
      notUseful: data.cards.filter((c) => c.useful === false).length,
    },
    experiments: { planned: experiments.length, reflected: experiments.filter((c) => c.followUpNote).length },
    lang: data.profile.lang ?? 'system',
    mentorVoice: data.profile.mentorVoice,
    quietMode: data.profile.quietMode,
  };
}

/** Plain English text for the share sheet; the founder reads every tester's report the same way. */
export function formatReport(r: TestReport, version: string): string {
  const yes = (v: boolean) => (v ? 'yes' : 'no');
  return [
    `Plotwise test summary (v${version})`,
    `First session finished: ${yes(r.firstSessionDone)}`,
    `First day: ${r.firstDay ?? '-'} (${r.daysSinceFirst} days ago)`,
    `Active days: ${r.activeDays}`,
    `Came back in week 2: ${yes(r.returnedWeek2)}`,
    `Sessions: Lab ${r.sessions.lab}, Simulator ${r.sessions.future}, Training ${r.sessions.train}`,
    `Cards: ${r.cards.total} (useful ${r.cards.useful}, not useful ${r.cards.notUseful})`,
    `Experiments: ${r.experiments.planned} planned, ${r.experiments.reflected} reflected on`,
    `Language: ${r.lang}; Ozan voice: ${yes(r.mentorVoice)}; quiet mode: ${yes(r.quietMode)}`,
  ].join('\n');
}
