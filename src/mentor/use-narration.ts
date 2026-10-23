import { useEffect, useEffectEvent, useState } from 'react';

import { useMentor } from './mentor-provider';
import type { Line } from './script/types';

/**
 * Has Ozan say `lines` whenever `key` changes, and reports when the step's
 * inputs may appear: after he finishes, after Skip, or at once in quiet mode.
 * Pass null lines to say nothing for this key.
 */
export function useNarration(lines: Line[] | null, key: string): boolean {
  const m = useMentor();
  const [doneKey, setDoneKey] = useState<string | null>(null);

  const begin = useEffectEvent((k: string, live: { current: boolean }) => {
    if (!lines || lines.length === 0) return null;
    const { done, token } = m.start(lines);
    done.then(() => {
      if (live.current) setDoneKey(k);
    });
    return token;
  });
  const stop = useEffectEvent((token: number) => m.cancel(token));

  useEffect(() => {
    const live = { current: true };
    const token = begin(key, live);
    return () => {
      live.current = false;
      // Leaving the step (or the screen) silences it, so Ozan never finishes another screen's lines.
      if (token !== null) stop(token);
    };
  }, [key]);

  return m.quiet || !lines || lines.length === 0 || doneKey === key;
}
