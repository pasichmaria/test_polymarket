import type { FeedMode } from '@/types/market.types';

const WS_URL = process.env.NEXT_PUBLIC_POLYMARKET_WS_MARKET_URL || '';

type Handlers = {
  onEvent: (event: Record<string, unknown>) => void;
  onStatus: (s: FeedMode) => void;
};

/**
 * CLOB public market WebSocket. Subscribes by outcome token (asset) IDs.
 * @see https://docs.polymarket.com/developers/CLOB/websocket/wss-overview
 */
export class PolymarketMarketWebSocket {
  private ws: WebSocket | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempt = 0;
  private readonly handlers: Handlers;
  private assetIds: string[] = [];
  private shouldRun = false;

  constructor(handlers: Handlers) {
    this.handlers = handlers;
  }

  connect(assetIds: string[]) {
    this.assetIds = [...new Set(assetIds)].filter(Boolean);
    if (this.assetIds.length === 0) {
      this.handlers.onStatus('simulation');
      return;
    }
    this.shouldRun = true;
    this.attempt = 0;
    this.handlers.onStatus('connecting');
    this.openSocket();
  }

  private openSocket() {
    if (!this.shouldRun) return;
    this.clearReconnectTimer();
    try {
      if (this.ws) {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.close();
        }
        this.ws = null;
      }
      this.ws = new WebSocket(WS_URL);
    } catch {
      this.handlers.onStatus('error');
      this.scheduleReconnect();
      return;
    }

    const ws = this.ws;

    ws.addEventListener('open', () => {
      if (!this.shouldRun || this.ws !== ws) {
        ws.close();
        return;
      }
      this.attempt = 0;
      this.handlers.onStatus('live');
      const sub = {
        assets_ids: this.assetIds,
        type: 'market',
        custom_feature_enabled: true,
        initial_dump: true,
      };
      ws.send(JSON.stringify(sub));
      this.startPing();
    });

    ws.addEventListener('message', (ev) => {
      const d = ev.data;
      if (typeof d !== 'string') return;
      if (d === 'PONG') return;
      try {
        const parsed = JSON.parse(d) as unknown;
        this.dispatchMessage(parsed);
      } catch {
        /* non-json heartbeat etc. */
      }
    });

    ws.addEventListener('error', () => {
      this.handlers.onStatus('error');
    });

    ws.addEventListener('close', () => {
      this.stopPing();
      if (this.shouldRun) {
        this.scheduleReconnect();
      }
    });
  }

  private dispatchMessage(parsed: unknown) {
    if (Array.isArray(parsed)) {
      for (const x of parsed) {
        if (x && typeof x === 'object') {
          this.handlers.onEvent(x as Record<string, unknown>);
        }
      }
      return;
    }
    if (parsed && typeof parsed === 'object') {
      this.handlers.onEvent(parsed as Record<string, unknown>);
    }
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      try {
        this.ws?.send('PING');
      } catch {

      }
    }, 10_000);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect() {
    if (!this.shouldRun) return;
    this.stopPing();
    this.handlers.onStatus('connecting');
    const delay = Math.min(12_000, 400 * 2 ** this.attempt);
    this.attempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.openSocket();
    }, delay);
  }

  disconnect() {
    this.shouldRun = false;
    this.clearReconnectTimer();
    this.stopPing();
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CLOSING) {
        this.ws.close();
      }
      this.ws = null;
    }
    this.handlers.onStatus('idle');
  }
}
