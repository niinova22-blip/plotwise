/**
 * Request/response contract between the app and the AI proxy (worker/).
 * The worker imports this file too, so keep it dependency-free.
 */

export type AiLang = 'en' | 'tr';

export type Verdict = 'sure' | 'unsure' | 'wrong';

export type AiContext = {
  lang: AiLang;
  goals: string[];
};

export type LabClarifyReq = { problem: string };
export type LabClarifyRes = { crisis: boolean; summary: string; questions: string[] };

export type LabAssumptionsReq = {
  problem: string;
  qa: { q: string; a: string }[];
};
export type LabAssumptionsRes = {
  crisis: boolean;
  assumptions: { text: string; why: string }[];
};

export type LabReframeReq = LabAssumptionsReq & {
  assumptions: { text: string; verdict: Verdict }[];
};
export type LabReframeRes = {
  crisis: boolean;
  reframes: { title: string; text: string }[];
  provocation: string;
};

export type LabExperimentReq = LabReframeReq & {
  chosenReframe: string;
  provocation: string;
  provocationAnswer: string;
};
export type LabExperimentRes = {
  crisis: boolean;
  opportunities: string[];
  risks: string[];
  experiments: { title: string; how: string; timebox: string }[];
};

export type ScenarioKind = 'tailwind' | 'obstacle' | 'pivot';
export type Decision = { prompt: string; options: string[] };
export type Scenario = {
  kind: ScenarioKind;
  title: string;
  timeline: { when: string; event: string }[];
  decision: Decision;
};

export type FutureScenariosReq = { goal: string; horizon: string; context: string };
export type FutureScenariosRes = { crisis: boolean; scenarios: Scenario[] };

export type FutureStepReq = FutureScenariosReq & {
  scenario: Scenario;
  history: { prompt: string; choice: string; narrative?: string }[];
  /** 1 = add a twist and a new decision, 2 = close the story. */
  stage: 1 | 2;
};
export type FutureStepRes = {
  crisis: boolean;
  narrative: string;
  twist: string;
  decision: Decision | null;
  insight: string;
  keyAssumption: string;
};

export type TrainFeedbackReq = { type: string; prompt: string; answer: string };
export type TrainFeedbackRes = { crisis: boolean; feedback: string; pushFurther: string };

export type AiTasks = {
  'lab.clarify': [LabClarifyReq, LabClarifyRes];
  'lab.assumptions': [LabAssumptionsReq, LabAssumptionsRes];
  'lab.reframe': [LabReframeReq, LabReframeRes];
  'lab.experiment': [LabExperimentReq, LabExperimentRes];
  'future.scenarios': [FutureScenariosReq, FutureScenariosRes];
  'future.step': [FutureStepReq, FutureStepRes];
  'train.feedback': [TrainFeedbackReq, TrainFeedbackRes];
};

export type AiTask = keyof AiTasks;
export type AiInput<T extends AiTask> = AiTasks[T][0];
export type AiOutput<T extends AiTask> = AiTasks[T][1];

export type AiRequestBody<T extends AiTask = AiTask> = {
  task: T;
  context: AiContext;
  input: AiInput<T>;
};

export type AiErrorCode = 'quota' | 'bad_request' | 'upstream' | 'unauthorized' | 'unconfigured';
export type AiErrorBody = { error: AiErrorCode; message?: string };

export const AI_TASKS: AiTask[] = [
  'lab.clarify',
  'lab.assumptions',
  'lab.reframe',
  'lab.experiment',
  'future.scenarios',
  'future.step',
  'train.feedback',
];
