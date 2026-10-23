import { LIMITS, PARAM_ORDER, SPRINGS } from './params';

const LO = PARAM_ORDER.map((p) => LIMITS[p][0]);
const HI = PARAM_ORDER.map((p) => LIMITS[p][1]);
const K = PARAM_ORDER.map((p) => SPRINGS[p].k);
const C = PARAM_ORDER.map((p) => 2 * Math.sqrt(SPRINGS[p].k) * SPRINGS[p].z);
const MAX_STEP = 0.004;

/** Float64Array in tests, plain arrays inside Reanimated shared state. */
export type NumArray = { [i: number]: number; readonly length: number };

/**
 * Advances every parameter spring by dt seconds, in place. Fixed substeps keep
 * stiff springs stable when frames are dropped; clamping keeps every feature
 * inside its socket.
 */
export function stepSprings(x: NumArray, v: NumArray, t: NumArray, dt: number): void {
  'worklet';
  const steps = Math.max(1, Math.ceil(dt / MAX_STEP));
  const h = dt / steps;
  for (let n = 0; n < steps; n++) {
    for (let i = 0; i < x.length; i++) {
      const a = K[i] * (t[i] - x[i]) - C[i] * v[i];
      v[i] += a * h;
      x[i] += v[i] * h;
    }
  }
  for (let i = 0; i < x.length; i++) {
    if (x[i] < LO[i]) {
      x[i] = LO[i];
      v[i] = 0;
    } else if (x[i] > HI[i]) {
      x[i] = HI[i];
      v[i] = 0;
    }
  }
}
