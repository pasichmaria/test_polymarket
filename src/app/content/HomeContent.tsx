'use client';

import styles from './home-content.module.scss';
import { applyTopFilters, type EventSort, type EventStatus, type EventWindow } from '@/app/content/eventFilters';
import { TabContentLayout } from '@/app/content/TabContentLayout';
import { EventGrid, EventGridEmpty, EventGridSkeleton } from '@/components/domain/market';
import { Wrapper } from '@/components/layout';
import { EventsFilterBar, type TrendingHidesState } from '@/components/ui';
import { useEventsList } from '@/hooks/events/useEventsList';
import { PolymarketPriceFeed } from '@/providers/PolymarketPriceFeed';
import { useCategory } from '@/state/state.service';
import type { EventCategory, NormalizedEvent } from '@/types/market.types';
import { useMemo } from 'react';
import { useState } from 'react';

const NAV_ORDER = ['all', 'crypto', 'sports', 'politics'] as const;
const NAV_LABEL: Record<string, string> = {
  all: 'Trending',
  crypto: 'Crypto',
  sports: 'Sports',
  politics: 'Politics',
};

export function HomeContent() {
  const { data, error, isLoading } = useEventsList();
  const cat = useCategory();
  const [sort, setSort] = useState<EventSort>('24h-volume');
  const [window, setWindow] = useState<EventWindow>('all');
  const [status, setStatus] = useState<EventStatus>('active');
  const [trendingHides, setTrendingHides] = useState<TrendingHidesState>({
    hideSports: false,
    hideCrypto: false,
    hideEarnings: false,
  });

  const events: NormalizedEvent[] = useMemo(() => data?.events ?? [], [data?.events]);
  const categories = useMemo<{ id: EventCategory; label: string }[]>(() => {
    return NAV_ORDER.map((id) => ({ id, label: NAV_LABEL[id] }));
  }, []);

  const filtered: NormalizedEvent[] = useMemo(() => {
    if (cat === 'all') return events;
    return events.filter((e) => e.category === cat);
  }, [cat, events]);

  const topFiltered: NormalizedEvent[] = useMemo(
    () => applyTopFilters(filtered, { sort, window, status }),
    [filtered, status, window, sort],
  );

  const displayEvents: NormalizedEvent[] = useMemo(() => {
    if (cat !== 'all') return topFiltered;
    return topFiltered.filter((e) => {
      if (trendingHides.hideSports && e.category === 'sports') return false;
      if (trendingHides.hideCrypto && e.category === 'crypto') return false;
      if (trendingHides.hideEarnings) {
        const t = e.title.toLowerCase();
        if (t.includes('earnings') || t.includes('earn 4') || t.includes('earn4')) return false;
      }
      return true;
    });
  }, [cat, topFiltered, trendingHides]);

  return (
    <Wrapper categories={categories}>
      <PolymarketPriceFeed events={events} />
      <TabContentLayout
        title="All markets"
        showSaveAction
        initialFilterOpen
        hideLeftColumn
        filterPanel={(
          <EventsFilterBar
            sort={sort}
            onSortChange={setSort}
            window={window}
            onWindowChange={setWindow}
            status={status}
            onStatusChange={setStatus}
            onClear={() => {
              setSort('24h-volume');
              setWindow('all');
              setStatus('active');
              setTrendingHides({ hideSports: false, hideCrypto: false, hideEarnings: false });
            }}
            clearLabel="Clear filters"
            {...(cat === 'all'
              ? {
                  trendingHides,
                  onTrendingHidesFieldChange: (field: keyof TrendingHidesState, value: boolean) =>
                    setTrendingHides((prev) => ({ ...prev, [field]: value })),
                }
              : {})}
          />
        )}
      >
        {error && <p className={styles.error}>Failed to load events.</p>}
        {isLoading && <EventGridSkeleton />}
        {!isLoading && displayEvents.length === 0 && (
          <EventGridEmpty text='No events in this category. Try "All" or reload.' />
        )}
        {!isLoading && displayEvents.length > 0 && <EventGrid events={displayEvents} columns={cat === 'all' ? 4 : 3} />}
      </TabContentLayout>
    </Wrapper>
  );
}
