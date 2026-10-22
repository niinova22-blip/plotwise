import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Chip, Gap, Row, Screen, Steps, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/hooks/use-i18n';
import type { Lang } from '@/i18n';
import { useStore } from '@/store/app-store';
import type { Goal, Profile } from '@/store/types';

const GOALS: Goal[] = ['career', 'startup', 'creativity', 'personal', 'general'];
const MINUTES: Profile['minutes'][] = [5, 10, 15];
const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'tr', label: 'Türkçe' },
];

export default function Onboarding() {
  const { data, dispatch } = useStore();
  const { s, lang } = useI18n();
  const [step, setStep] = useState(0);
  const { goals, minutes } = data.profile;
  const patch = (p: Partial<Profile>) => dispatch({ type: 'profile', patch: p });

  const next = () => {
    if (step < 4) return setStep(step + 1);
    patch({ onboarded: true });
    router.replace('/');
  };

  const footer = (
    <Button
      label={step === 0 ? s.onboarding.start : step === 4 ? s.onboarding.finish : s.common.continue}
      onPress={next}
      disabled={step === 2 && goals.length === 0}
    />
  );

  return (
    <Screen back={false} footer={footer}>
      <Gap size="four" />
      {step > 0 && <Steps total={4} current={step - 1} />}
      <Gap size="three" />

      {step === 0 && (
        <View style={styles.hero}>
          <Image source={require('@/assets/images/splash-icon.png')} style={styles.logo} contentFit="contain" />
          <Txt variant="caption" color="accent">
            {s.app.name}
          </Txt>
          <Txt variant="display">{s.onboarding.welcomeTitle}</Txt>
          <Txt color="textSecondary">{s.onboarding.welcomeBody}</Txt>
        </View>
      )}

      {step === 1 && (
        <>
          <Txt variant="title">{s.onboarding.languageTitle}</Txt>
          {LANGS.map((l) => (
            <Card key={l.id} selected={lang === l.id} onPress={() => patch({ lang: l.id })}>
              <Txt variant="heading">{l.label}</Txt>
            </Card>
          ))}
        </>
      )}

      {step === 2 && (
        <>
          <Txt variant="title">{s.onboarding.goalsTitle}</Txt>
          <Txt color="textSecondary">{s.onboarding.goalsHint}</Txt>
          <Row>
            {GOALS.map((g) => (
              <Chip
                key={g}
                label={s.goals[g]}
                selected={goals.includes(g)}
                onPress={() =>
                  patch({ goals: goals.includes(g) ? goals.filter((x) => x !== g) : [...goals, g] })
                }
              />
            ))}
          </Row>
        </>
      )}

      {step === 3 && (
        <>
          <Txt variant="title">{s.onboarding.minutesTitle}</Txt>
          {MINUTES.map((m) => (
            <Card key={m} selected={minutes === m} onPress={() => patch({ minutes: m })}>
              <Txt variant="heading">
                {m} {s.onboarding.minutesUnit}
              </Txt>
            </Card>
          ))}
        </>
      )}

      {step === 4 && (
        <>
          <Txt variant="title">{s.onboarding.promiseTitle}</Txt>
          {s.onboarding.promiseItems.map((item, i) => (
            <Card key={i} accent="accent">
              <Txt>{item}</Txt>
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: Spacing.three, paddingTop: Spacing.five },
  logo: { width: 96, height: 96, marginLeft: -Spacing.three },
});
