import { Redirect, router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { dailyCount } from '@/exercises/generator';
import { Card, Screen, tap, Txt } from '@/components/ui';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import { fmt } from '@/i18n';
import { useMentor } from '@/mentor/mentor-provider';
import { getScript } from '@/mentor/script';
import { MentorStage } from '@/mentor/stage';
import { useNarration } from '@/mentor/use-narration';
import { useStore } from '@/store/app-store';
import { dayKey, weekDayKeys } from '@/store/ids';

function greeting(s: ReturnType<typeof useI18n>['s']) {
  const h = new Date().getHours();
  return h < 12 ? s.home.greetingMorning : h < 18 ? s.home.greetingAfternoon : s.home.greetingEvening;
}

function Door({
  index,
  title,
  body,
  color,
  href,
}: {
  index: string;
  title: string;
  body: string;
  color: ThemeColor;
  href: Href;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => {
        tap();
        router.push(href);
      }}
      style={({ pressed }) => [
        styles.door,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <Txt variant="caption" color={color}>
        {index}
      </Txt>
      <Txt variant="title">{title}</Txt>
      <Txt color="textSecondary">{body}</Txt>
      <View style={[styles.doorArrow, { backgroundColor: theme[color] }]}>
        <Txt variant="heading" color="onAccent">
          →
        </Txt>
      </View>
    </Pressable>
  );
}

export default function Home() {
  const { data } = useStore();
  const { s, lang } = useI18n();
  const theme = useTheme();
  const mentor = useMentor();
  const [now] = useState(() => Date.now());
  const today = dayKey(now);
  const doneToday = data.training.filter((t) => t.day === today).length;
  const activeToday = doneToday > 0 || data.sessions.some((x) => dayKey(x.createdAt) === today);
  const script = getScript(lang);
  const dueFollowUp = data.cards.find(
    (c) => c.kind === 'experiment' && c.followUpAt && c.followUpAt <= now && !c.followUpNote,
  );
  // A waiting experiment check-in comes first; it is the thread back to an earlier session.
  const greet = dueFollowUp ? script.home.followUp : activeToday ? script.home.returning : script.home.first;
  useNarration(data.profile.onboarded ? greet : null, `home-${lang}-${dueFollowUp?.id ?? ''}`);

  if (!data.profile.onboarded) return <Redirect href="/onboarding" />;

  const trainingDone = doneToday >= dailyCount(data.profile.minutes);
  const week = weekDayKeys(now);
  const practiced = new Set(data.training.map((t) => t.day));
  const weekCount = week.filter((d) => practiced.has(d)).length;
  const header = (
    <View style={styles.topRow}>
      <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.push('/notebook')}>
        <Txt variant="small" color="textSecondary">
          {s.home.notebook}
        </Txt>
      </Pressable>
      <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.push('/settings')}>
        <Txt variant="small" color="textSecondary">
          {s.home.settings}
        </Txt>
      </Pressable>
    </View>
  );

  return (
    <Screen back={false}>
      {header}
      {mentor.quiet ? (
        <View style={styles.intro}>
          <Txt variant="caption" color="textSecondary">
            {greeting(s)}
          </Txt>
          <Txt variant="display">{s.home.question}</Txt>
        </View>
      ) : (
        <View style={styles.stage}>
          <MentorStage />
        </View>
      )}

      {dueFollowUp && (
        <Card accent="experiment" onPress={() => router.push(`/notebook/${dueFollowUp.id}`)}>
          <Txt variant="caption" color="experiment">
            {s.home.followUp}
          </Txt>
          <Txt variant="heading">{dueFollowUp.title}</Txt>
        </Card>
      )}

      <Door index="01" title={s.home.labTitle} body={s.home.labBody} color="reframe" href="/lab" />
      <Door index="02" title={s.home.futureTitle} body={s.home.futureBody} color="future" href="/future" />
      <Door
        index="03"
        title={s.home.trainTitle}
        body={trainingDone ? s.home.todayDone : fmt(s.home.trainBody, { minutes: data.profile.minutes })}
        color="experiment"
        href="/train"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={s.home.seeProgress}
        onPress={() => router.push('/progress')}
        style={styles.week}>
        <View style={styles.weekDots}>
          {week.map((d) => (
            <View
              key={d}
              style={[
                styles.weekDot,
                { backgroundColor: practiced.has(d) ? theme.experiment : theme.surfaceAlt },
                d === today && { borderWidth: 2, borderColor: theme.text },
              ]}
            />
          ))}
        </View>
        <Txt variant="small" color="textSecondary">
          {fmt(s.home.weekStat, { count: weekCount })}
        </Txt>
        <Txt variant="small" color="accent">
          {s.home.seeProgress}
        </Txt>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.three,
  },
  intro: { gap: Spacing.two, paddingVertical: Spacing.four },
  stage: { paddingTop: Spacing.two },
  door: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  doorArrow: {
    position: 'absolute',
    right: Spacing.four,
    top: Spacing.four,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  week: { alignItems: 'center', gap: Spacing.two, paddingTop: Spacing.three },
  weekDots: { flexDirection: 'row', gap: Spacing.two },
  weekDot: { width: 14, height: 14, borderRadius: 7 },
});
