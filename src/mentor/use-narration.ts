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

  const start = useEffectEvent((k: string, live: { current: boolean }) => {
    if (!lines || lines.length === 0) return;
    m.say(lines).then(() => {
      if (live.current) setDoneKey(k);
    });
  });

  useEffect(() => {
    const live = { current: true };
    start(key, live);
    return () => {
      live.current = false;
    };
  }, [key]);

  return m.quiet || !lines || lines.length === 0 || doneKey === key;
}
