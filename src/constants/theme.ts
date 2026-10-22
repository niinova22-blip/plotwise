/**
 * Plotwise design tokens. Warm paper + ink palette with a single ember accent;
 * each outcome-card kind gets its own quiet hue so the notebook reads at a glance.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#17171B',
    textSecondary: '#6B6A70',
    textTertiary: '#9A989F',
    background: '#F5F3EE',
    surface: '#FFFFFF',
    surfaceAlt: '#ECE9E2',
    border: '#E2DED5',
    accent: '#C2552D',
    accentSoft: '#F5E1D7',
    onAccent: '#FFFFFF',
    danger: '#B42318',
    assumption: '#B7791F',
    reframe: '#6B4FBB',
    experiment: '#2F7D5B',
    future: '#2B6CB0',
    insight: '#C2552D',
  },
  dark: {
    text: '#F2F0EA',
    textSecondary: '#A09EA6',
    textTertiary: '#6E6C74',
    background: '#0F0F12',
    surface: '#18181C',
    surfaceAlt: '#222228',
    border: '#2A2A30',
    accent: '#F07A4E',
    accentSoft: '#3A2219',
    onAccent: '#0F0F12',
    danger: '#F97066',
    assumption: '#E2A93B',
    reframe: '#A48AF0',
    experiment: '#5CC495',
    future: '#68A6F0',
    insight: '#F07A4E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Palette = { [K in ThemeColor]: string };

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
} as const;

export const MaxContentWidth = 640;
