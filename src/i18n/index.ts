import { getLocales } from 'expo-localization';

import en, { type Dict } from './en';
import tr from './tr';

export type Lang = 'en' | 'tr';

export const dictionaries: Record<Lang, Dict> = { en, tr };

export function deviceLang(): Lang {
  const code = getLocales()[0]?.languageCode;
  return code === 'tr' ? 'tr' : 'en';
}

/** Replaces `{name}` placeholders with values. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export type { Dict };
