const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const EVENTS_LIST_PATH = process.env.NEXT_PUBLIC_EVENTS_LIST_PATH;
const EVENTS_DETAIL_PATH_TEMPLATE = process.env.NEXT_PUBLIC_EVENTS_DETAIL_PATH_TEMPLATE;
const CLOB_API_BASE_URL = process.env.NEXT_PUBLIC_POLYMARKET_CLOB_API_BASE_URL;

if (!EVENTS_LIST_PATH) {
  throw new Error('Missing env: NEXT_PUBLIC_EVENTS_LIST_PATH');
}

if (!EVENTS_DETAIL_PATH_TEMPLATE) {
  throw new Error('Missing env: NEXT_PUBLIC_EVENTS_DETAIL_PATH_TEMPLATE');
}

if (!CLOB_API_BASE_URL) {
  throw new Error('Missing env: NEXT_PUBLIC_POLYMARKET_CLOB_API_BASE_URL');
}

function resolveApiUrl(path: string): string {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export const API = {
  EVENTS: {
    GET_LIST: resolveApiUrl(EVENTS_LIST_PATH),
    GET_DETAIL: (slug: string) =>
      resolveApiUrl(EVENTS_DETAIL_PATH_TEMPLATE.replace('{slug}', encodeURIComponent(slug))),
  },
  PRICES_HISTORY: {
    GET_LIST: `${CLOB_API_BASE_URL}/prices-history`,
  },
} as const;
