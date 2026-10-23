import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import type { Clip } from './manifest';

/** If the player never reports that it started, carry on after this long. */
export const START_FALLBACK_MS = 600;

let current: AudioPlayer | null = null;
let cleanup: (() => void) | null = null;
let modeSet = false;

/** Stops whatever Ozan is saying. Safe to call any time. */
export function stopClip(): void {
  cleanup?.();
  cleanup = null;
  if (!current) return;
  try {
    current.pause();
    current.remove();
  } catch {
    // Already released by the system; nothing to do.
  }
  current = null;
}

/**
 * Plays one recorded line, replacing any line still playing, so audio never
 * overlaps. `onStart` fires once, when playback actually begins (or after a
 * short fallback), so the mouth and the end-of-line timer line up with the
 * sound. Returns false if playback could not start; the caller then keeps
 * going with subtitles and a procedural mouth.
 */
export function playClip(clip: Clip, onStart: () => void): boolean {
  stopClip();
  if (!modeSet) {
    modeSet = true;
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }
  try {
    const player = createAudioPlayer(clip.audio);
    let started = false;
    const begin = () => {
      if (started || current !== player) return;
      started = true;
      onStart();
    };
    const sub = player.addListener('playbackStatusUpdate', (status) => {
      if (status.playing) begin();
    });
    const fallback = setTimeout(begin, START_FALLBACK_MS);
    cleanup = () => {
      clearTimeout(fallback);
      sub.remove();
    };
    current = player;
    player.play();
    return true;
  } catch {
    current = null;
    return false;
  }
}
