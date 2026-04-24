'use client';

import styles from './event-card.module.scss';
import { MarketCard } from './MarketCard';
import { formatVolumeUsd } from '@/lib/format';
import { useMarketPrice } from '@/state/state.service';
import type { NormalizedEvent } from '@/types/market.types';
import { memo } from 'react';

type Props = {
  event: NormalizedEvent;
  compact?: boolean;
};

type CardVariant = 'outcomes' | 'binary' | 'versus';

function toSafeLabel(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '[object Object]') return undefined;
    return trimmed;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value && typeof value === 'object') {
    const candidate =
      (value as { label?: unknown }).label ??
      (value as { name?: unknown }).name ??
      (value as { title?: unknown }).title;
    return toSafeLabel(candidate);
  }
  return undefined;
}

function dateLabel(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value * 100)));
}

function looksLikeTeamLabel(label: string): boolean {
  const normalized = label.toLowerCase().trim();
  if (!normalized) return false;

  const hasDateOrQuestionSyntax =
    normalized.includes(' by ') ||
    normalized.includes(' in ') ||
    normalized.includes('will ') ||
    normalized.includes('?') ||
    /\b(19|20)\d{2}\b/.test(normalized) ||
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/.test(
      normalized,
    );

  if (hasDateOrQuestionSyntax) return false;

  const words = normalized.split(/\s+/).filter(Boolean);
  return words.length <= 4 && normalized.length <= 28;
}

function resolveVariant(event: NormalizedEvent): CardVariant {
  const normalizedTitle = event.title.toLowerCase();
  const hasVersusInTitle = normalizedTitle.includes(' vs ') || normalizedTitle.includes(' v ');
  const [firstMarket, secondMarket] = event.markets;
  const hasTeamLikeOutcomes =
    !!firstMarket &&
    !!secondMarket &&
    looksLikeTeamLabel(firstMarket.question) &&
    looksLikeTeamLabel(secondMarket.question);

  const isVersus = event.category === 'sports' && event.markets.length >= 2 && (hasVersusInTitle || hasTeamLikeOutcomes);
  if (isVersus) return 'versus';

  const isBinary =
    normalizedTitle.includes('up') ||
    normalizedTitle.includes('down') ||
    normalizedTitle.includes('minute');
  if (isBinary) return 'binary';

  return 'outcomes';
}

export const EventCard = memo(function EventCard({ event, compact = false }: Props) {
  const cardClassName = compact ? styles.cardCompact : styles.cardDefault;
  const first = event.markets[0];
  const second = event.markets[1];
  const firstLive = useMarketPrice(first?.id ?? 'none');
  const secondLive = useMarketPrice(second?.id ?? 'none');

  if (!first) {
    return <MarketCard variant="empty" className={cardClassName} event={event} footer={{ volume: formatVolumeUsd(event.volumeUsd) }} />;
  }

  const variant = resolveVariant(event);
  const fallbackVolume = formatVolumeUsd(event.volumeUsd || first.volumeUsd);

  if (variant === 'binary') {
    const live = firstLive;
    const yes = clampPercent(live.yes);
    const badge = toSafeLabel(event.tags[0]);

    return (
      <MarketCard
        variant="binary"
        className={cardClassName}
        event={event}
        chance={yes}
        footer={{ volume: fallbackVolume, repeat: 'monthly', badge }}
      />
    );
  }

  if (variant === 'versus' && event.markets.length >= 2) {
    const left = event.markets[0];
    const right = event.markets[1];
    const leftLive = firstLive;
    const rightLive = secondLive;
    const leftScore = Math.round(leftLive.yes * 10) % 2;
    const rightScore = Math.round(rightLive.yes * 10) % 2;

    return (
      <MarketCard
        variant="versus"
        className={cardClassName}
        event={event}
        leftTeam={{ name: left.question, score: leftScore, percent: clampPercent(leftLive.yes) }}
        rightTeam={{ name: right.question, score: rightScore, percent: clampPercent(rightLive.yes) }}
        footer={{ volume: formatVolumeUsd(event.volumeUsd) }}
      />
    );
  }

  const live = firstLive;
  const primaryPercent = clampPercent(live.yes);
  const fallbackNo = clampPercent(1 - live.yes);
  const secondMarket = event.markets[1];
  const secondPercent = secondMarket ? clampPercent(secondMarket.yesPrice) : fallbackNo;

  return (
    <MarketCard
      variant="outcomes"
      className={cardClassName}
      event={event}
      rows={[
        { date: dateLabel(7), percent: primaryPercent },
        { date: dateLabel(30), percent: secondPercent },
      ]}
      footer={{ volume: fallbackVolume }}
    />
  );
});
