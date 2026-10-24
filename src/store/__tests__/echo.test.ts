import { expect, test } from '@jest/globals';

import { findEcho } from '../echo';
import type { OutcomeCard, Session } from '../types';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 100 * DAY;

const session = (id: string, title: string, daysAgo: number, module: Session['module'] = 'lab'): Session => ({
  id,
  module,
  title,
  createdAt: NOW - daysAgo * DAY,
  data: {},
});
const card = (id: string, sessionId: string, kind: OutcomeCard['kind'], extra: Partial<OutcomeCard> = {}): OutcomeCard => ({
  id,
  kind,
  title: `card ${id}`,
  body: '',
  sessionId,
  createdAt: 0,
  ...extra,
});

test('finds the most recent earlier session on the same topic', () => {
  const sessions = [session('new', 'My boss keeps ignoring my ideas at work', 2), session('old', 'Should I ask my manager for a promotion?', 9)];
  const echo = findEcho('I want to quit my job', 'en', sessions, []);
  expect(echo?.session.id).toBe('new');
});

test('ignores sessions on other topics', () => {
  const sessions = [session('a', 'I keep fighting with my girlfriend', 3)];
  expect(findEcho('I want to quit my job', 'en', sessions, [])).toBeNull();
});

test('says nothing when the new text has no clear topic', () => {
  const sessions = [session('a', 'Should I ask my manager for a promotion?', 3)];
  expect(findEcho('I feel a bit lost lately', 'en', sessions, [])).toBeNull();
});

test('prefers an experiment the user already reflected on', () => {
  const sessions = [session('s', 'İşte patronumla anlaşamıyorum', 4)];
  const cards = [
    card('as', 's', 'assumption'),
    card('ex', 's', 'experiment'),
    card('done', 's', 'experiment', { followUpNote: 'Konuştum, iyi geçti' }),
  ];
  expect(findEcho('İşimden istifa etmeyi düşünüyorum', 'tr', sessions, cards)?.card?.id).toBe('done');
});

test('falls back to an experiment, then an assumption', () => {
  const sessions = [session('s', 'My boss keeps ignoring me at work', 4)];
  expect(findEcho('I hate my job', 'en', sessions, [card('as', 's', 'assumption'), card('ex', 's', 'experiment')])?.card?.id).toBe('ex');
  expect(findEcho('I hate my job', 'en', sessions, [card('in', 's', 'insight'), card('as', 's', 'assumption')])?.card?.id).toBe('as');
});

test('cards from other sessions are never shown', () => {
  const sessions = [session('s', 'My boss keeps ignoring me at work', 4)];
  expect(findEcho('I hate my job', 'en', sessions, [card('x', 'other', 'experiment')])?.card).toBeNull();
});

test('a simulator session counts too', () => {
  const sessions = [session('f', 'Start my own e-commerce company', 5, 'future')];
  expect(findEcho('Should I launch my product now?', 'en', sessions, [])?.session.id).toBe('f');
});
