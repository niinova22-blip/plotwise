import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { TrainFeedbackRes } from '@/ai/contract';
import { CrisisNotice } from '@/components/crisis-notice';
import { Button, Card, ErrorNote, Field, Loading, Screen, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { dailyCount, pickExercise, type Exercise } from '@/exercises/generator';
import { useAi } from '@/hooks/use-ai';
import { useI18n } from '@/hooks/use-i18n';
import { fmt } from '@/i18n';
import { useMentor } from '@/mentor/mentor-provider';
import { getScript, voicedLine } from '@/mentor/script';
import type { Line } from '@/mentor/script/types';
import { MentorStage } from '@/mentor/stage';
import { useNarration } from '@/mentor/use-narration';
import { useStore } from '@/store/app-store';
import { dayKey, newId } from '@/store/ids';

export default function Train() {
  const { s, lang } = useI18n();
  const { data, dispatch } = useStore();
  const ai = useAi();
  const today = dayKey();
  const doneToday = data.training.filter((t) => t.day === today).length;
  const planned = dailyCount(data.profile.minutes);

  const [exercise, setExercise] = useState<Exercise>(() =>
    pickExercise(lang, today, doneToday, data.training, data.profile.goals),
  );
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<TrainFeedbackRes | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [round, setRound] = useState(0);
  const mentor = useMentor();
  const script = getScript(lang);
  const ready = useNarration(
    completed ? script.train.done : round === 0 ? script.train.intro : script.train.another,
    `${completed ? 'done' : 'ex'}-${round}-${lang}`,
  );

  async function nudge() {
    const out = await ai.call('train.feedback', {
      type: exercise.type,
      prompt: exercise.prompt,
      answer: answer.trim(),
    });
    if (out) {
      setFeedback(out);
      const said = [out.feedback, out.pushFurther].map((t) => voicedLine(lang, t)).filter((l): l is Line => !!l);
      mentor.say([...script.train.feedback, ...said]);
    }
  }

  function complete() {
    const entry = {
      id: newId(),
      templateId: exercise.templateId,
      type: exercise.type,
      prompt: exercise.prompt,
      answer: answer.trim(),
      day: today,
      createdAt: Date.now(),
      usedAi: !!feedback,
    };
    dispatch({ type: 'addTraining', entry });
    setCompleted(true);
  }

  function another() {
    // The completed entry is already in data.training, so history-aware picking moves on.
    setExercise(pickExercise(lang, today, doneToday, data.training, data.profile.goals));
    setAnswer('');
    setFeedback(null);
    setShowCheck(false);
    setCompleted(false);
    setRound((r) => r + 1);
    ai.setStatus('idle');
  }

  if (ai.status === 'crisis') {
    return (
      <Screen title={s.train.title}>
        <CrisisNotice onBack={() => router.replace('/')} />
      </Screen>
    );
  }

  const hasAnswer = answer.trim().length >= 10;

  const footer = completed ? (
    <View style={styles.col}>
      <Button label={s.lab.toHome} onPress={() => router.replace('/')} />
      <Button label={s.train.another} variant="secondary" onPress={another} />
    </View>
  ) : (
    <Button label={s.train.complete} onPress={complete} disabled={!hasAnswer} />
  );

  return (
    <Screen
      title={s.train.title}
      right={
        <Txt variant="small" color="textSecondary">
          {Math.min(doneToday + 1, planned)}/{planned}
        </Txt>
      }
      footer={ready ? footer : null}>
      <MentorStage />
      {!ready ? null : completed ? (
        <View style={styles.done}>
          <Txt variant="display">{s.train.doneTitle}</Txt>
          {mentor.quiet && <Txt color="textSecondary">{s.train.doneBody}</Txt>}
        </View>
      ) : (
        <>
          <Txt variant="caption" color="experiment">
            {s.train.types[exercise.type]} · {fmt(s.train.minutes, { minutes: 5 })}
          </Txt>
          <Txt variant="title">{exercise.prompt}</Txt>
          <Field value={answer} onChangeText={setAnswer} placeholder={s.train.answerPlaceholder} minHeight={200} />

          {hasAnswer && !feedback && (
            <View style={styles.row}>
              <Button
                label={s.train.getFeedback}
                variant="secondary"
                onPress={nudge}
                loading={ai.status === 'loading'}
                style={styles.half}
              />
              <Button
                label={s.train.selfCheck}
                variant="ghost"
                onPress={() => setShowCheck(!showCheck)}
                style={styles.half}
              />
            </View>
          )}

          {(ai.status === 'error' || ai.status === 'quota') && (
            <ErrorNote quota={ai.status === 'quota'} onRetry={nudge} />
          )}
          {ai.status === 'loading' && <Loading />}

          {feedback && (
            <Card accent="experiment">
              <Txt variant="caption" color="experiment">
                {s.train.feedbackTitle}
              </Txt>
              <Txt>{feedback.feedback}</Txt>
              <Txt variant="caption" color="accent">
                {s.train.pushFurther}
              </Txt>
              <Txt variant="heading">{feedback.pushFurther}</Txt>
            </Card>
          )}

          {(showCheck || ai.status === 'error') && (
            <Card>
              <Txt variant="caption" color="textSecondary">
                {s.train.selfCheck}
              </Txt>
              {exercise.check.map((c, i) => (
                <Txt key={i}>• {c.replace(/\*/g, '')}</Txt>
              ))}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  col: { gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  half: { flex: 1 },
  done: { gap: Spacing.three, paddingTop: Spacing.six },
});
