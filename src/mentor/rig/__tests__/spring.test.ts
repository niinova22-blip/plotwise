import { expect, test } from '@jest/globals';

import { LIMITS, MOODS, PARAM_ORDER, type ParamName } from '../params';
import { stepSprings } from '../spring';

function state(init: Partial<Record<ParamName, number>> = {}) {
  const x = new Float64Array(PARAM_ORDER.length);
  const v = new Float64Array(PARAM_ORDER.length);
  const t = new Float64Array(PARAM_ORDER.length);
  PARAM_ORDER.forEach((name, i) => {
    x[i] = init[name] ?? 0;
    t[i] = x[i];
  });
  return { x, v, t, at: (name: ParamName) => PARAM_ORDER.indexOf(name) };
}

test('stays bounded at dt=0.1 with the stiff lid spring', () => {
  const s = state();
  const lid = s.at('lid');
  s.t[lid] = 1;
  for (let frame = 0; frame < 50; frame++) {
    stepSprings(s.x, s.v, s.t, 0.1);
    expect(s.x[lid]).toBeGreaterThanOrEqual(LIMITS.lid[0]);
    expect(s.x[lid]).toBeLessThanOrEqual(LIMITS.lid[1]);
  }
});

test('converges to its target', () => {
  const s = state();
  const jaw = s.at('jaw');
  s.t[jaw] = 0.6;
  for (let frame = 0; frame < 60; frame++) stepSprings(s.x, s.v, s.t, 1 / 60);
  expect(Math.abs(s.x[jaw] - 0.6)).toBeLessThan(0.01);
});

test('clamps out-of-range targets and stops at the limit', () => {
  const s = state();
  const gx = s.at('gx');
  s.t[gx] = 5;
  for (let frame = 0; frame < 120; frame++) stepSprings(s.x, s.v, s.t, 1 / 60);
  expect(s.x[gx]).toBe(0.85);
  expect(s.v[gx]).toBe(0);
});

test('empathy raises the inner brows, holds the chest and speaks slower', () => {
  const m = MOODS.empathy;
  expect(m.targets.browInL!).toBeGreaterThan(m.targets.browOutL!);
  expect(m.gesture).toBe('chest');
  expect(m.rate).toBeLessThan(1);
});

test('thinking strokes the beard', () => {
  expect(MOODS.think.gesture).toBe('beard');
});
