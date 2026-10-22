import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Decision, FutureStepRes, Scenario } from '@/ai/contract';
import { CrisisNotice } from '@/components/crisis-notice';
import { Button, Card, Chip, ErrorNote, Field, Gap, Loading, Row, Screen, Txt } from '@/components/ui';
import { Spacing, type ThemeColor } from '@/constants/theme';
import { useAi } from '@/hooks/use-ai';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/store/app-store';
import { newId } from '@/store/ids';

type Step = 'goal' | 'scenarios' | 'story' | 'closing' | 'done';
type Turn = { prompt: string; choice: string; narrative?: string; twist?: string };

const KIND_COLOR: Record<Scenario['kind'], ThemeColor> = {
  tailwind: 'experiment',
  obstacle: 'danger',
  pivot: 'reframe',
};

function Timeline({ scenario }: { scenario: Scenario }) {
  const theme = useTheme();
  return (
    <View style={styles.timeline}>
      {scenario.timeline.map((t, i) => (
        <View key={i} style={styles.tlRow}>
          <View style={styles.tlRail}>
            <View style={[styles.tlDot, { backgroundColor: theme[KIND_COLOR[scenario.kind]] }]} />
            {i < scenario.timeline.length - 1 && <View style={[styles.tlLine, { backgroundColor: theme.border }]} />}
          </View>
          <View style={styles.tlBody}>
            <Txt variant="caption" color="textSecondary">
              {t.when}
            </Txt>
            <Txt>{t.event}</Txt>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function Future() {
  const { s } = useI18n();
  const { dispatch } = useStore();
  const ai = useAi();

  const [step, setStep] = useState<Step>('goal');
  const [goal, setGoal] = useState('');
  const [horizon, setHorizon] = useState(1);
  const [context, setContext] = useState('');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [custom, setCustom] = useState('');
  const [closing, setClosing] = useState<FutureStepRes | null>(null);
  const [takeaway, setTakeaway] = useState('');
  const [explored, setExplored] = useState<{ scenario: Scenario; turns: Turn[]; closing: FutureStepRes; takeaway: string }[]>([]);
  const [retry, setRetry] = useState<(() => void) | null>(null);

  const base = () => ({ goal: goal.trim(), horizon: s.future.horizons[horizon], context: context.trim() });

  async function attempt(fn: () => Promise<void>) {
    setRetry(() => () => attempt(fn));
    await fn();
  }

  const imagine = () =>
    attempt(async () => {
      const out = await ai.call('future.scenarios', base());
      if (out) {
        setScenarios(out.scenarios);
        setStep('scenarios');
      }
    });

  function enter(i: number) {
    setActive(i);
    setDecision(scenarios[i].decision);
    setTurns([]);
    setCustom('');
    setClosing(null);
    setTakeaway('');
    setStep('story');
  }

  const choose = (choice: string) =>
    attempt(async () => {
      if (active === null || !decision) return;
      const history = [...turns, { prompt: decision.prompt, choice }];
      const stage = turns.length === 0 ? 1 : 2;
      const out = await ai.call('future.step', {
        ...base(),
        scenario: scenarios[active],
        history: history.map(({ prompt, choice: c, narrative }) => ({ prompt, choice: c, narrative })),
        stage,
      });
      if (!out) return;
      const updated = history.map((t, i) =>
        i === history.length - 1 ? { ...t, narrative: out.narrative, twist: out.twist } : t,
      );
      setTurns(updated);
      setCustom('');
      if (stage === 1 && out.decision) {
        setDecision(out.decision);
      } else {
        setDecision(null);
        setClosing(out);
        setStep('closing');
      }
    });

  function keepExploration() {
    if (active === null || !closing) return null;
    const entry = { scenario: scenarios[active], turns, closing, takeaway: takeaway.trim() };
    setExplored((prev) => [...prev, entry]);
    return entry;
  }

  function save(extra?: ReturnType<typeof keepExploration>) {
    const all = extra ? [...explored, extra] : explored;
    if (all.length === 0) return;
    const sessionId = newId();
    const now = Date.now();
    dispatch({
      type: 'saveSession',
      session: { id: sessionId, module: 'future', title: goal.trim().slice(0, 120), createdAt: now, data: { ...base(), scenarios, explored: all } },
      cards: all.flatMap((e) => [
        {
          id: newId(),
          kind: 'future' as const,
          title: e.scenario.title,
          body: e.takeaway || e.closing.insight,
          sessionId,
          createdAt: now,
        },
        {
          id: newId(),
          kind: 'assumption' as const,
          title: e.closing.keyAssumption,
          body: goal.trim(),
          sessionId,
          createdAt: now,
        },
      ]),
    });
    setStep('done');
  }

  const loading = ai.status === 'loading';
  const failed = ai.status === 'error' || ai.status === 'quota';

  if (ai.status === 'crisis') {
    return (
      <Screen title={s.future.title}>
        <CrisisNotice onBack={() => router.replace('/')} />
      </Screen>
    );
  }

  let footer: React.ReactNode = null;
  if (step === 'goal')
    footer = <Button label={s.future.generate} onPress={imagine} disabled={goal.trim().length < 8} loading={loading} />;
  if (step === 'closing')
    footer = (
      <View style={styles.footerCol}>
        <Button label={s.future.finish} onPress={() => save(keepExploration())} />
        {explored.length + 1 < scenarios.length && (
          <Button
            label={s.future.tryAnother}
            variant="secondary"
            onPress={() => {
              keepExploration();
              setStep('scenarios');
            }}
          />
        )}
      </View>
    );
  if (step === 'scenarios' && explored.length > 0)
    footer = <Button label={s.future.finish} variant="secondary" onPress={() => save()} />;

  const exploredKinds = new Set(explored.map((e) => e.scenario.kind));

  return (
    <Screen title={s.future.title} footer={failed ? null : footer}>
      {failed && <ErrorNote quota={ai.status === 'quota'} onRetry={() => retry?.()} />}

      {step === 'goal' && (
        <>
          <Txt variant="title">{s.future.goalTitle}</Txt>
          <Field value={goal} onChangeText={setGoal} placeholder={s.future.goalPlaceholder} minHeight={110} autoFocus />
          <Txt variant="caption" color="textSecondary">
            {s.future.horizon}
          </Txt>
          <Row>
            {s.future.horizons.map((h, i) => (
              <Chip key={h} label={h} selected={horizon === i} color="future" onPress={() => setHorizon(i)} />
            ))}
          </Row>
          <Txt variant="caption" color="textSecondary">
            {s.future.contextLabel}
          </Txt>
          <Field value={context} onChangeText={setContext} placeholder={s.future.contextPlaceholder} minHeight={72} />
          <Txt variant="small" color="textTertiary">
            {s.future.disclaimer}
          </Txt>
        </>
      )}

      {step === 'scenarios' && (
        <>
          <Txt variant="title">{s.future.scenariosTitle}</Txt>
          <Txt variant="small" color="textTertiary">
            {s.future.disclaimer}
          </Txt>
          {scenarios.map((sc, i) => (
            <Card key={i} accent={KIND_COLOR[sc.kind]}>
              <Txt variant="caption" color={KIND_COLOR[sc.kind]}>
                {s.future.kinds[sc.kind]}
              </Txt>
              <Txt variant="title">{sc.title}</Txt>
              <Timeline scenario={sc} />
              <Button
                label={exploredKinds.has(sc.kind) ? '✓' : s.future.enter}
                variant="secondary"
                disabled={exploredKinds.has(sc.kind)}
                onPress={() => enter(i)}
              />
            </Card>
          ))}
        </>
      )}

      {step === 'story' && active !== null && (
        <>
          <Txt variant="caption" color={KIND_COLOR[scenarios[active].kind]}>
            {s.future.kinds[scenarios[active].kind]}
          </Txt>
          <Txt variant="title">{scenarios[active].title}</Txt>
          {turns.map((t, i) => (
            <View key={i} style={styles.turn}>
              <Card>
                <Txt variant="caption" color="textSecondary">
                  {t.prompt}
                </Txt>
                <Txt variant="heading">→ {t.choice}</Txt>
              </Card>
              {t.narrative ? <Txt>{t.narrative}</Txt> : null}
              {t.twist ? (
                <Card accent="accent">
                  <Txt variant="caption" color="accent">
                    {s.future.twist}
                  </Txt>
                  <Txt>{t.twist}</Txt>
                </Card>
              ) : null}
            </View>
          ))}
          {decision && !loading && (
            <>
              <Gap size="two" />
              <Txt variant="caption" color="accent">
                {s.future.decisionTitle}
              </Txt>
              <Txt variant="heading">{decision.prompt}</Txt>
              {decision.options.map((o) => (
                <Card key={o} onPress={() => choose(o)}>
                  <Txt>{o}</Txt>
                </Card>
              ))}
              <Field value={custom} onChangeText={setCustom} placeholder={s.future.freeChoice} minHeight={56} />
              {custom.trim().length > 2 && <Button label={s.common.continue} onPress={() => choose(custom.trim())} />}
            </>
          )}
        </>
      )}

      {step === 'closing' && closing && (
        <>
          {closing.narrative ? <Txt>{closing.narrative}</Txt> : null}
          <Txt variant="title">{s.future.closingTitle}</Txt>
          <Card accent="insight">
            <Txt>{closing.insight}</Txt>
          </Card>
          <Card accent="assumption">
            <Txt variant="caption" color="assumption">
              {s.future.keyAssumption}
            </Txt>
            <Txt variant="heading">{closing.keyAssumption}</Txt>
          </Card>
          <Field value={takeaway} onChangeText={setTakeaway} placeholder={s.future.reflectPlaceholder} minHeight={72} />
        </>
      )}

      {step === 'done' && (
        <View style={styles.done}>
          <Txt variant="display">{s.lab.finishTitle}</Txt>
          <Button label={s.lab.toNotebook} onPress={() => router.replace('/notebook')} />
          <Button label={s.lab.toHome} variant="secondary" onPress={() => router.replace('/')} />
        </View>
      )}

      {loading && <Loading />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  timeline: { gap: 0, paddingVertical: Spacing.two },
  tlRow: { flexDirection: 'row', gap: Spacing.three },
  tlRail: { alignItems: 'center', width: 12 },
  tlDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  tlLine: { width: 2, flex: 1, marginVertical: 2 },
  tlBody: { flex: 1, paddingBottom: Spacing.three, gap: Spacing.half },
  turn: { gap: Spacing.three },
  footerCol: { gap: Spacing.two },
  done: { gap: Spacing.three, paddingTop: Spacing.six },
});
