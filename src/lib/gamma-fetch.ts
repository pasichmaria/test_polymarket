const GAMMA_API_BASE_URL = process.env.POLYMARKET_GAMMA_API_BASE_URL;
const JINA_PROXY_BASE_URL = process.env.POLYMARKET_JINA_PROXY_BASE_URL;

if (!GAMMA_API_BASE_URL) {
  throw new Error('Missing env: POLYMARKET_GAMMA_API_BASE_URL');
}

if (!JINA_PROXY_BASE_URL) {
  throw new Error('Missing env: POLYMARKET_JINA_PROXY_BASE_URL');
}
  
const USE_JINA_FALLBACK = process.env.POLYMARKET_USE_JINA_FALLBACK !== 'false';
const GAMMA_EVENTS_URL = `${GAMMA_API_BASE_URL}/events`;

function jinaProxyUrl(targetUrl: string): string {
  return `${JINA_PROXY_BASE_URL}${targetUrl.replace(/^https?:\/\//, '')}`;
}

function extractJsonFromJinaText(text: string): unknown {
  const marker = 'Markdown Content:';
  const fromMarker = text.includes(marker) ? text.slice(text.indexOf(marker) + marker.length) : text;
  const trimmed = fromMarker.trim();

  const arrStart = trimmed.indexOf('[');
  const objStart = trimmed.indexOf('{');
  const startCandidates = [arrStart, objStart].filter((v) => v >= 0);
  if (startCandidates.length === 0) {
    throw new Error('jina: json start not found');
  }

  const start = Math.min(...startCandidates);
  const arrEnd = trimmed.lastIndexOf(']');
  const objEnd = trimmed.lastIndexOf('}');
  const end = Math.max(arrEnd, objEnd);

  if (end < start) {
    throw new Error('jina: json end not found');
  }

  const jsonChunk = trimmed.slice(start, end + 1);
  return JSON.parse(jsonChunk);
}

async function fetchJsonWithJinaProxy(url: string): Promise<unknown> {
  const res = await fetch(jinaProxyUrl(url), {
    headers: { Accept: 'text/plain' },
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`jina ${res.status}`);
  }
  const text = await res.text();
  return extractJsonFromJinaText(text);
}

async function fetchGammaJson(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      throw new Error(`gamma ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    if (!USE_JINA_FALLBACK) throw error;
    return fetchJsonWithJinaProxy(url);
  }
}

export async function fetchGammaEventsRaw(limit: string, closed: string): Promise<unknown> {
  const url = `${GAMMA_EVENTS_URL}?closed=${closed}&limit=${encodeURIComponent(limit)}`;
  return fetchGammaJson(url);
}

export async function fetchGammaEventBySlugRaw(slug: string): Promise<unknown> {
  const url = `${GAMMA_API_BASE_URL}/events/slug/${encodeURIComponent(slug)}`;
  return fetchGammaJson(url);
}
