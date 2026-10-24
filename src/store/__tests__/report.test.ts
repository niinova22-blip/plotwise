import { expect, test } from '@jest/globals';

import { formatReport, testReport } from '../report';
import type { AppData, OutcomeCard, Session, TrainingEntry } from '../types';
import { dayKey } from '../ids';

const at = (day: number, hour = 10) => new Date(2026, 9, day, hour).getTime();

const base = (): AppData => ({
  version: 1,
  profile: {
    onboarded: true,
    lang: 'tr',
    theme: 'system',
    goals: [],
    minutes: 5,
    installId: 'secret-install-id',
    mentorVoice: true,
    quietMode: false,
  },
  cards: [],
  sessions: [],
  training: [],
});
const session = (id: string, time: number, module: Session['module'] = 'lab'): Session => ({
  id,
  module,
  title: 'I want to quit my job',
  createdAt: time,
  data: {},
});
const training = (id: string, time: number): TrainingEntry => ({
  id,
  templateId: 't',
  type: 'invert',
  prompt: 'p',
  answer: 'private answer',
  day: dayKey(time),
  createdAt: time,
  usedAi: false,
});
const card = (id: string, extra: Partial<OutcomeCard> = {}): OutcomeCard => ({
  id,
  kind: 'reframe',
  title: 'private title',
  body: '',
  sessionId: 's',
  createdAt: 0,
  ...extra,
});

test('an untouched install has not finished a session', () => {
  const r = testReport(base(), at(5));
  expect(r.firstSessionDone).toBe(false);
  expect(r.firstDay).toBeNull();
  expect(r.activeDays).toBe(0);
  expect(r.returnedWeek2).toBe(false);
});

test('counts active days and days since first use', () => {
  const data = { ...base(), sessions: [session('a', at(1)), session('b', at(1, 20))], training: [training('t', at(3))] };
  const r = testReport(data, at(8));
  expect(r.firstSessionDone).toBe(true);
  expect(r.firstDay).toBe(dayKey(at(1)));
  expect(r.daysSinceFirst).toBe(7);
  expect(r.activeDays).toBe(2);
  expect(r.sessions).toEqual({ lab: 2, future: 0, train: 1 });
});

test('returned in week 2 means active 7 to 13 days after the first day', () => {
  const early = { ...base(), sessions: [session('a', at(1)), session('b', at(7))] };
  expect(testReport(early, at(20)).returnedWeek2).toBe(false);
  const back = { ...base(), sessions: [session('a', at(1)), session('b', at(8))] };
  expect(testReport(back, at(20)).returnedWeek2).toBe(true);
  const late = { ...base(), sessions: [session('a', at(1)), session('b', at(15))] };
  expect(testReport(late, at(20)).returnedWeek2).toBe(false);
});

test('tallies card ratings and experiment follow-ups', () => {
  const data = {
    ...base(),
    cards: [
      card('a', { useful: true }),
      card('b', { useful: true }),
      card('c', { useful: false }),
      card('d'),
      card('e', { kind: 'experiment', followUpNote: 'went fine' }),
      card('f', { kind: 'experiment' }),
    ],
  };
  const r = testReport(data, at(5));
  expect(r.cards).toEqual({ total: 6, useful: 2, notUseful: 1 });
  expect(r.experiments).toEqual({ planned: 2, reflected: 1 });
});

test('the shared text carries counts only, never what the user wrote', () => {
  const data = {
    ...base(),
    sessions: [session('a', at(1))],
    training: [training('t', at(2))],
    cards: [card('a', { useful: true, followUpNote: 'private note' })],
  };
  const text = formatReport(testReport(data, at(9)), '1.0.0');
  expect(text).toContain('1.0.0');
  expect(text).toContain('Active days: 2');
  for (const secret of ['quit my job', 'private answer', 'private title', 'private note', 'secret-install-id']) {
    expect(text).not.toContain(secret);
  }
});
