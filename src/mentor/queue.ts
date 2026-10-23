import type { Line } from './script/types';

/**
 * What Ozan is saying right now. `token` identifies one say() call so a newer
 * call can end an older one cleanly.
 */
export type QueueState = {
  lines: Line[];
  index: number;
  status: 'idle' | 'speaking' | 'waiting' | 'done';
  token: number;
};

export type QueueAction =
  | { type: 'say'; lines: Line[]; token: number }
  | { type: 'lineEnded' }
  | { type: 'advance' }
  | { type: 'skip' }
  | { type: 'reset' };

export const initialQueue: QueueState = { lines: [], index: 0, status: 'idle', token: 0 };

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'say':
      return { lines: action.lines, index: 0, status: action.lines.length ? 'speaking' : 'done', token: action.token };
    case 'lineEnded':
      return state.status === 'speaking' ? { ...state, status: 'waiting' } : state;
    case 'advance':
      if (state.status !== 'speaking' && state.status !== 'waiting') return state;
      return state.index + 1 < state.lines.length
        ? { ...state, index: state.index + 1, status: 'speaking' }
        : { ...state, status: 'done' };
    case 'skip':
      return { ...state, status: 'done' };
    case 'reset':
      return { ...initialQueue, token: state.token };
  }
}
