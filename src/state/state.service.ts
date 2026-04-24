import { categoryAtom } from '@/state/atoms/category.atom';
import { feedModeAtom } from '@/state/atoms/feed-status.atom';
import { marketPriceAtomFamily, seedPricesFromEventsAtom } from '@/state/atoms/market-prices.atom';
import type { MarketPriceState } from '@/state/atoms/market-prices.atom';
import type { EventCategory, FeedMode, NormalizedEvent } from '@/types/market.types';
import { getDefaultStore } from 'jotai';
import { useAtomValue } from 'jotai';

const store = getDefaultStore();

export function getCategory(): EventCategory {
  return store.get(categoryAtom);
}

export function setCategory(category: EventCategory): void {
  store.set(categoryAtom, category);
}

export function useCategory(): EventCategory {
  return useAtomValue(categoryAtom);
}

export function getFeedMode(): FeedMode {
  return store.get(feedModeAtom);
}

export function setFeedMode(mode: FeedMode): void {
  store.set(feedModeAtom, mode);
}

export function useFeedMode(): FeedMode {
  return useAtomValue(feedModeAtom);
}

export function seedPricesFromEvents(events: NormalizedEvent[]): void {
  store.set(seedPricesFromEventsAtom, events);
}

export function getMarketPrice(marketId: string): MarketPriceState {
  return store.get(marketPriceAtomFamily(marketId));
}

export function setMarketPrice(marketId: string, updater: (prev: MarketPriceState) => MarketPriceState): void {
  store.set(marketPriceAtomFamily(marketId), updater);
}

export function setMarketYes(marketId: string, yes: number): void {
  const nextYes = Math.min(0.999, Math.max(0.001, yes));
  setMarketPrice(marketId, (prev) => ({
    yes: nextYes,
    no: 1 - nextYes,
    flash: nextYes > prev.yes ? 'up' : nextYes < prev.yes ? 'down' : null,
  }));
}

export function useMarketPrice(marketId: string): MarketPriceState {
  return useAtomValue(marketPriceAtomFamily(marketId));
}
