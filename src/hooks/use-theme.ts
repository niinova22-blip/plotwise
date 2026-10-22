import { useColorScheme } from 'react-native';

import { Colors, type Palette } from '@/constants/theme';
import { useStore } from '@/store/app-store';

export function useSchemeName(): 'light' | 'dark' {
  const system = useColorScheme();
  const pref = useStore().data.profile.theme;
  if (pref !== 'system') return pref;
  return system === 'dark' ? 'dark' : 'light';
}

export function useTheme(): Palette {
  return Colors[useSchemeName()];
}
