/**
 * Plotwise design tokens: Ozan's world. Cream paper, terracotta cloak, brass and
 * lantern-amber; each outcome-card kind keeps its own warm hue so the notebook
 * reads at a glance.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2A2420',
    textSecondary: '#6E6257',
    textTertiary: '#A09485',
    background: '#F6EFE3',
    surface: '#FFFBF4',
    surfaceAlt: '#EFE4D2',
    border: '#E6D8C2',
    accent: '#C2573A',
    accentDeep: '#9A4129',
    accentSoft: '#F6DED3',
    onAccent: '#FFFFFF',
    lantern: '#E8A33C',
    danger: '#B42318',
    assumption: '#B7791F',
    reframe: '#7457B8',
    experiment: '#3A7D58',
    future: '#2F6BA8',
    insight: '#C2573A',
  },
  dark: {
    text: '#F3EADD',
    textSecondary: '#B5A897',
    textTertiary: '#7D7264',
    background: '#17130F',
    surface: '#211B16',
    surfaceAlt: '#2B231C',
    border: '#3A2F25',
    accent: '#F08A5D',
    accentDeep: '#B8603C',
    accentSoft: '#3D2419',
    onAccent: '#1A120D',
    lantern: '#FFC861',
    danger: '#F97066',
    assumption: '#E8AE45',
    reframe: '#AE95F0',
    experiment: '#6CC79A',
    future: '#74ABEE',
    insight: '#F08A5D',
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
