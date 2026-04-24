'use client';

import styles from './sports-page-content.module.scss';
import { applyTopFilters, type EventSort, type EventStatus, type EventWindow } from '@/app/content/eventFilters';
import {
  LeftFiltersColumn,
  type LeftFilterItem,
  type LeftFilterSection,
} from '@/app/content/LeftFiltersColumn';
import { TabContentLayout } from '@/app/content/TabContentLayout';
import { EventCard, TradePanel } from '@/components/domain/market';
import { Wrapper } from '@/components/layout';
import { EventsFilterBar } from '@/components/ui';
import { useEventsList } from '@/hooks/events/useEventsList';
import { cn } from '@/lib/cn';
import { PolymarketPriceFeed } from '@/providers/PolymarketPriceFeed';
import { setCategory } from '@/state/state.service';
import type { NormalizedEvent } from '@/types/market.types';
import { useEffect, useMemo, useState } from 'react';

export function SportsPageContent() {
  const { data, error, isLoading } = useEventsList();
  const [sort, setSort] = useState<EventSort>('24h-volume');
  const [window, setWindow] = useState<EventWindow>('all');
  const [status, setStatus] = useState<EventStatus>('active');
  const [activeLeftFilterId, setActiveLeftFilterId] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [side, setSide] = useState<'yes' | 'no'>('yes');

  useEffect(() => {
    setCategory('sports');
  }, []);

  const events: NormalizedEvent[] = useMemo(() => data?.events ?? [], [data?.events]);
  const sportsEvents = useMemo(
    () => events.filter((event) => event.category === 'sports'),
    [events],
  );

  const topFiltered = useMemo(
    () => applyTopFilters(sportsEvents, { sort, window, status }),
    [sportsEvents, sort, window, status],
  );

  const leftSections = useMemo<LeftFilterSection[]>(() => {
    const tagCounts = new Map<string, number>();
    for (const event of sportsEvents) {
      for (const tag of event.tags) {
        const label = tag.trim();
        if (!label) continue;
        tagCounts.set(label, (tagCounts.get(label) ?? 0) + 1);
      }
    }

    const items: LeftFilterItem[] = [
      { id: 'all', label: 'All', count: sportsEvents.length, kind: 'all' },
      ...[...tagCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([label, count]) => ({
          id: `tag-${label.toLowerCase().replace(/\s+/g, '-')}`,
          label,
          count,
          kind: 'tag' as const,
        })),
    ];

    return [{ id: 'sports-main', items }];
  }, [sportsEvents]);

  const listAfterLeft = useMemo(() => {
    if (activeLeftFilterId === 'all') return topFiltered;
    const tagLabel = activeLeftFilterId.startsWith('tag-') ? activeLeftFilterId.slice(4).replace(/-/g, ' ') : '';
    if (!tagLabel) return topFiltered;
    return topFiltered.filter((event) => event.tags.some((tag) => tag.toLowerCase() === tagLabel));
  }, [topFiltered, activeLeftFilterId]);

  useEffect(() => {
    if (listAfterLeft.length === 0) {
      setSelectedEventId(null);
      return;
    }
    setSelectedEventId((prev) => {
      if (prev && listAfterLeft.some((e) => e.id === prev)) return prev;
      return listAfterLeft[0].id;
    });
  }, [listAfterLeft]);

  const selectedEvent = useMemo(
    () => listAfterLeft.find((e) => e.id === selectedEventId) ?? listAfterLeft[0],
    [listAfterLeft, selectedEventId],
  );
  const selectedMarket = selectedEvent?.markets[0];

  return (
    <Wrapper>
      <PolymarketPriceFeed events={sportsEvents} />
      <TabContentLayout
        title="Sports"
        showSaveAction
        initialFilterOpen
        leftContent={(
          <LeftFiltersColumn
            sections={leftSections}
            activeId={activeLeftFilterId}
            onSelect={setActiveLeftFilterId}
            ariaLabel="Sports topics and tags"
          />
        )}
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
            }}
          />
        )}
      >
        {error && <p className={styles.error}>Failed to load sports markets.</p>}

        <div className={styles.sportsMain}>
          <div className={styles.middle}>
            {isLoading && <p className={styles.muted}>Loading markets...</p>}
            {!isLoading && listAfterLeft.length === 0 && <p className={styles.muted}>No sports markets found.</p>}
            {!isLoading && listAfterLeft.length > 0 && (
              <div className={styles.cardStack}>
                {listAfterLeft.map((event) => (
                  <div
                    key={event.id}
                    className={cn(styles.cardWrap, selectedEventId === event.id && styles.cardWrapSelected)}
                    onClick={() => setSelectedEventId(event.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedEventId(event.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <aside className={styles.rightPanel} aria-label="Trade preview">
            <TradePanel
              market={selectedMarket}
              eventTitle={selectedEvent?.title}
              eventImage={selectedEvent?.image}
              side={side}
              onSideChange={setSide}
            />
          </aside>
        </div>
      </TabContentLayout>
    </Wrapper>
  );
}
