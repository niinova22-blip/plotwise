/**
 * Ozan's rig: every visible feature is driven by one of these parameters.
 * Values follow springs (see spring.ts) and are clamped to LIMITS so no
 * feature can slide out of its place, whatever the frame rate.
 */

export const PARAM_ORDER = [
  'smile', 'jaw', 'lid', 'squint',
  'browInL', 'browOutL', 'browInR', 'browOutR',
  'gx', 'gy', 'tilt', 'nod', 'blush',
  'wx', 'wy', 'ex', 'ey', 'hr', 'vis',
] as const;

export type ParamName = (typeof PARAM_ORDER)[number];

export const LIMITS: Record<ParamName, [number, number]> = {
  smile: [0, 1.05],
  jaw: [0, 1],
  lid: [-0.12, 1],
  squint: [0, 0.85],
  browInL: [-0.4, 1.15],
  browOutL: [-0.5, 1.1],
  browInR: [-0.4, 1.15],
  browOutR: [-0.5, 1.1],
  gx: [-0.85, 0.85],
  gy: [-0.75, 0.75],
  tilt: [-9, 9],
  nod: [-25, 25],
  blush: [0, 0.8],
  // Arm positions live in the 300×330 rig space.
  wx: [40, 200],
  wy: [180, 320],
  ex: [30, 180],
  ey: [240, 320],
  hr: [-40, 90],
  vis: [0, 1],
};

const SOFT = { k: 60, z: 0.92 };
const ARM = { k: 55, z: 0.9 };
const GAZE = { k: 520, z: 0.95 };

export const SPRINGS: Record<ParamName, { k: number; z: number }> = {
  smile: SOFT,
  jaw: { k: 520, z: 0.8 },
  lid: { k: 900, z: 1 },
  squint: SOFT,
  browInL: SOFT,
  browOutL: SOFT,
  browInR: SOFT,
  browOutR: SOFT,
  gx: GAZE,
  gy: GAZE,
  tilt: { k: 28, z: 0.85 },
  nod: { k: 90, z: 0.7 },
  blush: SOFT,
  wx: ARM,
  wy: ARM,
  ex: ARM,
  ey: ARM,
  hr: ARM,
  vis: { k: 70, z: 1 },
};

export type Mood = 'warm' | 'empathy' | 'happy' | 'think' | 'curious';
export type Gesture = 'rest' | 'open' | 'raise' | 'chest' | 'beard';

export type MoodPreset = {
  targets: Partial<Record<ParamName, number>>;
  gesture: Gesture;
  /** Where the eyes rest while this mood holds, -1..1. */
  gaze: [number, number];
  /** Look back at the user after this long. */
  lookBackMs?: number;
  /** Speaking-speed multiplier and pause multiplier. */
  rate: number;
  pause: number;
};

const face = (smile: number, lid: number, squint: number, browIn: number, browOut: number, tilt: number, blush: number, browR?: [number, number]) => ({
  smile,
  lid,
  squint,
  browInL: browIn,
  browOutL: browOut,
  browInR: browR ? browR[0] : browIn,
  browOutR: browR ? browR[1] : browOut,
  tilt,
  blush,
});

export const MOODS: Record<Mood, MoodPreset> = {
  warm: { targets: face(0.45, 0.12, 0.15, 0.1, 0.1, -2, 0.4), gesture: 'open', gaze: [0, 0], rate: 1, pause: 1 },
  empathy: { targets: face(0.12, 0.2, 0.05, 1.1, -0.45, -7, 0.3), gesture: 'chest', gaze: [0, 0.55], lookBackMs: 900, rate: 0.78, pause: 1.6 },
  happy: { targets: face(1, 0.2, 0.75, 0.45, 0.35, 3, 0.65), gesture: 'raise', gaze: [0, 0], rate: 1.12, pause: 0.8 },
  think: { targets: face(0.15, 0.18, 0.2, -0.1, 0.1, 4, 0.3, [0.2, 0.95]), gesture: 'beard', gaze: [-0.75, -0.7], lookBackMs: 1500, rate: 0.88, pause: 1.4 },
  curious: { targets: { ...face(0.3, -0.08, 0, 0.85, 0.85, -3, 0.4), jaw: 0.18 }, gesture: 'open', gaze: [0, 0], rate: 1.05, pause: 1 },
};

/** Wrist, elbow and hand rotation for each gesture; vis = hand out of the sleeve. */
export const POSES: Record<Gesture, { w: [number, number]; e: [number, number]; r: number; vis: 0 | 1 }> = {
  rest: { w: [139, 291], e: [96, 302], r: 80, vis: 0 },
  open: { w: [86, 252], e: [60, 298], r: -14, vis: 1 },
  raise: { w: [78, 228], e: [52, 278], r: -22, vis: 1 },
  chest: { w: [128, 274], e: [86, 304], r: 48, vis: 1 },
  beard: { w: [138, 244], e: [92, 304], r: 18, vis: 1 },
};
