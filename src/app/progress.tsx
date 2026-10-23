import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, KindBadge, Screen, Txt } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import { fmt } from '@/i18n';
import { useStore } from '@/store/app-store';
import { computeProgress, EXERCISE_TYPES } from '@/store/progress';
import type { CardKind } from '@/store/types';

function Stat({ value, label }: { value: number; label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Txt variant="title">{value}</Txt>
      <Txt variant="small" color="textSecondary">
        {label}
      </Txt>
    </View>
  );
}

export default function ProgressScreen() {
  const { s } = useI18n();
  const { data } = useStore();
  const theme = useTheme();
  const [now] = useState(() => Date.now());
  const p = computeProgress(data, now);
  const maxType = Math.max(1, ...EXERCISE_TYPES.map((t) => p.exerciseTypes[t]));
  const kinds = (Object.keys(p.cards) as CardKind[]).filter((k) => p.cards[k] > 0);
  const empty = data.sessions.length === 0 && data.training.length === 0;

  return (
    <Screen title={s.progress.title}>
      <Txt variant="display">{s.progress.title}</Txt>
      <Txt color="textSecondary">{s.progress.intro}</Txt>

      {empty ? (
        <Card>
          <Txt>{s.progress.empty}</Txt>
          <Button label={s.progress.startTraining} onPress={() => router.replace('/train')} />
        </Card>
      ) : (
        <>
          <View style={styles.stats}>
            <Stat value={p.sessions.lab} label={s.progress.labSessions} />
            <Stat value={p.sessions.future} label={s.progress.futures} />
            <Stat value={p.sessions.train} label={s.progress.exercises} />
          </View>

          <Card>
            <Txt variant="caption" color="textSecondary">
              {s.progress.rhythm}
            </Txt>
            <View style={styles.grid}>
              {[0, 7, 14, 21].map((start) => (
                <View key={start} style={styles.gridRow}>
                  {p.recent.slice(start, start + 7).map((d) => (
                    <View
                      key={d.day}
                      style={[styles.cell, { backgroundColor: d.active ? theme.experiment : theme.surfaceAlt }]}
                    />
                  ))}
                </View>
              ))}
            </View>
            <Txt variant="small" color="textSecondary">
              {p.streak > 0 ? fmt(s.progress.streak, { count: p.streak }) : s.progress.noStreak}
            </Txt>
          </Card>

          {p.experimentsPlanned > 0 && (
            <Card accent="experiment">
              <Txt variant="caption" color="experiment">
                {s.progress.experiments}
              </Txt>
              <Txt variant="heading">
                {fmt(s.progress.experimentsStat, {
                  reflected: p.experimentsReflected,
                  planned: p.experimentsPlanned,
                })}
              </Txt>
              <Txt variant="small" color="textSecondary">
                {s.progress.experimentsHint}
              </Txt>
            </Card>
          )}

          {data.training.length > 0 && (
            <Card>
              <Txt variant="caption" color="textSecondary">
                {s.progress.variety}
              </Txt>
              {EXERCISE_TYPES.map((t) => (
                <View key={t} style={styles.barRow}>
                  <Txt variant="small" style={styles.barLabel} numberOfLines={1}>
                    {s.train.types[t]}
                  </Txt>
                  <View style={[styles.barTrack, { backgroundColor: theme.surfaceAlt }]}>
                    <View
                      style={[
                        styles.barFill,
                        { backgroundColor: theme.reframe, width: `${(p.exerciseTypes[t] / maxType) * 100}%` },
                      ]}
                    />
                  </View>
                  <Txt variant="small" color="textSecondary" style={styles.barCount}>
                    {p.exerciseTypes[t]}
                  </Txt>
                </View>
              ))}
              {p.suggestType && (
                <Txt variant="small" color="textSecondary">
                  {fmt(s.progress.suggest, { type: s.train.types[p.suggestType] })}
                </Txt>
              )}
            </Card>
          )}

          {kinds.length > 0 && (
            <Card onPress={() => router.push('/notebook')}>
              <Txt variant="caption" color="textSecondary">
                {s.progress.cards}
              </Txt>
              {kinds.map((k) => (
                <View key={k} style={styles.kindRow}>
                  <KindBadge kind={k} />
                  <Txt variant="heading">{p.cards[k]}</Txt>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
      <View style={styles.bottom} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: Spacing.two },
  stat: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  grid: { gap: 6 },
  gridRow: { flexDirection: 'row', gap: 6 },
  cell: { flex: 1, maxWidth: 36, aspectRatio: 1, borderRadius: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  barLabel: { width: 150 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  barCount: { width: 24, textAlign: 'right' },
  kindRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottom: { height: Spacing.four },
});
