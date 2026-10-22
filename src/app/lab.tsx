import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type {
  LabAssumptionsRes,
  LabClarifyRes,
  LabExperimentRes,
  LabReframeRes,
  Verdict,
} from '@/ai/contract';
import { CrisisNotice } from '@/components/crisis-notice';
import { Button, Card, Chip, ErrorNote, Field, Gap, Loading, Row, Screen, Steps, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useAi } from '@/hooks/use-ai';
import { useI18n } from '@/hooks/use-i18n';
import { useStore } from '@/store/app-store';
import { newId } from '@/store/ids';
import type { OutcomeCard } from '@/store/types';

type Step = 'describe' | 'clarify' | 'assumptions' | 'reframe' | 'weigh' | 'experiment' | 'done';
const ORDER: Step[] = ['describe', 'clarify', 'assumptions', 'reframe', 'weigh', 'experiment'];
const FOLLOW_UP_MS = 3 * 24 * 60 * 60 * 1000;

export default function Lab() {
  const { s } = useI18n();
  const { dispatch } = useStore();
  const ai = useAi();

  const [step, setStep] = useState<Step>('describe');
  const [problem, setProblem] = useState('');
  const [clarify, setClarify] = useState<LabClarifyRes | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [assumptions, setAssumptions] = useState<LabAssumptionsRes['assumptions']>([]);
  const [verdicts, setVerdicts] = useState<Record<number, Verdict>>({});
  const [reframe, setReframe] = useState<LabReframeRes | null>(null);
  const [chosenReframe, setChosenReframe] = useState<number | null>(null);
  const [provocationAnswer, setProvocationAnswer] = useState('');
  const [plan, setPlan] = useState<LabExperimentRes | null>(null);
  const [chosenExperiment, setChosenExperiment] = useState<number | null>(null);
  const [ownExperiment, setOwnExperiment] = useState('');
  const [retry, setRetry] = useState<(() => void) | null>(null);

  const qa = () =>
    (clarify?.questions ?? []).map((q, i) => ({ q, a: answers[i]?.trim() ?? '' }));
  const judged = () =>
    assumptions.map((a, i) => ({ text: a.text, verdict: verdicts[i] ?? 'unsure' }));

  async function attempt(fn: () => Promise<void>) {
    setRetry(() => () => attempt(fn));
    await fn();
  }

  const goClarify = () =>
    attempt(async () => {
      const out = await ai.call('lab.clarify', { problem: problem.trim() });
      if (out) {
        setClarify(out);
        setAnswers(out.questions.map(() => ''));
        setStep('clarify');
      }
    });

  const goAssumptions = () =>
    attempt(async () => {
      const out = await ai.call('lab.assumptions', { problem, qa: qa() });
      if (out) {
        setAssumptions(out.assumptions);
        setVerdicts({});
        setStep('assumptions');
      }
    });

  const goReframe = () =>
    attempt(async () => {
      const out = await ai.call('lab.reframe', { problem, qa: qa(), assumptions: judged() });
      if (out) {
        setReframe(out);
        setChosenReframe(null);
        setStep('reframe');
      }
    });

  const goWeigh = () =>
    attempt(async () => {
      if (!reframe || chosenReframe === null) return;
      const r = reframe.reframes[chosenReframe];
      const out = await ai.call('lab.experiment', {
        problem,
        qa: qa(),
        assumptions: judged(),
        chosenReframe: `${r.title}: ${r.text}`,
        provocation: reframe.provocation,
        provocationAnswer: provocationAnswer.trim(),
      });
      if (out) {
        setPlan(out);
        setStep('weigh');
      }
    });

  function finish() {
    if (!plan || !reframe || chosenReframe === null) return;
    const sessionId = newId();
    const now = Date.now();
    const experiment =
      ownExperiment.trim() ||
      (chosenExperiment !== null
        ? `${plan.experiments[chosenExperiment].title} — ${plan.experiments[chosenExperiment].how}`
        : '');
    const questioned = judged().filter((a) => a.verdict !== 'sure');
    const r = reframe.reframes[chosenReframe];
    const cards: OutcomeCard[] = [
      ...questioned.slice(0, 2).map((a) => ({
        id: newId(),
        kind: 'assumption' as const,
        title: a.text,
        body: problem,
        sessionId,
        createdAt: now,
      })),
      { id: newId(), kind: 'reframe', title: r.title, body: r.text, sessionId, createdAt: now },
    ];
    if (experiment) {
      const [title, ...rest] = experiment.split(' — ');
      cards.push({
        id: newId(),
        kind: 'experiment',
        title,
        body: rest.join(' — ') || problem,
        sessionId,
        createdAt: now,
        followUpAt: now + FOLLOW_UP_MS,
      });
    }
    dispatch({
      type: 'saveSession',
      session: {
        id: sessionId,
        module: 'lab',
        title: problem.trim().slice(0, 120),
        createdAt: now,
        data: { problem, qa: qa(), assumptions: judged(), reframe, chosenReframe, provocationAnswer, plan, experiment },
      },
      cards,
    });
    setStep('done');
  }

  const stepIndex = ORDER.indexOf(step);
  const loading = ai.status === 'loading';

  let footer: React.ReactNode = null;
  if (step === 'describe')
    footer = <Button label={s.common.continue} onPress={goClarify} disabled={problem.trim().length < 8} loading={loading} />;
  if (step === 'clarify')
    footer = <Button label={s.common.continue} onPress={goAssumptions} loading={loading} />;
  if (step === 'assumptions')
    footer = <Button label={s.common.continue} onPress={goReframe} loading={loading} />;
  if (step === 'reframe')
    footer = <Button label={s.common.continue} onPress={goWeigh} disabled={chosenReframe === null} loading={loading} />;
  if (step === 'weigh') footer = <Button label={s.common.continue} onPress={() => setStep('experiment')} />;
  if (step === 'experiment')
    footer = (
      <Button
        label={s.common.save}
        onPress={finish}
        disabled={chosenExperiment === null && !ownExperiment.trim()}
      />
    );

  if (ai.status === 'crisis') {
    return (
      <Screen title={s.lab.title}>
        <CrisisNotice onBack={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen title={s.lab.title} footer={ai.status === 'idle' || loading ? footer : null}>
      {step !== 'done' && <Steps total={ORDER.length} current={stepIndex} />}
      {step !== 'done' && (
        <Txt variant="caption" color="textSecondary">
          {s.lab.steps[stepIndex]}
        </Txt>
      )}

      {(ai.status === 'error' || ai.status === 'quota') && (
        <ErrorNote quota={ai.status === 'quota'} onRetry={() => retry?.()} />
      )}

      {step === 'describe' && (
        <>
          <Txt variant="title">{s.lab.describeTitle}</Txt>
          <Txt color="textSecondary">{s.lab.describeHint}</Txt>
          <Field value={problem} onChangeText={setProblem} placeholder={s.lab.describePlaceholder} minHeight={160} autoFocus />
        </>
      )}

      {step === 'clarify' && clarify && (
        <>
          <Txt color="textSecondary">{clarify.summary}</Txt>
          <Txt variant="title">{s.lab.clarifyTitle}</Txt>
          {clarify.questions.map((q, i) => (
            <View key={i} style={styles.block}>
              <Txt variant="heading">{q}</Txt>
              <Field
                value={answers[i] ?? ''}
                onChangeText={(v) => setAnswers(answers.map((a, j) => (j === i ? v : a)))}
                placeholder={s.common.yourAnswer}
                minHeight={80}
              />
            </View>
          ))}
        </>
      )}

      {step === 'assumptions' && (
        <>
          <Txt variant="title">{s.lab.assumptionsTitle}</Txt>
          <Txt color="textSecondary">{s.lab.assumptionsHint}</Txt>
          {assumptions.map((a, i) => (
            <Card key={i} accent="assumption">
              <Txt variant="heading">{a.text}</Txt>
              <Txt variant="small" color="textSecondary">
                {a.why}
              </Txt>
              <Row>
                {(
                  [
                    ['sure', s.lab.verdictSure],
                    ['unsure', s.lab.verdictUnsure],
                    ['wrong', s.lab.verdictWrong],
                  ] as const
                ).map(([v, label]) => (
                  <Chip
                    key={v}
                    label={label}
                    color="assumption"
                    selected={verdicts[i] === v}
                    onPress={() => setVerdicts({ ...verdicts, [i]: v })}
                  />
                ))}
              </Row>
            </Card>
          ))}
        </>
      )}

      {step === 'reframe' && reframe && (
        <>
          <Txt variant="title">{s.lab.reframeTitle}</Txt>
          <Txt color="textSecondary">{s.lab.reframeHint}</Txt>
          {reframe.reframes.map((r, i) => (
            <Card key={i} accent="reframe" selected={chosenReframe === i} onPress={() => setChosenReframe(i)}>
              <Txt variant="heading">{r.title}</Txt>
              <Txt color="textSecondary">{r.text}</Txt>
            </Card>
          ))}
          <Gap size="two" />
          <Txt variant="caption" color="accent">
            {s.lab.provocationTitle}
          </Txt>
          <Txt variant="heading">{reframe.provocation}</Txt>
          <Field value={provocationAnswer} onChangeText={setProvocationAnswer} placeholder={s.common.yourAnswer} minHeight={80} />
        </>
      )}

      {step === 'weigh' && plan && (
        <>
          <Txt variant="title">{s.lab.weighTitle}</Txt>
          <Card accent="experiment">
            <Txt variant="caption" color="experiment">
              {s.lab.opportunities}
            </Txt>
            {plan.opportunities.map((o, i) => (
              <Txt key={i}>• {o}</Txt>
            ))}
          </Card>
          <Card accent="danger">
            <Txt variant="caption" color="danger">
              {s.lab.risks}
            </Txt>
            {plan.risks.map((r, i) => (
              <Txt key={i}>• {r}</Txt>
            ))}
          </Card>
        </>
      )}

      {step === 'experiment' && plan && (
        <>
          <Txt variant="title">{s.lab.experimentTitle}</Txt>
          <Txt color="textSecondary">{s.lab.experimentHint}</Txt>
          {plan.experiments.map((e, i) => (
            <Card
              key={i}
              accent="experiment"
              selected={chosenExperiment === i && !ownExperiment.trim()}
              onPress={() => {
                setChosenExperiment(i);
                setOwnExperiment('');
              }}>
              <Txt variant="heading">{e.title}</Txt>
              <Txt color="textSecondary">{e.how}</Txt>
              <Txt variant="caption" color="experiment">
                {e.timebox}
              </Txt>
            </Card>
          ))}
          <Field value={ownExperiment} onChangeText={setOwnExperiment} placeholder={s.lab.ownExperiment} minHeight={72} />
        </>
      )}

      {step === 'done' && (
        <View style={styles.done}>
          <Txt variant="display">{s.lab.finishTitle}</Txt>
          <Txt color="textSecondary">{s.lab.finishBody}</Txt>
          <Button label={s.lab.toNotebook} onPress={() => router.replace('/notebook')} />
          <Button label={s.lab.toHome} variant="secondary" onPress={() => router.replace('/')} />
        </View>
      )}

      {loading && <Loading />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: { gap: Spacing.two },
  done: { gap: Spacing.three, paddingTop: Spacing.six },
});
