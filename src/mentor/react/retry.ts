const FIRST_MS = 15_000;
const MAX_MS = 300_000;

/** Wait before the next model download attempt: 15 s, doubling, at most 5 min. */
export function retryDelayMs(attempt: number): number {
  return Math.min(MAX_MS, FIRST_MS * 2 ** Math.min(attempt, 10));
}
