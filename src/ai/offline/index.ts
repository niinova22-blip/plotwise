/**
 * On-device thinking engine used when no AI proxy is configured. It reads the
 * user's own words (topic, doubted assumptions, choices) to pick from original
 * content packs, so sessions stay personal without a network call.
 */

import en from '@/i18n/en';
import tr from '@/i18n/tr';

import type {
  AiContext,
  AiInput,
  AiOutput,
  AiTask,
  LabAssumptionsReq,
  LabReframeReq,
  Scenario,
  ScenarioKind,
} from '../contract';
import { PACKS } from './content';
import { clip, detectTopic, looksLikeCrisis, pick, seedOf } from './detect';

const KINDS: ScenarioKind[] = ['tailwind', 'obstacle', 'pivot'];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const bare = (text: string) => text.trim().replace(/[.!?。]+$/, '');

/** Turns a question-shaped goal into a phrase that reads naturally inside a sentence. */
function goalPhrase(goal: string) {
  return bare(goal)
    .replace(/^(what (would happen|happens) if|what if|should i|could i|can i)\s+/i, '')
    .replace(/\s+(ne olur(du)?|ne olacak|nasıl olur(du)?|m[ıiuü](y[ıiuü]m)?)$/i, '')
    .trim();
}

function horizonIndex(horizon: string): number {
  const i = Math.max(en.future.horizons.indexOf(horizon), tr.future.horizons.indexOf(horizon));
  return i < 0 ? 1 : i;
}

function topicText(i: LabAssumptionsReq) {
  return [i.problem, ...i.qa.map((x) => x.a)].join(' ');
}

/** The assumption the user trusts least: "might be wrong" first, then "not sure". */
function doubted(i: LabReframeReq) {
  return i.assumptions.find((a) => a.verdict === 'wrong') ?? i.assumptions.find((a) => a.verdict === 'unsure');
}

export async function offlineRespond<T extends AiTask>(
  task: T,
  input: AiInput<T>,
  context: AiContext,
): Promise<AiOutput<T>> {
  // A short pause keeps the rhythm of a thinking partner instead of an instant wall of text.
  await wait(450);
  if (looksLikeCrisis(JSON.stringify(input))) return { crisis: true } as AiOutput<T>;

  const p = PACKS[context.lang];
  const lang = context.lang;

  const handlers: { [K in AiTask]: (i: AiInput<K>) => AiOutput<K> } = {
    'lab.clarify': (i) => {
      const seed = seedOf(i.problem);
      const topic = detectTopic(i.problem, lang);
      const questions =
        topic === 'general'
          ? pick(p.clarify.general, 2, seed)
          : [...pick(p.clarify[topic], 1, seed), ...pick(p.clarify.general, 1, seed >>> 3)];
      return { crisis: false, summary: p.summary(clip(i.problem, 90)), questions };
    },

    'lab.assumptions': (i) => {
      const text = topicText(i);
      const seed = seedOf(text);
      const topic = detectTopic(text, lang);
      const assumptions =
        topic === 'general'
          ? pick(p.assumptions.general, 4, seed)
          : [...pick(p.assumptions[topic], 2, seed), ...pick(p.assumptions.general, 2, seed >>> 3)];
      return { crisis: false, assumptions };
    },

    'lab.reframe': (i) => {
      const seed = seedOf(topicText(i));
      const weak = doubted(i);
      return {
        crisis: false,
        reframes: pick(p.reframes, 3, seed),
        provocation: weak ? p.provocationFrom(clip(bare(weak.text), 80)) : pick(p.provocations, 1, seed)[0],
      };
    },

    'lab.experiment': (i) => {
      const text = topicText(i);
      const seed = seedOf(text + i.chosenReframe);
      const topic = detectTopic(text, lang);
      const weak = doubted(i);
      const trusted = i.assumptions.find((a) => a.verdict === 'sure');
      const opportunities = [
        ...(weak ? [p.opportunityFrom(clip(bare(weak.text), 70))] : []),
        ...pick(p.opportunities, weak ? 2 : 3, seed),
      ];
      const risks = [
        ...(trusted ? [p.riskFrom(clip(bare(trusted.text), 70))] : []),
        ...pick(p.risks, trusted ? 2 : 3, seed >>> 2),
      ];
      const pool = topic === 'general' ? p.experiments.general : p.experiments[topic];
      const experiments = [
        ...(weak ? [p.experimentFrom(clip(bare(weak.text), 70))] : []),
        ...pick(pool, weak ? 2 : 3, seed),
      ];
      return { crisis: false, opportunities, risks, experiments };
    },

    'future.scenarios': (i) => {
      const seed = seedOf(i.goal + i.context);
      const labels = p.future.labels[horizonIndex(i.horizon)];
      const goal = clip(goalPhrase(i.goal) || bare(i.goal), 50);
      const scenarios: Scenario[] = KINDS.map((kind, k) => {
        const variants = p.future.scenarios[kind];
        const draft = variants[(seed >>> k) % variants.length](goal);
        return {
          kind,
          title: draft.title,
          timeline: draft.events.map((event, j) => ({ when: labels[j], event })),
          decision: { prompt: draft.prompt, options: draft.options },
        };
      });
      return { crisis: false, scenarios };
    },

    'future.step': (i) => {
      const last = i.history[i.history.length - 1];
      const choice = clip(last?.choice ?? '', 60);
      const seed = seedOf(i.goal + i.scenario.kind + i.history.map((h) => h.choice).join('|'));
      if (i.stage === 1) {
        const twist = pick(p.future.twists, 1, seed)[0];
        return {
          crisis: false,
          narrative: pick(p.future.narrative1, 1, seed)[0](choice),
          twist: twist.twist,
          decision: { prompt: twist.prompt, options: twist.options },
          insight: '',
          keyAssumption: '',
        };
      }
      return {
        crisis: false,
        narrative: pick(p.future.narrative2, 1, seed)[0](choice),
        twist: '',
        decision: null,
        insight: pick(p.future.insights[i.scenario.kind], 1, seed)[0],
        keyAssumption: pick(p.future.keyAssumptions[i.scenario.kind], 1, seed >>> 2)[0],
      };
    },

    'train.feedback': (i) => {
      const answer = i.answer.trim();
      const ideas = answer.split(/\n|[,;•]|\s-\s|\d+[.)]\s/).filter((x) => x.trim().length > 2).length;
      const feedback =
        answer.length < 40 ? p.train.short : ideas <= 2 ? p.train.few : ideas <= 5 ? p.train.some : p.train.many;
      const push = p.train.push[i.type] ?? p.train.push.wrong;
      return { crisis: false, feedback, pushFurther: pick(push, 1, seedOf(answer))[0] };
    },
  };

  return (handlers[task] as (i: AiInput<T>) => AiOutput<T>)(input);
}
