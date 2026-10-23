import { describe, expect, test } from '@jest/globals';

import { MOODS } from '../../rig/params';
import { getScript, voicedLines } from '../index';
import type { Line } from '../types';

function allLines(value: unknown, out: Line[] = []): Line[] {
  if (Array.isArray(value)) value.forEach((v) => allLines(v, out));
  else if (value && typeof value === 'object') {
    if ('id' in value && 'text' in value) out.push(value as Line);
    else Object.values(value).forEach((v) => allLines(v, out));
  }
  return out;
}

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') {
    if ('id' in value && 'text' in value) return (value as Line).id;
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  }
  return value;
}

describe('mentor script', () => {
  test('en and tr have identical keys and ids', () => {
    expect(shape(getScript('tr'))).toEqual(shape(getScript('en')));
  });

  test('ids are unique', () => {
    for (const lang of ['en', 'tr'] as const) {
      const ids = voicedLines(lang).map((l) => l.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  test('no voiced text contains {placeholders} or is empty', () => {
    for (const lang of ['en', 'tr'] as const) {
      for (const l of voicedLines(lang)) {
        expect(l.text).not.toMatch(/[{}]/);
        expect(l.text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('every mood is valid', () => {
    for (const lang of ['en', 'tr'] as const) {
      for (const l of allLines(getScript(lang))) expect(Object.keys(MOODS)).toContain(l.mood);
    }
  });

  test('universal has at least 8 lines per language', () => {
    expect(getScript('en').universal.length).toBeGreaterThanOrEqual(8);
    expect(getScript('tr').universal.length).toBeGreaterThanOrEqual(8);
  });

  test('script lines stay short enough to speak', () => {
    for (const lang of ['en', 'tr'] as const) {
      for (const l of allLines(getScript(lang))) expect(l.text.split(/\s+/).length).toBeLessThanOrEqual(22);
    }
  });

  test('bank strings from the offline engine are voiced with stable ids', () => {
    const ids = voicedLines('en').map((l) => l.id);
    expect(ids).toContain('bank.clarify.career.0');
    expect(ids).toContain('bank.reframes.0.title');
    expect(ids.some((id) => id.startsWith('bank.future.twists.'))).toBe(true);
  });
});
