import type { NormalizedEvent } from '@/types/market.types';

export type EventSort = '24h-volume' | 'total' | 'liquidity' | 'newest' | 'ending-soon' | 'competitive' | 'earn-4';
export type EventWindow = 'all' | 'daily' | 'weekly' | 'monthly';
export type EventStatus = 'active' | 'resolved';

function eventSearchText(event: NormalizedEvent): string {
  return [event.title, event.description, ...event.tags, ...event.markets.map((market) => market.question)]
    .join(' ')
    .toLowerCase();
}

function isResolvedEvent(event: NormalizedEvent): boolean {
  const text = eventSearchText(event);
  return /\b(resolved|closed|settled|final)\b/.test(text);
}

function matchesWindow(event: NormalizedEvent, window: EventWindow): boolean {
  if (window === 'all') return true;
  const text = eventSearchText(event);
  const patternsByWindow: Record<Exclude<EventWindow, 'all'>, string[]> = {
    daily: ['daily', 'today', '24h'],
    weekly: ['weekly', 'week', '7d'],
    monthly: ['monthly', 'month', '30d'],
  };
  return patternsByWindow[window].some((pattern) => text.includes(pattern));
}

function eventLiquidity(event: NormalizedEvent): number {
  return event.markets.reduce((sum, market) => sum + market.volumeUsd, 0);
}

function competitivenessScore(event: NormalizedEvent): number {
  if (event.markets.length === 0) return Number.POSITIVE_INFINITY;
  const spread = event.markets.reduce((sum, market) => sum + Math.abs(market.yesPrice - 0.5), 0);
  return spread / event.markets.length;
}

function sortEvents(events: NormalizedEvent[], sort: EventSort): NormalizedEvent[] {
  const next = [...events];
  if (sort === '24h-volume' || sort === 'total') {
    return next.sort((a, b) => b.volumeUsd - a.volumeUsd);
  }
  if (sort === 'liquidity') {
    return next.sort((a, b) => eventLiquidity(b) - eventLiquidity(a));
  }
  if (sort === 'newest') {
    return next.sort((a, b) => b.id.localeCompare(a.id));
  }
  if (sort === 'ending-soon') {
    return next.sort((a, b) => a.id.localeCompare(b.id));
  }
  if (sort === 'competitive') {
    return next.sort((a, b) => competitivenessScore(a) - competitivenessScore(b));
  }
  if (sort === 'earn-4') {
    return next.sort((a, b) => competitivenessScore(b) - competitivenessScore(a));
  }
  return next;
}

export function applyTopFilters(
  events: NormalizedEvent[],
  {
    sort,
    window,
    status,
  }: {
    sort: EventSort;
    window: EventWindow;
    status: EventStatus;
  },
): NormalizedEvent[] {
  const byStatus = events.filter((event) => (status === 'resolved' ? isResolvedEvent(event) : !isResolvedEvent(event)));
  const byWindow = byStatus.filter((event) => matchesWindow(event, window));
  return sortEvents(byWindow, sort);
}
