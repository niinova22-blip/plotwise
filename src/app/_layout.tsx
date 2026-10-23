import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useSchemeName, useTheme } from '@/hooks/use-theme';
import { MentorProvider } from '@/mentor/mentor-provider';
import { AppStoreProvider, useStore } from '@/store/app-store';

SplashScreen.preventAutoHideAsync();

function Root() {
  const { ready } = useStore();
  const scheme = useSchemeName();
  const theme = useTheme();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider
      value={{ ...base, colors: { ...base.colors, background: theme.background, card: theme.surface } }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <MentorProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        </Stack>
      </MentorProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStoreProvider>
        <Root />
      </AppStoreProvider>
    </SafeAreaProvider>
  );
}
