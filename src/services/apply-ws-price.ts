import type { TokenMeta } from '@/lib/token-registry';
import { setMarketYes } from '@/state/state.service';

const PRICE_TICK_EVENT = 'polymarket:price-change-tick';

type PriceTickDetail = {
  marketId: string;
  price: number;
  timestamp: number;
  side: 'buy' | 'sell' | 'unknown';
  tradePrice: number | null;
  bestBid: number | null;
  bestAsk: number | null;
  size: number | null;
  hash: string | null;
  assetId: string;
};

function normalizeTimestamp(raw: unknown): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return Date.now();
  // Some feeds can send unix seconds instead of milliseconds.
  return value < 1_000_000_000_000 ? Math.round(value * 1_000) : Math.round(value);
}

function emitPriceTick(detail: PriceTickDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<PriceTickDetail>(PRICE_TICK_EVENT, { detail }));
}

export function applyClobEvent(msg: Record<string, unknown>, byAsset: Map<string, TokenMeta>) {
  const et = msg.event_type;
  const assetId = typeof msg.asset_id === 'string' ? msg.asset_id : String(msg.asset_id ?? '');

  if (et === 'best_bid_ask') {
    if (!assetId) return;
    const meta = byAsset.get(assetId);
    if (!meta) return;
    const bid = parseFloat(String(msg.best_bid));
    const ask = parseFloat(String(msg.best_ask));
    if (Number.isNaN(bid) || Number.isNaN(ask)) return;
    const mid = (bid + ask) / 2;
    const yes = meta.side === 'yes' ? mid : 1 - mid;
    setMarketYes(meta.marketId, yes);
    return;
  }

  if (et === 'last_trade_price') {
    if (!assetId) return;
    const meta = byAsset.get(assetId);
    if (!meta) return;
    const p = parseFloat(String(msg.price));
    if (Number.isNaN(p)) return;
    const yes = meta.side === 'yes' ? p : 1 - p;
    setMarketYes(meta.marketId, yes);
    return;
  }

  if (et === 'price_change') {
    const changes = Array.isArray(msg.price_changes) ? msg.price_changes : [];
    for (const change of changes) {
      if (!change || typeof change !== 'object') continue;
      const row = change as Record<string, unknown>;
      const rowAssetId = typeof row.asset_id === 'string' ? row.asset_id : String(row.asset_id ?? '');
      if (!rowAssetId) continue;
      const meta = byAsset.get(rowAssetId);
      if (!meta) continue;

      const bid = parseFloat(String(row.best_bid));
      const ask = parseFloat(String(row.best_ask));
      const tradePrice = parseFloat(String(row.price));

      let basePrice: number | null = null;
      if (!Number.isNaN(bid) && !Number.isNaN(ask) && bid > 0 && ask > 0) {
        basePrice = (bid + ask) / 2;
      } else if (!Number.isNaN(tradePrice)) {
        basePrice = tradePrice;
      }
      if (basePrice === null) continue;

      const yes = meta.side === 'yes' ? basePrice : 1 - basePrice;
      setMarketYes(meta.marketId, yes);
      const rawSide = typeof row.side === 'string' ? row.side.toLowerCase() : '';
      const side: PriceTickDetail['side'] = rawSide === 'buy' || rawSide === 'sell' ? rawSide : 'unknown';
      const timestamp = normalizeTimestamp(row.timestamp ?? msg.timestamp);
      emitPriceTick({
        marketId: meta.marketId,
        price: yes,
        timestamp,
        side,
        tradePrice: Number.isNaN(tradePrice) ? null : tradePrice,
        bestBid: Number.isNaN(bid) ? null : bid,
        bestAsk: Number.isNaN(ask) ? null : ask,
        size: Number.isNaN(Number(row.size)) ? null : Number(row.size),
        hash: typeof row.hash === 'string' ? row.hash : null,
        assetId: rowAssetId,
      });
    }
  }
}

export { PRICE_TICK_EVENT };
export type { PriceTickDetail };
