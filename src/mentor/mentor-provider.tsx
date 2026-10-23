import { createContext, use, useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { useI18n } from '@/hooks/use-i18n';
import { useStore } from '@/store/app-store';

import { initialQueue, queueReducer, type QueueState } from './queue';
import { useEmbedder } from './react/embedder';
import { match, type Reaction } from './react/match';
import { MOODS, type Mood } from './rig/params';
import type { Line } from './script/types';
import { clipFor, FRAME_MS, proceduralEnvelope } from './voice/envelope';
import { playClip, stopClip } from './voice/player';

/** Pause after a line before Ozan moves on by himself. */
const AUTO_ADVANCE_MS = 900;
/** How long the gesture lingers after he stops talking. */
const GESTURE_TAIL_MS = 1400;

export type Mentor = {
  say: (lines: Line[]) => Promise<void>;
  /**
   * Reacts to something the user wrote: picks a fitting line (or a safe
   * universal one) and says it. Resolves when he has finished. A crisis
   * `block` returns at once without speaking.
   */
  react: (text: string) => Promise<Reaction>;
  advance: () => void;
  skip: () => void;
  current: Line | null;
  /** The last line shown, kept on screen after he finishes. */
  last: Line | null;
  status: QueueState['status'];
  mood: Mood;
  gesturing: boolean;
  /** Duration of the current line, for subtitle reveal. */
  durationMs: number;
  /** Increments each time a new line starts. */
  lineKey: number;
  speaking: SharedValue<number>;
  glanceAt: SharedValue<[number, number] | null>;
  /** True when this screen should show the compact UI instead of Ozan. */
  quiet: boolean;
};

const MentorContext = createContext<Mentor | null>(null);

export function MentorProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const { data } = useStore();
  const voiceOn = data.profile.mentorVoice;
  const quiet = data.profile.quietMode;

  const [q, dispatch] = useReducer(queueReducer, initialQueue);
  // The token whose gesture has finished settling after he stopped talking.
  const [settled, setSettled] = useState(0);

  const speaking = useSharedValue(0);
  const glanceAt = useSharedValue<[number, number] | null>(null);
  const env = useSharedValue<number[]>([]);
  const elapsed = useSharedValue(0);

  const embedder = useEmbedder();
  const recent = useRef<string[]>([]);
  const tokenRef = useRef(0);
  const resolvers = useRef(new Map<number, () => void>());

  // Jaw follows the envelope of whatever line is playing.
  useFrameCallback((info) => {
    'worklet';
    const e = env.value;
    if (e.length === 0) {
      speaking.value = 0;
      return;
    }
    elapsed.value += info.timeSincePreviousFrame ?? 16;
    const i = Math.floor(elapsed.value / FRAME_MS);
    speaking.value = i < e.length ? e[i] / 100 : 0;
  });

  const talking = q.status === 'speaking' || q.status === 'waiting';
  const current = talking ? q.lines[q.index] ?? null : null;
  // The reducer keeps the lines after finishing, so the last one stays on screen.
  const last = q.lines[q.index] ?? null;
  const mood: Mood = last?.mood ?? 'warm';
  const lineKey = q.token * 1000 + q.index;

  // What this line will play: the recording if there is one, else a mouth made from the text.
  const plan = useMemo(() => {
    if (!current) return null;
    const preset = MOODS[current.mood];
    const clip = voiceOn ? clipFor(lang, current.id) : null;
    const procedural = proceduralEnvelope(current.text, preset.rate, preset.pause);
    return { clip, procedural };
  }, [current, voiceOn, lang]);
  const durationMs = plan ? (plan.clip ? plan.clip.durationMs : plan.procedural.length * FRAME_MS) : 0;

  // Start a line.
  useEffect(() => {
    if (q.status !== 'speaking' || !plan) return;
    const played = plan.clip ? playClip(plan.clip) : false;
    const envelope = played && plan.clip ? plan.clip.env : plan.procedural;
    const duration = played && plan.clip ? plan.clip.durationMs : plan.procedural.length * FRAME_MS;
    elapsed.set(0);
    env.set(envelope);
    const t = setTimeout(() => dispatch({ type: 'lineEnded' }), duration);
    return () => {
      clearTimeout(t);
      stopClip();
      env.set([]);
    };
  }, [q.status, q.index, q.token, plan, env, elapsed]);

  // After a line ends, pause briefly, then continue (or finish).
  useEffect(() => {
    if (q.status !== 'waiting') return;
    const isLast = q.index >= q.lines.length - 1;
    const t = setTimeout(() => dispatch({ type: 'advance' }), isLast ? 250 : AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [q.status, q.index, q.lines.length]);

  // Finished or skipped: release the caller and let the gesture settle.
  useEffect(() => {
    if (q.status !== 'done' && q.status !== 'idle') return;
    stopClip();
    env.set([]);
    resolvers.current.get(q.token)?.();
    resolvers.current.delete(q.token);
    const token = q.token;
    const t = setTimeout(() => setSettled(token), GESTURE_TAIL_MS);
    return () => clearTimeout(t);
  }, [q.status, q.token, env]);

  // A new language means new lines; drop whatever was queued.
  useEffect(() => {
    dispatch({ type: 'skip' });
  }, [lang]);

  const say = useCallback((lines: Line[]) => {
    const token = ++tokenRef.current;
    // Anything still waiting on an older say() is released: it was replaced.
    for (const [t, resolve] of resolvers.current) {
      resolve();
      resolvers.current.delete(t);
    }
    return new Promise<void>((resolve) => {
      if (lines.length === 0) {
        resolve();
        return;
      }
      resolvers.current.set(token, resolve);
      dispatch({ type: 'say', lines, token });
    });
  }, []);

  const react = useCallback(
    async (text: string) => {
      const vec = await embedder.embed(text);
      const r = match(vec, text, lang, recent.current);
      recent.current = [r.lineId, ...recent.current].slice(0, 6);
      if (r.crisis !== 'block') await say([r.gesture ? { ...r.line, gesture: r.gesture } : r.line]);
      return r;
    },
    [embedder, lang, say],
  );

  const advance = useCallback(() => dispatch({ type: 'advance' }), []);
  const skip = useCallback(() => dispatch({ type: 'skip' }), []);

  const gesturing = talking || settled !== q.token;

  const value: Mentor = {
    say,
    react,
    advance,
    skip,
    current,
    last,
    status: q.status,
    mood,
    gesturing,
    durationMs,
    lineKey,
    speaking,
    glanceAt,
    quiet,
  };
  return <MentorContext value={value}>{children}</MentorContext>;
}

export function useMentor(): Mentor {
  const m = use(MentorContext);
  if (!m) throw new Error('useMentor must be used inside MentorProvider');
  return m;
}
