import { expect, test } from '@jest/globals';

import { arm, browPath, EYE_L, lidEdge, lidPath, mouth } from '../geometry';

const nums = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

test('lash line is exactly the lid bottom edge', () => {
  for (const amount of [0, 0.3, 0.6, 1]) {
    const lid = nums(lidPath(EYE_L.cx, amount));
    const edge = nums(lidEdge(EYE_L.cx, amount));
    // lidPath: M x y H x V y Q cx cy x y Z → bottom-right y, control, bottom-left y
    const [, , , vY, qx, qy, , endY] = lid;
    expect(edge[1]).toBeCloseTo(vY);
    expect(edge[2]).toBeCloseTo(qx);
    expect(edge[3]).toBeCloseTo(qy);
    expect(edge[5]).toBeCloseTo(endY);
  }
});

test('a closed lid covers the whole eye', () => {
  const lid = nums(lidPath(EYE_L.cx, 1));
  expect(Math.min(lid[3], lid[5], lid[7])).toBeGreaterThanOrEqual(134);
});

test('the mouth never turns inside out', () => {
  for (let smile = 0; smile <= 1.05; smile += 0.15) {
    for (let jaw = 0; jaw <= 1; jaw += 0.1) {
      const m = mouth(smile, jaw);
      expect(m.lowerY).toBeGreaterThan(m.upperY);
    }
  }
});

test('the sleeve is a closed filled outline, not a stroke', () => {
  const { sleeve } = arm(86, 252, 60, 298);
  expect(sleeve.startsWith('M')).toBe(true);
  expect(sleeve.trim().endsWith('Z')).toBe(true);
});

test('raised inner brows sit higher than their outer ends', () => {
  const d = nums(browPath(138, 108, 108, 1.1, -0.45));
  const innerY = d[1];
  const outerY = d[d.length - 1];
  expect(innerY).toBeLessThan(outerY);
});
