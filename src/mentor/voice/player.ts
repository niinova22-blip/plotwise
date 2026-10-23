import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import type { Clip } from './manifest';

let current: AudioPlayer | null = null;
let modeSet = false;

/** Stops whatever Ozan is saying. Safe to call any time. */
export function stopClip(): void {
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
 * overlaps. Returns false if playback could not start; the caller then keeps
 * going with subtitles and a procedural mouth.
 */
export function playClip(clip: Clip): boolean {
  stopClip();
  if (!modeSet) {
    modeSet = true;
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }
  try {
    current = createAudioPlayer(clip.audio);
    current.play();
    return true;
  } catch {
    current = null;
    return false;
  }
}
