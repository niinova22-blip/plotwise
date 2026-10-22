import type { AiTask } from '../../src/ai/contract';

/** JSON schemas for structured outputs, one per task. Mirrors src/ai/contract.ts. */

type Schema = Record<string, unknown>;

const str: Schema = { type: 'string' };
const strList: Schema = { type: 'array', items: str };

function obj(properties: Record<string, Schema>): Schema {
  return {
    type: 'object',
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  };
}

const crisis: Schema = { type: 'boolean' };

const decision = obj({ prompt: str, options: strList });

const scenario = obj({
  kind: { type: 'string', enum: ['tailwind', 'obstacle', 'pivot'] },
  title: str,
  timeline: { type: 'array', items: obj({ when: str, event: str }) },
  decision,
});

export const SCHEMAS: Record<AiTask, Schema> = {
  'lab.clarify': obj({ crisis, summary: str, questions: strList }),
  'lab.assumptions': obj({
    crisis,
    assumptions: { type: 'array', items: obj({ text: str, why: str }) },
  }),
  'lab.reframe': obj({
    crisis,
    reframes: { type: 'array', items: obj({ title: str, text: str }) },
    provocation: str,
  }),
  'lab.experiment': obj({
    crisis,
    opportunities: strList,
    risks: strList,
    experiments: { type: 'array', items: obj({ title: str, how: str, timebox: str }) },
  }),
  'future.scenarios': obj({ crisis, scenarios: { type: 'array', items: scenario } }),
  'future.step': obj({
    crisis,
    narrative: str,
    twist: str,
    decision: { anyOf: [decision, { type: 'null' }] },
    insight: str,
    keyAssumption: str,
  }),
  'train.feedback': obj({ crisis, feedback: str, pushFurther: str }),
};
