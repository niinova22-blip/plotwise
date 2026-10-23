import { expect, jest, test } from '@jest/globals';

import { clipFor, proceduralEnvelope } from '../envelope';

// Hoisted above the imports by Jest.
jest.mock('../manifest', () => ({
  MANIFEST: { en: { 'known.0': { audio: 1, durationMs: 400, env: [0, 50, 100, 50, 0] } }, tr: {} },
}));

test('procedural envelope opens on vowels and closes on pauses', () => {
  const env = proceduralEnvelope('Ah, hello.', 1, 1);
  expect(env.length).toBeGreaterThan(10);
  expect(Math.max(...env)).toBeGreaterThan(40);
  expect(env[env.length - 1]).toBe(0);
  expect(env.every((v) => v >= 0 && v <= 100)).toBe(true);
});

test('procedural envelope is deterministic for the same text', () => {
  expect(proceduralEnvelope('Hmm, maybe.', 1, 1)).toEqual(proceduralEnvelope('Hmm, maybe.', 1, 1));
});

test('slower moods make longer envelopes', () => {
  expect(proceduralEnvelope('Take it slowly.', 0.78, 1.6).length).toBeGreaterThan(proceduralEnvelope('Take it slowly.', 1.12, 0.8).length);
});

test('clipFor returns null for unknown ids or languages without the clip', () => {
  expect(clipFor('en', 'missing.0')).toBeNull();
  expect(clipFor('tr', 'known.0')).toBeNull();
  expect(clipFor('en', 'known.0')?.durationMs).toBe(400);
});
