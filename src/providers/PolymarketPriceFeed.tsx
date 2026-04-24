'use client';

import { buildTokenRegistry } from '@/lib/token-registry';
import { applyClobEvent } from '@/services/apply-ws-price';
import { PolymarketMarketWebSocket } from '@/services/polymarket-websocket';
import { seedPricesFromEvents, setFeedMode } from '@/state/state.service';
import type { NormalizedEvent } from '@/types/market.types';
import { useEffect, useMemo, useRef } from 'react';

const MAX_ASSETS = 96;

type Props = {
  events: NormalizedEvent[];
};

/**
 * Seeds prices from Gamma, then connects to Polymarket `wss` market channel
 * (best bid/ask, last trade) when CLOB token IDs exist.
 */
export function PolymarketPriceFeed({ events }: Props) {
  const clientRef = useRef<PolymarketMarketWebSocket | null>(null);
  const registryRef = useRef<ReturnType<typeof buildTokenRegistry> | null>(null);
  const marketIdsKey = useMemo(
    () =>
      events
        .flatMap((event) => event.markets.map((market) => market.id))
        .sort()
        .join('|'),
    [events]
  );
  const assetIdsKey = useMemo(
    () =>
      events
        .flatMap((event) => event.markets.flatMap((market) => market.clobTokenIds))
        .filter(Boolean)
        .sort()
        .join('|'),
    [events]
  );

  useEffect(() => {
    seedPricesFromEvents(events);
  }, [events, marketIdsKey]);

  useEffect(() => {
    const { assetIds, byAsset } = buildTokenRegistry(events, MAX_ASSETS);
    registryRef.current = { assetIds, byAsset };

    if (assetIds.length === 0) {
      setFeedMode('idle');
      return;
    }

    setFeedMode('connecting');
    const client = new PolymarketMarketWebSocket({
      onEvent: (ev) => {
        const reg = registryRef.current;
        if (reg) applyClobEvent(ev, reg.byAsset);
      },
      onStatus: (s) => {
        setFeedMode(s);
      },
    });
    clientRef.current = client;
    client.connect(assetIds);

    return () => {
      client.disconnect();
      clientRef.current = null;
      setFeedMode('idle');
    };
  }, [events, assetIdsKey, marketIdsKey]);

  return null;
}
