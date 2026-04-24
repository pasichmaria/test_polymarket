import type { NormalizedEvent } from '@/types/market.types';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export type MarketPriceState = {
  yes: number;
  no: number;
  flash: 'up' | 'down' | null;
};

const defaultPrice: MarketPriceState = {
  yes: 0.5,
  no: 0.5,
  flash: null,
};

/** One atom per market id — updates do not touch other markets. */
export const marketPriceAtomFamily = atomFamily((id: string) => {
  void id;
  return atom<MarketPriceState>({ ...defaultPrice });
});

/** Batch-seed from loaded events (run once when list arrives). */
export const seedPricesFromEventsAtom = atom(null, (_get, set, events: NormalizedEvent[]) => {
  for (const ev of events) {
    for (const m of ev.markets) {
      set(marketPriceAtomFamily(m.id), {
        yes: m.yesPrice,
        no: m.noPrice,
        flash: null,
      });
    }
  }
});
