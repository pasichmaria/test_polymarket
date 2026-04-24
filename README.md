## Stack

- Next.js 15 (App Router) · TypeScript · **Jotai**
- **Tailwind** (utilities in `globals.css`) + **SCSS modules** (feature components)
- **SWR** → `GET /api/events` (Gamma API + Jina fallback)
- **WebSocket** — Polymarket CLOB public market channel:  
  `wss://ws-subscriptions-clob.polymarket.com/ws/market`  
  Subscribes with outcome **token IDs** from Gamma’s `clobTokenIds` (see `src/lib/gamma-mapper.ts`).  
  If there are no token IDs (e.g. mock data), the app uses **local simulation**.
  In case you cannot connect to Polymarket WebSocket (network/region/provider issues), the app falls back to local simulation so prices still update in the UI.
 

## Run

```bash
cd /path/to/polymarket-app
pnpm install
pnpm dev
```

### Environment setup

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Default values work out of the box for local development.
3. Restart dev server after changing env values.

### Data source fallback (Gamma -> Jina)

Server-side event fetches use this flow:

1. Primary source: `POLYMARKET_GAMMA_API_BASE_URL` (default `https://gamma-api.polymarket.com`)
2. Fallback source: `POLYMARKET_JINA_PROXY_BASE_URL` (default `https://r.jina.ai/http://`)
3. Fallback switch: `POLYMARKET_USE_JINA_FALLBACK`
   - `true` (default): if Gamma request fails, retry via Jina proxy
   - `false`: do not retry, upstream failures propagate to `/api/events` (can return 502)

Why Jina is used:
- Jina acts as a resilient proxy path when direct access to Gamma is unstable.
- This is especially useful in some regions/networks (ISP routing, temporary geo/CDN issues).
- It helps keep `/api/events` responsive and reduces user-facing 502 errors during upstream outages.

Notes:
- Fallback is useful in regions/networks where direct Gamma routing is unstable.
- If you need strict direct-source behavior (no proxy), set `POLYMARKET_USE_JINA_FALLBACK=false`.
- If local dev shows intermittent 502 from `/api/events`, keep fallback enabled.

## API references

- [Gamma — list events](https://gamma-api.polymarket.com/events?closed=false) (used via `src/app/api/events`)
- [CLOB WebSocket — market channel](https://docs.polymarket.com/developers/CLOB/websocket/wss-overview)
- [API reference index](https://docs.polymarket.com/api-reference)

## Code map

| Path | Role |
|------|------|
| `src/services/polymarket-websocket.ts` | CLOB client, PING, reconnect |
| `src/services/apply-ws-price.ts` | `best_bid_ask` / `last_trade_price` → Jotai |
| `src/providers/PolymarketPriceFeed.tsx` | WS seed prices |
| `src/lib/token-registry.ts` | `clobTokenIds` → subscription batch |

## Architecture layout

- `src/app` — App Router pages and route handlers
- `src/components/layout` — layout components
- `src/components/domain/market` — market-specific UI blocks
- `src/api` — API endpoints constants + services layer
- `src/hooks/events` — feature hooks
- `src/types` — domain + DTO types (`market.types.ts`, `events.types.ts`, `prices-history.types.ts`)
- `src/styles` — shared `variables`, `mixins`, `globals`, entry `index.scss`

## Limitations

- Gamma API availability depends on network and region; fallback via Jina is used when enabled.
- WebSocket reliability depends on provider/region routing; when WS cannot connect, UI switches to simulation mode.
- Event/category normalization is heuristic and based on Gamma title/tags, so edge cases can be misclassified.
- Price updates are optimized for UI smoothness (atomic state + sampled chart points), not for trading-grade execution guarantees.

> Jotai `atomFamily` may log a v3 deprecation; see [jotai-family](https://github.com/jotaijs/jotai-family) for a future migration.
