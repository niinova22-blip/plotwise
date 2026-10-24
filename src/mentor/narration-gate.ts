/**
 * Whether a step should start Ozan talking: only on the screen in front of the
 * user, only once per step, and only when there is something to say.
 */
export function shouldNarrate({ hasLines, focused, done }: { hasLines: boolean; focused: boolean; done: boolean }): boolean {
  return hasLines && focused && !done;
}
