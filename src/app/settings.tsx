import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Share } from 'react-native';

import { Button, Card, Chip, Gap, Row, Screen, Txt } from '@/components/ui';
import { useI18n } from '@/hooks/use-i18n';
import { cancelAllReminders } from '@/notifications';
import type { Lang } from '@/i18n';
import { useStore, wipeStorage } from '@/store/app-store';
import type { Goal, Profile, ThemePref } from '@/store/types';

const GOALS: Goal[] = ['career', 'startup', 'creativity', 'personal', 'general'];

export default function Settings() {
  const { s } = useI18n();
  const { data, dispatch } = useStore();
  const { profile } = data;
  const [confirm, setConfirm] = useState(false);
  const patch = (p: Partial<Profile>) => dispatch({ type: 'profile', patch: p });

  const langs: { id: Lang | null; label: string }[] = [
    { id: null, label: s.settings.system },
    { id: 'en', label: 'English' },
    { id: 'tr', label: 'Türkçe' },
  ];
  const themes: ThemePref[] = ['system', 'light', 'dark'];

  async function exportData() {
    const { installId: _omit, ...profileOut } = data.profile;
    await Share.share({
      title: 'Plotwise export',
      message: JSON.stringify({ ...data, profile: profileOut }, null, 2),
    });
  }

  async function deleteAll() {
    if (!confirm) return setConfirm(true);
    await wipeStorage();
    await cancelAllReminders();
    dispatch({ type: 'reset' });
    router.replace('/onboarding');
  }

  return (
    <Screen title={s.settings.title}>
      <Txt variant="display">{s.settings.title}</Txt>

      <Txt variant="caption" color="textSecondary">
        {s.settings.language}
      </Txt>
      <Row>
        {langs.map((l) => (
          <Chip key={l.label} label={l.label} selected={profile.lang === l.id} onPress={() => patch({ lang: l.id })} />
        ))}
      </Row>

      <Txt variant="caption" color="textSecondary">
        {s.settings.theme}
      </Txt>
      <Row>
        {themes.map((t) => (
          <Chip key={t} label={s.settings.themes[t]} selected={profile.theme === t} onPress={() => patch({ theme: t })} />
        ))}
      </Row>

      <Txt variant="caption" color="textSecondary">
        {s.settings.mentor}
      </Txt>
      <Row>
        <Txt variant="small" color="textSecondary">
          {s.settings.mentorVoice}
        </Txt>
        <Chip label={s.settings.on} selected={profile.mentorVoice} onPress={() => patch({ mentorVoice: true })} />
        <Chip label={s.settings.off} selected={!profile.mentorVoice} onPress={() => patch({ mentorVoice: false })} />
      </Row>
      <Row>
        <Txt variant="small" color="textSecondary">
          {s.settings.quietMode}
        </Txt>
        <Chip label={s.settings.on} selected={profile.quietMode} onPress={() => patch({ quietMode: true })} />
        <Chip label={s.settings.off} selected={!profile.quietMode} onPress={() => patch({ quietMode: false })} />
      </Row>
      <Txt variant="small" color="textTertiary">
        {s.settings.quietHint}
      </Txt>

      <Txt variant="caption" color="textSecondary">
        {s.settings.dailyMinutes}
      </Txt>
      <Row>
        {([5, 10, 15] as const).map((m) => (
          <Chip
            key={m}
            label={`${m} ${s.onboarding.minutesUnit}`}
            selected={profile.minutes === m}
            onPress={() => patch({ minutes: m })}
          />
        ))}
      </Row>

      <Txt variant="caption" color="textSecondary">
        {s.settings.interests}
      </Txt>
      <Row>
        {GOALS.map((g) => (
          <Chip
            key={g}
            label={s.goals[g]}
            selected={profile.goals.includes(g)}
            onPress={() =>
              patch({
                goals: profile.goals.includes(g) ? profile.goals.filter((x) => x !== g) : [...profile.goals, g],
              })
            }
          />
        ))}
      </Row>

      <Gap />
      <Card>
        <Txt variant="heading">{s.settings.data}</Txt>
        <Txt variant="small" color="textSecondary">
          {s.settings.dataBody}
        </Txt>
        <Button label={s.settings.export} variant="secondary" onPress={exportData} />
        <Button label={confirm ? s.settings.deleteConfirm : s.settings.deleteAll} variant="ghost" onPress={deleteAll} />
      </Card>

      <Card>
        <Txt variant="heading">{s.settings.about}</Txt>
        <Txt variant="small" color="textSecondary">
          {s.settings.aboutBody}
        </Txt>
        <Txt variant="small" color="textTertiary">
          {s.settings.version} {Constants.expoConfig?.version}
        </Txt>
      </Card>
    </Screen>
  );
}
