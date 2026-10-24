import { useEffect } from 'react';
import { useDerivedValue, useFrameCallback, useReducedMotion, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { arm, browPath, EYE_L, EYE_R, lidEdge, lidPath, lowLidEdge, lowLidPath, mouth } from './rig/geometry';
import { MOODS, PARAM_ORDER, POSES, type Gesture, type Mood, type ParamName } from './rig/params';
import { stepSprings } from './rig/spring';

const I = Object.fromEntries(PARAM_ORDER.map((p, i) => [p, i])) as Record<ParamName, number>;

type RigState = {
  x: number[];
  v: number[];
  t: number[];
  time: number;
  lidBase: number;
  jawRest: number;
  nextBlink: number;
  blinkUntil: number;
  doubleAt: number;
  nextSacc: number;
  sx: number;
  sy: number;
  gaze: [number, number];
  lookBackAt: number;
  pose: Gesture;
  lastPeak: number;
};

function initial(): RigState {
  const x = PARAM_ORDER.map(() => 0);
  const rest = POSES.rest;
  const seed: Partial<Record<ParamName, number>> = {
    ...MOODS.warm.targets,
    wx: rest.w[0],
    wy: rest.w[1],
    ex: rest.e[0],
    ey: rest.e[1],
    hr: rest.r,
    vis: 0,
  };
  for (const [k, val] of Object.entries(seed)) x[I[k as ParamName]] = val as number;
  return {
    x,
    v: PARAM_ORDER.map(() => 0),
    t: x.slice(),
    time: 0,
    lidBase: MOODS.warm.targets.lid ?? 0.12,
    jawRest: 0,
    nextBlink: 1.5,
    blinkUntil: 0,
    doubleAt: 0,
    nextSacc: 0.8,
    sx: 0,
    sy: 0,
    gaze: [0, 0],
    lookBackAt: 0,
    pose: 'rest',
    lastPeak: 0,
  };
}

/**
 * Ozan's life on the UI thread: springs, blinks, saccades, breathing, gestures
 * and the jaw following `speaking` (0..1). Returns animated values for the
 * renderer; nothing here touches the JS thread per frame. `active` false
 * freezes him (screen in the background). With Reduce Motion on he keeps his
 * hands down and his head still; blinks and the jaw stay.
 */
export function useRig(
  mood: Mood,
  gesturing: boolean,
  speaking: SharedValue<number>,
  glanceAt?: SharedValue<[number, number] | null>,
  active = true,
) {
  const st = useSharedValue<RigState>(initial());
  const still = useReducedMotion();

  useEffect(() => {
    const preset = MOODS[mood];
    st.modify((s) => {
      'worklet';
      for (const [k, val] of Object.entries(preset.targets)) s.t[I[k as ParamName]] = val as number;
      s.lidBase = preset.targets.lid ?? 0.12;
      s.jawRest = preset.targets.jaw ?? 0;
      s.gaze = [preset.gaze[0], preset.gaze[1]];
      s.lookBackAt = preset.lookBackMs ? s.time + preset.lookBackMs / 1000 : 0;
      return s;
    });
  }, [mood, st]);

  useEffect(() => {
    const pose = gesturing && !still ? MOODS[mood].gesture : 'rest';
    const p = POSES[pose];
    st.modify((s) => {
      'worklet';
      s.pose = pose;
      s.t[I.wx] = p.w[0];
      s.t[I.wy] = p.w[1];
      s.t[I.ex] = p.e[0];
      s.t[I.ey] = p.e[1];
      s.t[I.hr] = p.r;
      s.t[I.vis] = p.vis;
      return s;
    });
  }, [gesturing, mood, st, still]);

  const frame = useFrameCallback((info) => {
    'worklet';
    const dt = Math.min(0.05, (info.timeSincePreviousFrame ?? 16) / 1000);
    const glance = glanceAt ? glanceAt.value : null;
    const say = speaking.value;
    st.modify((s) => {
      'worklet';
      s.time += dt;

      // Blinks on irregular timers, sometimes doubled.
      if (s.time >= s.nextBlink) {
        s.blinkUntil = s.time + 0.095;
        s.nextBlink = s.time + 1.8 + Math.random() * 4.2;
        s.doubleAt = Math.random() < 0.22 ? s.time + 0.23 : 0;
      }
      if (s.doubleAt > 0 && s.time >= s.doubleAt) {
        s.blinkUntil = s.time + 0.095;
        s.doubleAt = 0;
      }
      s.t[I.lid] = s.time < s.blinkUntil ? 1 : s.lidBase;

      // Gaze: mood direction, tiny saccades, a glance at whatever was tapped.
      if (s.time >= s.nextSacc) {
        s.sx = (Math.random() - 0.5) * 0.22;
        s.sy = (Math.random() - 0.5) * 0.14;
        s.nextSacc = s.time + 0.7 + Math.random() * 1.9;
      }
      if (s.lookBackAt > 0 && s.time >= s.lookBackAt) {
        s.gaze = [0, 0];
        s.lookBackAt = 0;
      }
      s.t[I.gx] = glance ? glance[0] : s.gaze[0] + s.sx;
      s.t[I.gy] = glance ? glance[1] : s.gaze[1] + s.sy;

      // Jaw follows speech; peaks add small nods and hand beats.
      s.t[I.jaw] = Math.max(say, s.jawRest);
      if (say > 0.7 && s.time - s.lastPeak > 0.45) {
        s.lastPeak = s.time;
        if (!still && Math.random() < 0.3) s.v[I.nod] += 18;
        if (!still && (s.pose === 'open' || s.pose === 'raise') && Math.random() < 0.35) s.v[I.wy] -= 70;
      }

      stepSprings(s.x, s.v, s.t, dt);
      return s;
    });
  }, active);

  useEffect(() => {
    frame.setActive(active);
  }, [frame, active]);

  // st.modify notifies readers every frame, so derived values below re-run per frame.
  const x = (name: ParamName) => {
    'worklet';
    return st.value.x[I[name]];
  };

  const breath = useDerivedValue(() => {
    return Math.sin((st.value.time * 2 * Math.PI) / 4.6);
  });
  const time = useDerivedValue(() => {
    return st.value.time;
  });

  const bodyTransform = useDerivedValue(() => [{ scaleX: 1 + breath.value * 0.006 }, { scaleY: 1 + breath.value * 0.014 }]);
  const headTransform = useDerivedValue(() => {
    const t = st.value.time;
    const idle = still ? 0 : Math.sin(t * 0.37) * 1.2 + Math.sin(t * 0.91) * 0.5;
    return [
      { translateY: -breath.value * 1.6 + x('nod') * 0.12 },
      { rotate: ((x('tilt') + idle) * Math.PI) / 180 },
    ];
  });

  const lid = useDerivedValue(() => {
    return Math.max(x('lid'), x('squint') * 0.45);
  });
  const irisTransform = useDerivedValue(() => [{ translateX: x('gx') * 6.5 }, { translateY: x('gy') * 3.8 + lid.value * 2 }]);
  const lidL = useDerivedValue(() => lidPath(EYE_L.cx, lid.value));
  const lidR = useDerivedValue(() => lidPath(EYE_R.cx, lid.value));
  const lashL = useDerivedValue(() => lidEdge(EYE_L.cx, lid.value));
  const lashR = useDerivedValue(() => lidEdge(EYE_R.cx, lid.value));
  const lowL = useDerivedValue(() => lowLidPath(EYE_L.cx, x('squint')));
  const lowR = useDerivedValue(() => lowLidPath(EYE_R.cx, x('squint')));
  const lowLashL = useDerivedValue(() => lowLidEdge(EYE_L.cx, x('squint')));
  const lowLashR = useDerivedValue(() => lowLidEdge(EYE_R.cx, x('squint')));
  const lowLashOpacity = useDerivedValue(() => Math.min(1, x('squint') * 2));
  const crowOpacity = useDerivedValue(() => 0.25 + x('squint') * 0.75);
  const blush = useDerivedValue(() => x('blush'));
  const forehead = useDerivedValue(() => 0.22 + Math.min(1, Math.max(0, (x('browInL') + x('browInR')) / 2)) * 0.5);

  const browL = useDerivedValue(() => browPath(138, 108, 108, x('browInL'), x('browOutL')));
  const browR = useDerivedValue(() => browPath(162, 192, 108, x('browInR'), x('browOutR')));

  const m = useDerivedValue(() => {
    return mouth(x('smile'), x('jaw'));
  });
  const mouthInner = useDerivedValue(() => m.value.inner);
  const mouthLine = useDerivedValue(() => m.value.line);
  const mouthLineOpacity = useDerivedValue(() => m.value.lineOpacity);
  const mouthInnerOpacity = useDerivedValue(() => m.value.innerOpacity);
  const tongueY = useDerivedValue(() => m.value.lowerY - 2);
  const teethY = useDerivedValue(() => m.value.upperY - 3);
  const beardLow = useDerivedValue(() => [{ translateY: x('jaw') * 4.5 }]);
  const tuft = useDerivedValue(() => [{ translateY: m.value.lowerY + 6 - 190 }]);
  const stache = useDerivedValue(() => [{ translateY: -x('smile') * 1.8 + x('jaw') * 1.2 }]);

  const armGeom = useDerivedValue(() => {
    let wx = x('wx');
    let wy = x('wy');
    if (st.value.pose === 'beard') {
      wy += Math.sin(st.value.time * 2.4) * 4.5;
      wx += Math.sin(st.value.time * 1.2) * 1.5;
    }
    const g = arm(wx, wy, x('ex'), x('ey'));
    return { ...g, wx, wy };
  });
  const sleeve = useDerivedValue(() => armGeom.value.sleeve);
  const cuffTransform = useDerivedValue(() => [
    { translateX: armGeom.value.wx },
    { translateY: armGeom.value.wy },
    { rotate: (armGeom.value.cuffAngle * Math.PI) / 180 },
  ]);
  const handTransform = useDerivedValue(() => {
    const v = x('vis');
    return [
      { translateX: armGeom.value.wx },
      { translateY: armGeom.value.wy },
      { rotate: (x('hr') * Math.PI) / 180 },
      // At rest the hand slides back into the sleeve and shrinks behind the cuff.
      { translateY: (1 - v) * 26 },
      { scaleX: 0.45 + 0.55 * v },
      { scaleY: 0.45 + 0.55 * v },
    ];
  });
  const armTransform = useDerivedValue(() => [{ translateY: -breath.value * 1.2 }]);

  const glow = useDerivedValue(() => {
    const t = time.value;
    return 0.75 + Math.sin(t * 9.1) * 0.08 + Math.sin(t * 14.3) * 0.06 + Math.sin(t * 3.7) * 0.06;
  });
  const groundGlow = useDerivedValue(() => glow.value * 0.45);
  const flameScale = useDerivedValue(() => [{ scaleY: 1 + Math.sin(time.value * 11) * 0.12 }, { scaleX: 1 - Math.sin(time.value * 7) * 0.05 }]);

  return {
    bodyTransform,
    headTransform,
    irisTransform,
    lidL,
    lidR,
    lashL,
    lashR,
    lowL,
    lowR,
    lowLashL,
    lowLashR,
    lowLashOpacity,
    crowOpacity,
    blush,
    forehead,
    browL,
    browR,
    mouthInner,
    mouthLine,
    mouthLineOpacity,
    mouthInnerOpacity,
    tongueY,
    teethY,
    beardLow,
    tuft,
    stache,
    sleeve,
    cuffTransform,
    handTransform,
    armTransform,
    glow,
    groundGlow,
    flameScale,
  };
}

export type Rig = ReturnType<typeof useRig>;
