import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

/** Step progress drawn as a path with a glowing lantern at the current stop. */
export function Journey({ total, current }: { total: number; current: number }) {
  const theme = useTheme();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.set(withRepeat(withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1400 })), -1));
  }, [pulse]);

  const halo = useAnimatedStyle(() => ({ opacity: 0.25 + pulse.value * 0.3, transform: [{ scale: 1 + pulse.value * 0.25 }] }));
  const span = Math.max(1, total - 1);

  return (
    <View style={styles.row} accessibilityLabel={`${current + 1} / ${total}`}>
      <View style={[styles.track, { backgroundColor: theme.border }]} />
      <View style={[styles.done, { backgroundColor: theme.accent, width: `${(current / span) * 100}%` }]} />
      {Array.from({ length: total }, (_, i) => {
        const left = `${(i / span) * 100}%` as const;
        if (i === current)
          return (
            <View key={i} style={[styles.stop, { left }]}>
              <Animated.View style={[styles.halo, { backgroundColor: theme.lantern }, halo]} />
              <View style={[styles.lantern, { backgroundColor: theme.lantern, borderColor: theme.surface }]} />
            </View>
          );
        return (
          <View key={i} style={[styles.stop, { left }]}>
            <View style={[styles.dot, { backgroundColor: i < current ? theme.accent : theme.surfaceAlt, borderColor: theme.border }]} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 26, justifyContent: 'center', marginHorizontal: 13 },
  track: { position: 'absolute', left: 0, right: 0, height: 3, borderRadius: 2 },
  done: { position: 'absolute', left: 0, height: 3, borderRadius: 2 },
  stop: { position: 'absolute', width: 26, height: 26, marginLeft: -13, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: StyleSheet.hairlineWidth },
  halo: { position: 'absolute', width: 26, height: 26, borderRadius: 13 },
  lantern: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
});
