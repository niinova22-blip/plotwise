import { expect, test } from '@jest/globals';

import { retryDelayMs } from '../retry';

test('retries start quickly and back off', () => {
  expect(retryDelayMs(0)).toBe(15_000);
  expect(retryDelayMs(1)).toBe(30_000);
  expect(retryDelayMs(2)).toBe(60_000);
});

test('retries never wait more than five minutes', () => {
  expect(retryDelayMs(10)).toBe(300_000);
  expect(retryDelayMs(1000)).toBe(300_000);
});
