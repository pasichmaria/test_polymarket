'use client';

import styles from './market-row.module.scss';
import { cn } from '@/lib/cn';
import { formatProbability, formatVolumeUsd } from '@/lib/format';
import { useMarketPrice } from '@/state/state.service';
import type { NormalizedMarket } from '@/types/market.types';
import Image from 'next/image';
import { memo } from 'react';

type Props = {
  market: NormalizedMarket;
  eventImage?: string | null;
  eventTitle?: string;
  eventVolumeUsd?: number;
  activeSide?: 'yes' | 'no';
  isSelected?: boolean;
  onSelect?: (marketId: string) => void;
  onPickSide?: (marketId: string, side: 'yes' | 'no') => void;
};

export const MarketRow = memo(function MarketRow({
  market,
  eventImage,
  eventVolumeUsd,
  activeSide,
  isSelected = false,
  onSelect,
  onPickSide,
}: Props) {
  const live = useMarketPrice(market.id);
  const rowTitle = market.question;
  const volumeLabel = formatVolumeUsd(eventVolumeUsd ?? market.volumeUsd);
  const yesCents = (live.yes * 100).toFixed(1);
  const noCents = (live.no * 100).toFixed(1);
  const deltaPct = ((live.yes - market.yesPrice) * 100).toFixed(1);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(market.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect?.(market.id);
        }
      }}
      className={cn(
        styles.row,
        isSelected && styles.rowSelected,
        live.flash === 'up' ? styles.rowUp : live.flash === 'down' ? styles.rowDown : undefined
      )}
    >
      <div className={styles.mediaWrap}>
        {eventImage ? (
          <Image
            src={eventImage}
            alt={rowTitle}
            fill
            className={styles.media}
            sizes="(max-width: 600px) 40px, 48px"
          />
        ) : (
          <div className={styles.mediaFallback} />
        )}
      </div>
      <div className={styles.meta}>
        <p className={styles.question}>{rowTitle}</p>
        <p className={styles.volume}>{volumeLabel}</p>
      </div>
      <div className={styles.percentWrap}>
        <div className={cn(styles.percent, live.flash === 'up' ? styles.up : live.flash === 'down' ? styles.down : undefined)}>
          {formatProbability(live.yes)}
        </div>
        {live.flash === 'up' ? (
          <span className={cn(styles.priceChangeBadge, styles.priceChangeUp)}>{`▲ +${Math.abs(Number(deltaPct)).toFixed(1)}%`}</span>
        ) : null}
        {live.flash === 'down' ? (
          <span className={cn(styles.priceChangeBadge, styles.priceChangeDown)}>{`▼ -${Math.abs(Number(deltaPct)).toFixed(1)}%`}</span>
        ) : null}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={cn(styles.actionBtn, styles.actionYes, activeSide === 'yes' && isSelected && styles.actionYesActive)}
          onClick={(event) => {
            event.stopPropagation();
            onPickSide?.(market.id, 'yes');
          }}
        >
          <span className={styles.buttonDefaultLabel}>Buy Yes </span>
          <span className={styles.buttonValueLabel}>{yesCents}¢</span>
        </button>
        <button
          type="button"
          className={cn(styles.actionBtn, styles.actionNo, activeSide === 'no' && isSelected && styles.actionNoActive)}
          onClick={(event) => {
            event.stopPropagation();
            onPickSide?.(market.id, 'no');
          }}
        >
          <span className={styles.buttonDefaultLabel}>Buy No </span>
          <span className={styles.buttonValueLabel}>{noCents}¢</span>
        </button>
      </div>
    </div>
  );
});
