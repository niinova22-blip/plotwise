import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View, type GestureResponderEvent } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';

import { useMentor } from './mentor-provider';
import { OzanHost } from './ozan-host';

const GLANCE_MS = 450;

/** Reveals the subtitle word by word over the line's duration. */
function useReveal(text: string, durationMs: number, lineKey: number) {
  const words = text.split(' ');
  // Progress is tagged with its line, so a new line starts from zero without a reset.
  const [rev, setRev] = useState({ key: -1, shown: 0 });
  useEffect(() => {
    const start = Date.now();
    const per = Math.max(40, durationMs / Math.max(1, words.length));
    const t = setInterval(() => {
      const n = Math.min(words.length, Math.ceil((Date.now() - start) / per));
      setRev({ key: lineKey, shown: n });
      if (n >= words.length) clearInterval(t);
    }, 60);
    return () => clearInterval(t);
  }, [lineKey, durationMs, words.length]);
  const shown = rev.key === lineKey ? rev.shown : 0;
  return { before: words.slice(0, shown).join(' '), after: words.slice(shown).join(' ') };
}

/** Ozan with his speech bubble. Tap to move on; Skip jumps to the step's actions. */
export function MentorStage({ size }: { size?: number }) {
  const m = useMentor();
  const theme = useTheme();
  const { s } = useI18n();
  const { width } = useWindowDimensions();
  const ozanSize = size ?? Math.min(260, width * 0.62);
  const line = m.current ?? m.last;
  const talking = m.status === 'speaking' || m.status === 'waiting';
  const { before, after } = useReveal(line?.text ?? '', talking ? m.durationMs : 0, m.lineKey);

  if (m.quiet) return null;

  function onTap(e: GestureResponderEvent) {
    // He glances at where you tapped before carrying on.
    const { locationX, locationY } = e.nativeEvent;
    m.glanceAt.set([
      Math.max(-1, Math.min(1, (locationX - ozanSize / 2) / (ozanSize / 2))),
      Math.max(-1, Math.min(1, (locationY - ozanSize * 0.45) / (ozanSize / 2))),
    ]);
    setTimeout(() => m.glanceAt.set(null), GLANCE_MS);
    if (talking) m.advance();
  }

  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" accessibilityLabel={line?.text ?? s.mentor.name} onPress={onTap} style={styles.tap}>
        <OzanHost size={ozanSize} mood={m.mood} gesturing={m.gesturing} speaking={m.speaking} glanceAt={m.glanceAt} />
        {line && (
          <Animated.View
            key={m.lineKey}
            entering={FadeIn.duration(220)}
            style={[styles.bubble, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.tail, { backgroundColor: theme.surface, borderColor: theme.border }]} />
            <Txt style={styles.text}>
              {talking ? before : line.text}
              {talking && after ? <Txt style={styles.hidden}>{` ${after}`}</Txt> : null}
            </Txt>
          </Animated.View>
        )}
      </Pressable>
      {talking && (
        <Pressable accessibilityRole="button" hitSlop={12} onPress={m.skip} style={styles.skip}>
          <Txt variant="small" color="textSecondary">
            {s.mentor.skip}
          </Txt>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  tap: { alignItems: 'center', width: '100%' },
  bubble: {
    marginTop: Spacing.two,
    width: '100%',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    minHeight: 64,
    justifyContent: 'center',
  },
  tail: {
    position: 'absolute',
    top: -7,
    alignSelf: 'center',
    width: 14,
    height: 14,
    transform: [{ rotate: '45deg' }],
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  text: { fontSize: 17, lineHeight: 25, textAlign: 'center' },
  hidden: { opacity: 0 },
  skip: { position: 'absolute', right: 0, top: 0, padding: Spacing.two },
});
