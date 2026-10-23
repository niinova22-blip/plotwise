import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';

import { playClip, START_FALLBACK_MS, stopClip } from '../player';

type Listener = (status: { playing: boolean }) => void;
const players: { listener?: Listener; removed: boolean }[] = [];

jest.mock('expo-audio', () => ({
  setAudioModeAsync: () => Promise.resolve(),
  createAudioPlayer: () => {
    const p: { listener?: Listener; removed: boolean } = { removed: false };
    players.push(p);
    return {
      play: () => {},
      pause: () => {},
      remove: () => {
        p.removed = true;
      },
      addListener: (_event: string, fn: Listener) => {
        p.listener = fn;
        return { remove: () => {} };
      },
    };
  },
}));

const clip = { audio: 1, durationMs: 1000, env: [50] };

beforeEach(() => {
  jest.useFakeTimers();
  players.length = 0;
});
afterEach(() => {
  stopClip();
  jest.useRealTimers();
});

test('onStart fires when playback actually begins, not when the player is created', () => {
  const onStart = jest.fn();
  playClip(clip, onStart);
  expect(onStart).not.toHaveBeenCalled();
  players[0].listener?.({ playing: true });
  expect(onStart).toHaveBeenCalledTimes(1);
  players[0].listener?.({ playing: true });
  expect(onStart).toHaveBeenCalledTimes(1);
});

test('onStart still fires after a fallback delay if no status ever arrives', () => {
  const onStart = jest.fn();
  playClip(clip, onStart);
  jest.advanceTimersByTime(START_FALLBACK_MS + 1);
  expect(onStart).toHaveBeenCalledTimes(1);
});

test('a new clip stops the previous one, and its late start is ignored', () => {
  const first = jest.fn();
  playClip(clip, first);
  playClip(clip, jest.fn());
  expect(players[0].removed).toBe(true);
  players[0].listener?.({ playing: true });
  jest.advanceTimersByTime(START_FALLBACK_MS + 1);
  expect(first).not.toHaveBeenCalled();
});
