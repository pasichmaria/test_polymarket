import type { NormalizedEvent } from '@/types/market.types';

export type TokenMeta = { marketId: string; side: 'yes' | 'no' };

/** Map CLOB token id → which market and outcome it belongs to. */
export function buildTokenRegistry(
  events: NormalizedEvent[],
  maxAssets: number
): { assetIds: string[]; byAsset: Map<string, TokenMeta> } {
  const byAsset = new Map<string, TokenMeta>();

  outer: for (const ev of events) {
    for (const m of ev.markets) {
      const t = m.clobTokenIds;
      const pairs: [string, TokenMeta['side']][] = [
        [t[0] ?? '', 'yes'],
        [t[1] ?? '', 'no'],
      ];
      for (const [token, side] of pairs) {
        if (!token || byAsset.has(token)) continue;
        if (byAsset.size >= maxAssets) break outer;
        byAsset.set(token, { marketId: m.id, side });
      }
    }
  }

  return { assetIds: [...byAsset.keys()], byAsset };
}
