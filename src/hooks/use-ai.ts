import { useCallback, useState } from 'react';

import { AiError, runAi } from '@/ai/client';
import type { AiInput, AiOutput, AiTask } from '@/ai/contract';
import { useStore } from '@/store/app-store';

import { useI18n } from './use-i18n';

export type AiStatus = 'idle' | 'loading' | 'error' | 'quota' | 'crisis';

/** Wraps one AI call with loading/error state and crisis detection. */
export function useAi() {
  const { data } = useStore();
  const { lang } = useI18n();
  const [status, setStatus] = useState<AiStatus>('idle');

  const call = useCallback(
    async <T extends AiTask>(task: T, input: AiInput<T>): Promise<AiOutput<T> | null> => {
      setStatus('loading');
      try {
        const out = await runAi(task, input, { lang, goals: data.profile.goals }, data.profile.installId);
        if ((out as { crisis?: boolean }).crisis) {
          setStatus('crisis');
          return null;
        }
        setStatus('idle');
        return out;
      } catch (e) {
        setStatus(e instanceof AiError && e.code === 'quota' ? 'quota' : 'error');
        return null;
      }
    },
    [lang, data.profile.goals, data.profile.installId],
  );

  return { status, setStatus, call };
}
