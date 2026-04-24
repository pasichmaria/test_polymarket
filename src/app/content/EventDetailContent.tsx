'use client';

import styles from './event-detail-content.module.scss';
import { pricesHistoryService } from '@/api/services';
import { MarketRow, TradePanel } from '@/components/domain/market';
import { Wrapper } from '@/components/layout';
import { PolymarketPriceFeed } from '@/providers/PolymarketPriceFeed';
import { PRICE_TICK_EVENT, type PriceTickDetail } from '@/services/apply-ws-price';
import { useFeedMode, useMarketPrice } from '@/state/state.service';
import type { NormalizedEvent } from '@/types/market.types';
import type { PricesHistoryResponseDTO } from '@/types/prices-history.types';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';

type Props = {
  event: NormalizedEvent;
};

type ChartPoint = { t: number; v: number };
type LastTick = PriceTickDetail | null;

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0.5;
  return Math.max(0.001, Math.min(0.999, value));
}

function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '--';
  return `${(value * 100).toFixed(1)}%`;
}

export function EventDetailContent({ event }: Props) {
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(
    event.markets[0]?.id ?? null
  );
  const [side, setSide] = useState<'yes' | 'no'>('yes');

  const selectedMarket = useMemo(
    () => event.markets.find((m) => m.id === selectedMarketId) ?? event.markets[0],
    [event.markets, selectedMarketId]
  );
  const feedEvents = useMemo(() => [event], [event]);

  return (
    <Wrapper>
      <PolymarketPriceFeed events={feedEvents} />
        <div className={styles.layout}>
          <div className={styles.panel}>
            <NativeLiveChart
              key={selectedMarket?.id ?? 'none'}
              marketId={selectedMarket?.id}
              eventId={event.id}
              historyTokenId={selectedMarket?.clobTokenIds?.[0]}
              eventTitle={event.title}
              marketQuestion={selectedMarket?.question}
            />
            {event.markets.map((m) => (
              <MarketRow
                key={m.id}
                market={m}
                eventImage={event.image}
                eventVolumeUsd={event.volumeUsd}
                activeSide={side}
                isSelected={selectedMarket?.id === m.id}
                onSelect={setSelectedMarketId}
                onPickSide={(marketId, nextSide) => {
                  setSelectedMarketId(marketId);
                  setSide(nextSide);
                }}
              />
            ))}
          </div>
          <TradePanel
            market={selectedMarket}
            eventTitle={event.title}
            eventImage={event.image}
            side={side}
            onSideChange={setSide}
          />
        </div>
    </Wrapper>
  );
}

function NativeLiveChart({
  marketId,
  eventId,
  historyTokenId,
  eventTitle,
  marketQuestion,
}: {
  marketId?: string;
  eventId: string;
  historyTokenId?: string;
  eventTitle: string;
  marketQuestion?: string;
}) {
  const live = useMarketPrice(marketId ?? 'none');
  const feedMode = useFeedMode();
  const [series, setSeries] = useState<ChartPoint[]>([]);
  const [lastTick, setLastTick] = useState<LastTick>(null);
  const MAX_POINTS = 120;
  const historyMarketKey = historyTokenId ?? marketId;
  const latestHistoryRequestRef = useRef(0);

  useEffect(() => {
    if (!historyMarketKey) {
      setSeries([]);
      return;
    }
    const requestMarketId = historyMarketKey;
    latestHistoryRequestRef.current += 1;
    const requestId = latestHistoryRequestRef.current;
    let disposed = false;

    async function loadPriceHistory() {
      try {
        const endTs = Math.floor(Date.now() / 1000);
        const startTs = endTs - 60 * 60 * 24;
        const payload: PricesHistoryResponseDTO = await pricesHistoryService.get({
          market: requestMarketId,
          interval: '1m',
          startTs,
          endTs,
          fidelity: 10,
        });
        if (disposed || requestId !== latestHistoryRequestRef.current) return;
        if (!Array.isArray(payload.history) || payload.history.length === 0) return;
        const nextSeries = payload.history
          .map((point: { t: number; p: number }) => ({
            t: Number(point.t) * 1000,
            v: clamp01(Number(point.p)),
          }))
          .filter((point: { t: number; v: number }) => Number.isFinite(point.t) && Number.isFinite(point.v))
          .slice(-MAX_POINTS);
        if (nextSeries.length > 0) {
          setSeries(nextSeries);
        }
      } catch {
        // Ignore transient network failures and continue with live ticks.
      }
    }

    void loadPriceHistory();

    return () => {
      disposed = true;
    };
  }, [eventId, marketId, historyMarketKey]);

  useEffect(() => {
    if (!marketId) {
      setSeries([]);
      setLastTick(null);
      return;
    }

    setSeries((prev) => (prev.length > 0 ? prev : [{ t: Date.now(), v: clamp01(live.yes) }]));
    setLastTick(null);

    const onTick = (event: Event) => {
      const custom = event as CustomEvent<PriceTickDetail>;
      const detail = custom.detail;
      if (!detail || detail.marketId !== marketId) return;
      const tickTs = Number(detail.timestamp);
      const nextTs = Number.isFinite(tickTs) ? tickTs : Date.now();
      const nextPrice = clamp01(detail.price);
      setSeries((prev) => {
        const last = prev[prev.length - 1];
        if (last && nextTs < last.t) {
          return prev;
        }
        if (last && nextTs === last.t) {
          const updated = [...prev];
          updated[updated.length - 1] = { t: last.t, v: nextPrice };
          return updated;
        }
        const next = [...prev, { t: nextTs, v: nextPrice }];
        return next.slice(-MAX_POINTS);
      });
      setLastTick(detail);
    };

    window.addEventListener(PRICE_TICK_EVENT, onTick as EventListener);
    return () => {
      window.removeEventListener(PRICE_TICK_EVENT, onTick as EventListener);
    };
  }, [marketId, live.yes]);

  const visiblePoints = useMemo(() => {
    if (series.length > 1) return series;
    const now = Date.now();
    return [
      { t: now - 1000, v: clamp01(live.yes) },
      { t: now, v: clamp01(live.yes) },
    ];
  }, [series, live.yes]);

  const chartDataPoints = useMemo(
    () => visiblePoints.map((point) => ({ t: point.t, price: Number((point.v * 100).toFixed(2)), rawPrice: point.v })),
    [visiblePoints]
  );
  const prices = chartDataPoints.map((point) => point.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const yPadding = Math.max(0.5, (maxPrice - minPrice) * 0.25);
  const yMin = Math.max(0, minPrice - yPadding);
  const yMax = Math.min(100, maxPrice + yPadding);

  const isLive = marketId && series.length > 2 && feedMode === 'live';
  const lastTickTime = lastTick ? new Date(lastTick.timestamp).toLocaleTimeString() : '--';
  const lastTickSideClass =
    lastTick?.side === 'buy'
      ? styles.tickSideBuy
      : lastTick?.side === 'sell'
        ? styles.tickSideSell
        : styles.tickSideUnknown;

  const chartTooltip = (props: TooltipContentProps) => {
    const payload = props.payload?.[0]?.payload as { t: number; price: number } | undefined;
    if (!props.active || !payload) return null;
    return (
      <div className={styles.chartTooltip}>
        <div>{new Date(payload.t).toLocaleTimeString()}</div>
        <div>{payload.price.toFixed(2)}%</div>
      </div>
    );
  };

  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartHead}>
        <span className={styles.chartTitle}>{marketQuestion ?? eventTitle}</span>
        <div className={styles.chartHeadRight}>
          <span className={styles.chartPrice}>{Math.round(live.yes * 100)}%</span>
        </div>
      </div>
      <div className={styles.chartSubhead}>
        <span className={isLive ? styles.liveBadge : styles.liveBadgeIdle}>
          {isLive ? 'Live' : 'Waiting for feed'}
        </span>
      </div>
      <div className={styles.tickBar}>
        <span className={lastTickSideClass}>{lastTick?.side?.toUpperCase() ?? '—'}</span>
        <span>P: {formatPct(lastTick?.tradePrice ?? lastTick?.price)}</span>
        <span>Bid: {formatPct(lastTick?.bestBid)}</span>
        <span>Ask: {formatPct(lastTick?.bestAsk)}</span>
        <span>Size: {lastTick?.size ? lastTick.size.toFixed(2) : '--'}</span>
        <span>T: {lastTickTime}</span>
      </div>
      <div className={styles.chartSvg}>
        {!marketId ? <div className={styles.chartEmpty}>Select a market to display chart</div> : null}
        <div className={styles.chartCanvas}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartDataPoints} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="rgba(42, 48, 64, 0.35)" strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                tick={{ fill: '#98a2b3', fontSize: 10 }}
                minTickGap={24}
                tickFormatter={(value) =>
                  new Date(Number(value)).toLocaleTimeString([], { minute: '2-digit', hour: '2-digit' })
                }
              />
              <YAxis
                domain={[yMin, yMax]}
                width={42}
                tick={{ fill: '#98a2b3', fontSize: 10 }}
                tickFormatter={(value) => `${Number(value).toFixed(1)}%`}
              />
              <Tooltip content={chartTooltip} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2797ff"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
