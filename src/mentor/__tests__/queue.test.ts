import { expect, test } from '@jest/globals';

import { initialQueue, queueReducer, type QueueState } from '../queue';
import type { Line } from '../script/types';

const lines: Line[] = [
  { id: 'a.0', text: 'One', mood: 'warm' },
  { id: 'a.1', text: 'Two', mood: 'warm' },
];

const run = (state: QueueState, ...actions: Parameters<typeof queueReducer>[1][]) => actions.reduce(queueReducer, state);

test('say starts speaking the first line', () => {
  const s = run(initialQueue, { type: 'say', lines, token: 1 });
  expect(s.status).toBe('speaking');
  expect(s.index).toBe(0);
  expect(s.token).toBe(1);
});

test('lineEnded only moves speaking to waiting', () => {
  const s = run(initialQueue, { type: 'say', lines, token: 1 }, { type: 'lineEnded' });
  expect(s.status).toBe('waiting');
  expect(run(initialQueue, { type: 'lineEnded' }).status).toBe('idle');
  expect(run(s, { type: 'lineEnded' }).status).toBe('waiting');
});

test('advance past the last line is done', () => {
  const s = run(initialQueue, { type: 'say', lines, token: 1 }, { type: 'advance' }, { type: 'advance' });
  expect(s.status).toBe('done');
});

test('skip from any state is done', () => {
  expect(run(initialQueue, { type: 'say', lines, token: 1 }, { type: 'skip' }).status).toBe('done');
  expect(run(initialQueue, { type: 'skip' }).status).toBe('done');
});

test('say while speaking replaces the queue with a new token', () => {
  const s = run(initialQueue, { type: 'say', lines, token: 1 }, { type: 'say', lines: [lines[1]], token: 2 });
  expect(s.lines).toHaveLength(1);
  expect(s.token).toBe(2);
  expect(s.index).toBe(0);
});

test('20 rapid advances never push index past the end', () => {
  let s = run(initialQueue, { type: 'say', lines, token: 1 });
  for (let i = 0; i < 20; i++) s = queueReducer(s, { type: 'advance' });
  expect(s.index).toBeLessThanOrEqual(lines.length - 1);
  expect(s.status).toBe('done');
});

test('say with no lines is immediately done', () => {
  expect(run(initialQueue, { type: 'say', lines: [], token: 3 }).status).toBe('done');
});
