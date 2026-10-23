import type { Embedder } from './embedder';

const none: Embedder = { ready: false, embed: async () => null };

/** No on-device model on web: reactions use the safe fallback. */
export function useEmbedder(): Embedder {
  return none;
}
