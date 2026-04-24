'use client';

import styles from './category-page-content.module.scss';
import { applyTopFilters, type EventSort, type EventStatus, type EventWindow } from '@/app/content/eventFilters';
import { LeftFiltersColumn, type LeftFilterItem, type LeftFilterSection } from '@/app/content/LeftFiltersColumn';
import { TabContentLayout } from '@/app/content/TabContentLayout';
import { EventGrid, EventGridEmpty, EventGridSkeleton } from '@/components/domain/market';
import { Wrapper } from '@/components/layout';
import { EventsFilterBar, TrendingUpIcon } from '@/components/ui';
import { useEventsList } from '@/hooks/events/useEventsList';
import { PolymarketPriceFeed } from '@/providers/PolymarketPriceFeed';
import { setCategory } from '@/state/state.service';
import type { NormalizedEvent } from '@/types/market.types';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  category: 'crypto' | 'sports' | 'politics';
  title: string;
  subtitle?: string;
  statLabel?: string;
  showTopicControls?: boolean;
};

const CRYPTO_FILTERS = ['All', 'Up / Down', 'Above / Below', 'Price Range', 'Hit Price'] as const;
type CryptoFilter = (typeof CRYPTO_FILTERS)[number];

const CRYPTO_TIMEFRAMES = [
  { label: '5 Min', patterns: ['5 min', '5m', 'five minute'] },
  { label: '15 Min', patterns: ['15 min', '15m', 'fifteen minute'] },
  { label: '1 Hour', patterns: ['1 hour', '1h', 'hourly'] },
  { label: '4 Hours', patterns: ['4 hour', '4h'] },
  { label: 'Daily', patterns: ['daily', 'day', '24h'] },
  { label: 'Weekly', patterns: ['weekly', 'week', '1w'] },
  { label: 'Monthly', patterns: ['monthly', 'month', '1mo'] },
  { label: 'Yearly', patterns: ['yearly', 'year', '1y'] },
] as const;

const CRYPTO_ASSET_LABELS = new Set([
  'bitcoin',
  'ethereum',
  'solana',
  'xrp',
  'dogecoin',
  'bnb',
  'microstrategy',
]);

function eventSearchText(event: NormalizedEvent): string {
  return [event.title, event.description, ...event.tags, ...event.markets.map((market) => market.question)]
    .join(' ')
    .toLowerCase();
}

function countByPatterns(events: NormalizedEvent[], patterns: readonly string[]): number {

  return events.filter((event) => {
    const text = eventSearchText(event);
    return patterns.some((pattern) => text.includes(pattern));
  }).length;
}

function matchesCryptoFilter(event: NormalizedEvent, filter: CryptoFilter): boolean {
  if (filter === 'All') return true;

  const text = [event.title, ...event.markets.map((market) => market.question)].join(' ').toLowerCase();

  if (filter === 'Up / Down') {
    return /\b(up|down|higher|lower|increase|decrease)\b/.test(text);
  }

  if (filter === 'Above / Below') {
    return /\b(above|below|over|under|greater than|less than)\b/.test(text);
  }

  if (filter === 'Price Range') {
    return /\b(range|between|from .* to|within)\b/.test(text);
  }

  if (filter === 'Hit Price') {
    return /\b(hit|reach|touch|at least|at or above|at or below)\b/.test(text);
  }

  return true;
}

export function CategoryPageContent({
  category,
  title,
  subtitle = '',
  statLabel = '',
  showTopicControls = true,
}: Props) {
  const { data, error, isLoading } = useEventsList();
  const [activeCryptoFilter, setActiveCryptoFilter] = useState<CryptoFilter>('All');
  const [activeLeftFilterId, setActiveLeftFilterId] = useState<string>('all');
  const [politicsSort, setPoliticsSort] = useState<EventSort>('24h-volume');
  const [politicsWindow, setPoliticsWindow] = useState<EventWindow>('all');
  const [politicsStatus, setPoliticsStatus] = useState<EventStatus>('active');

  useEffect(() => {
    setCategory(category);
  }, [category]);

  useEffect(() => {
    setActiveCryptoFilter('All');
    setActiveLeftFilterId('all');
    setPoliticsSort('24h-volume');
    setPoliticsWindow('all');
    setPoliticsStatus('active');
  }, [category]);

  const events: NormalizedEvent[] = useMemo(() => data?.events ?? [], [data?.events]);
  const categoryEvents = useMemo(() => events.filter((event) => event.category === category), [events, category]);
  const cryptoEvents = useMemo(() => events.filter((event) => event.category === 'crypto'), [events]);

  const leftSections = useMemo<LeftFilterSection[] | null>(() => {
    if (category === 'crypto') {
      const allItem: LeftFilterItem = { id: 'all', label: 'All', count: cryptoEvents.length, kind: 'all' };

      const timeframeItems: LeftFilterItem[] = CRYPTO_TIMEFRAMES.map((item) => ({
        id: `time-${item.label.toLowerCase().replace(/\s+/g, '-')}`,
        label: item.label,
        count: countByPatterns(cryptoEvents, item.patterns),
        kind: 'timeframe',
      }));

      const tagCounts = new Map<string, number>();
      for (const event of cryptoEvents) {
        for (const tag of event.tags) {
          const label = tag.trim();
          if (!label) continue;
          tagCounts.set(label, (tagCounts.get(label) ?? 0) + 1);
        }
      }

      const tagItems: LeftFilterItem[] = [...tagCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({
          id: `tag-${label.toLowerCase().replace(/\s+/g, '-')}`,
          label,
          count,
          kind: 'tag',
        }));

      const generalTags = tagItems.filter((item) => !CRYPTO_ASSET_LABELS.has(item.label.toLowerCase()));
      const assetTags = tagItems.filter((item) => CRYPTO_ASSET_LABELS.has(item.label.toLowerCase()));

      const sections: LeftFilterSection[] = [
        { id: 'crypto-main', items: [allItem, ...timeframeItems] },
        { id: 'crypto-general', items: generalTags, showDividerBefore: generalTags.length > 0 || assetTags.length > 0 },
        { id: 'crypto-assets', items: assetTags, showDividerBefore: assetTags.length > 0 },
      ];

      return sections.filter((section) => section.items.length > 0);
    }

    if (category === 'politics') {
      const tagCounts = new Map<string, number>();
      for (const event of categoryEvents) {
        for (const tag of event.tags) {
          const label = tag.trim();
          if (!label) continue;
          tagCounts.set(label, (tagCounts.get(label) ?? 0) + 1);
        }
      }

      const items: LeftFilterItem[] = [
        { id: 'all', label: 'All', count: categoryEvents.length, kind: 'all' },
        ...[...tagCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => ({
            id: `tag-${label.toLowerCase().replace(/\s+/g, '-')}`,
            label,
            count,
            kind: 'tag' as const,
          })),
      ];

      return [{ id: 'politics-main', items }];
    }

    return null;
  }, [category, categoryEvents, cryptoEvents]);

  const filteredEvents = useMemo(() => {
    const byCategory = categoryEvents;
    const next = category === 'crypto' ? byCategory.filter((event) => matchesCryptoFilter(event, activeCryptoFilter)) : byCategory;

    if (activeLeftFilterId === 'all') return next;

    const timeframe = CRYPTO_TIMEFRAMES.find(
      (item) => `time-${item.label.toLowerCase().replace(/\s+/g, '-')}` === activeLeftFilterId,
    );

    if (category === 'crypto' && timeframe) {
      return next.filter((event) => {
        const text = eventSearchText(event);
        return timeframe.patterns.some((pattern) => text.includes(pattern));
      });
    }

    const tagLabel = activeLeftFilterId.startsWith('tag-') ? activeLeftFilterId.slice(4).replace(/-/g, ' ') : '';
    if (!tagLabel) return next;

    return next.filter((event) => event.tags.some((tag) => tag.toLowerCase() === tagLabel));
  }, [categoryEvents, category, activeCryptoFilter, activeLeftFilterId]);

  const displayEvents = useMemo(
    () => applyTopFilters(filteredEvents, { sort: politicsSort, window: politicsWindow, status: politicsStatus }),
    [filteredEvents, politicsSort, politicsWindow, politicsStatus],
  );
  const featured = useMemo(() => displayEvents.slice(0, 6), [displayEvents]);

  return (
    <Wrapper>
      <PolymarketPriceFeed events={events} />
      <TabContentLayout
        title={title}
        leftContent={
          leftSections ? (
            <LeftFiltersColumn
              sections={leftSections}
              activeId={activeLeftFilterId}
              onSelect={setActiveLeftFilterId}
              ariaLabel={`${category} filters and topics`}
            />
          ) : undefined
        }
        inlineItems={category === 'crypto' && showTopicControls ? [...CRYPTO_FILTERS] : undefined}
        onInlineItemChange={category === 'crypto' ? (item) => setActiveCryptoFilter(item as CryptoFilter) : undefined}
        showSaveAction
        filterPanel={(
          <EventsFilterBar
            sort={politicsSort}
            onSortChange={setPoliticsSort}
            window={politicsWindow}
            onWindowChange={setPoliticsWindow}
            status={politicsStatus}
            onStatusChange={setPoliticsStatus}
            onClear={() => {
              setPoliticsSort('24h-volume');
              setPoliticsWindow('all');
              setPoliticsStatus('active');
            }}
            sortIcon={<TrendingUpIcon size={18} />}
          />
        )}
        rightTopExtra={(
          <div className={styles.heroRight}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>{statLabel}</span>
            </div>
          </div>
        )}
      >
        <p className={styles.subtitle}>{subtitle}</p>
        {error && <p className={styles.error}>Failed to load events. Try reload.</p>}
        {isLoading && <EventGridSkeleton />}

        {!isLoading && displayEvents.length === 0 && (
          <EventGridEmpty text={`No ${category} events yet.`} />
        )}

        {!isLoading && displayEvents.length > 0 && (
          <>
            <section className={styles.section}>
              <EventGrid events={featured} />
            </section>
          </>
        )}
      </TabContentLayout>
    </Wrapper>
  );
}
