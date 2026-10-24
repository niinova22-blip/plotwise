import { expect, test } from '@jest/globals';

import { shouldNarrate } from '../narration-gate';

const base = { hasLines: true, focused: true, done: false };

test('a focused step with lines that has not finished is narrated', () => {
  expect(shouldNarrate(base)).toBe(true);
});

test('a screen in the background never starts talking', () => {
  expect(shouldNarrate({ ...base, focused: false })).toBe(false);
});

test('a step he already finished is not repeated on coming back', () => {
  expect(shouldNarrate({ ...base, done: true })).toBe(false);
});

test('nothing to say means nothing starts', () => {
  expect(shouldNarrate({ ...base, hasLines: false })).toBe(false);
});
