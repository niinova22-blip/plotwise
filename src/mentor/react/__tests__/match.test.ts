import { describe, expect, test } from '@jest/globals';

import { match, type Prototype } from '../match';

const norm = (v: number[]) => {
  const n = Math.hypot(...v);
  return Float32Array.from(v.map((x) => x / n));
};

// Hand-made 3-d space: x = work people, y = money worry, z = crisis.
const PROTOS: Prototype[] = [
  { id: 'work_people', vec: norm([1, 0, 0]) },
  { id: 'money_worry', vec: norm([0, 1, 0]) },
  { id: 'crisis_hopeless', vec: norm([0, 0, 1]), crisis: true },
];

describe('match', () => {
  test('a confident match picks a line for that situation', () => {
    const r = match(norm([1, 0.05, 0]), 'x', 'en', [], PROTOS);
    expect(r.situation).toBe('work_people');
    expect(r.lineId.startsWith('react.work_people.')).toBe(true);
    expect(r.crisis).toBeNull();
  });

  test('below the threshold falls back to a universal line', () => {
    const r = match(norm([1, 1, 0.9]), 'x', 'en', [], PROTOS.slice(0, 2));
    expect(r.situation).toBeNull();
    expect(r.lineId.startsWith('universal.')).toBe(true);
  });

  test('a small margin between the top two is treated as unsure', () => {
    const r = match(norm([1, 0.97, 0]), 'x', 'en', [], PROTOS.slice(0, 2));
    expect(r.situation).toBeNull();
  });

  test('a recently used line is avoided when another exists', () => {
    const first = match(norm([1, 0, 0]), 'x', 'en', [], PROTOS);
    const second = match(norm([1, 0, 0]), 'x', 'en', [first.lineId], PROTOS);
    expect(second.lineId).not.toBe(first.lineId);
    expect(second.situation).toBe('work_people');
  });

  test('without a vector it uses keywords, then a universal line', () => {
    expect(match(null, "I can't sleep and work is killing me", 'en', [], PROTOS).lineId).toMatch(/^(react|universal)\./);
    expect(match(null, 'zzz', 'en', [], PROTOS).lineId.startsWith('universal.')).toBe(true);
  });

  test('odd input never throws', () => {
    for (const text of ['', '🙂🙂', 'a'.repeat(5000), 'Bugün iyiyim but tired']) {
      expect(() => match(null, text, 'tr', [], PROTOS)).not.toThrow();
    }
  });

  test('an embedding-only crisis match offers support without blocking', () => {
    const r = match(norm([0, 0.2, 1]), 'everything is grey', 'en', [], PROTOS);
    expect(r.crisis).toBe('offer');
  });
});

describe('crisis phrases', () => {
  test('a hard day is not a crisis', () => {
    expect(match(null, 'Bugün berbat bir gündü', 'tr', [], PROTOS).crisis).toBeNull();
    expect(match(null, 'I had a terrible day', 'en', [], PROTOS).crisis).toBeNull();
  });

  test('a crisis phrase after 2,000 characters still blocks', () => {
    const long = 'I keep thinking about work. '.repeat(90) + 'I want to die';
    expect(long.length).toBeGreaterThan(2000);
    expect(match(null, long, 'en', [], PROTOS).crisis).toBe('block');
  });

  test('explicit phrases block', () => {
    expect(match(null, 'ölmek istiyorum', 'tr', [], PROTOS).crisis).toBe('block');
    expect(match(norm([1, 0, 0]), 'I want to die', 'en', [], PROTOS).crisis).toBe('block');
  });
});
