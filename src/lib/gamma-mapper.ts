import type { NormalizedEvent, NormalizedMarket } from '@/types/market.types';

/** Parse Polymarket-style outcome price payload (string JSON array or number[]). */
function parseOutcomePrices(raw: unknown): number[] {
  if (Array.isArray(raw)) {
    return raw.map((x) => Number(x));
  }
  if (typeof raw === 'string') {
    try {
      const arr = JSON.parse(raw) as unknown;
      if (Array.isArray(arr)) return arr.map((x) => Number(x));
    } catch {
      return [];
    }
  }
  return [];
}

/** CLOB outcome token IDs (JSON string or string[] in Gamma). */
function parseClobTokenIds(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x));
  }
  if (typeof raw === 'string') {
    try {
      const arr = JSON.parse(raw) as unknown;
      if (Array.isArray(arr)) return arr.map((x) => String(x));
    } catch {
      return [];
    }
  }
  return [];
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function normalizeCategory(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, '-');
}

function tagToString(tag: unknown): string | null {
  if (typeof tag === 'string') {
    const normalized = tag.trim();
    return normalized ? normalized : null;
  }

  if (tag && typeof tag === 'object') {
    const obj = tag as { label?: unknown; slug?: unknown; name?: unknown; ticker?: unknown };
    const candidate = obj.label ?? obj.slug ?? obj.name ?? obj.ticker;
    if (typeof candidate === 'string') {
      const normalized = candidate.trim();
      return normalized ? normalized : null;
    }
  }

  return null;
}

function deriveCategory(tags: string[], title: string, description: string): string {
  const source = [title, description, ...tags]
    .map((x) => normalizeCategory(x))
    .join(' ');

  if (
    source.includes('sport') ||
    source.includes('nfl') ||
    source.includes('nba') ||
    source.includes('soccer') ||
    source.includes('tennis') ||
    source.includes('mlb')
  ) {
    return 'sports';
  }
  if (
    source.includes('politic') ||
    source.includes('election') ||
    source.includes('trump') ||
    source.includes('biden') ||
    source.includes('congress') ||
    source.includes('senate')
  ) {
    return 'politics';
  }
  if (
    source.includes('crypto') ||
    source.includes('bitcoin') ||
    source.includes('eth') ||
    source.includes('defi') ||
    source.includes('solana')
  ) {
    return 'crypto';
  }
  return 'crypto';
}

function marketFromGamma(m: Record<string, unknown>): NormalizedMarket | null {
  const id = String(m.id ?? m.conditionId ?? '');
  if (!id) return null;
  const slug = typeof m.slug === 'string' ? m.slug : typeof m.marketSlug === 'string' ? m.marketSlug : undefined;
  const question = String(m.question ?? m.groupItemTitle ?? 'Market');
  const prices = parseOutcomePrices(m.outcomePrices ?? m.outcomesPrices);
  const yes = clamp01(prices[0] ?? 0.5);
  const no = clamp01(prices[1] ?? 1 - yes);
  const vol = Number(m.volumeNum ?? m.volume ?? 0) || 0;
  const clobTokenIds = parseClobTokenIds(m.clobTokenIds);
  return {
    id,
    slug,
    question,
    yesPrice: yes,
    noPrice: no,
    volumeUsd: vol,
    clobTokenIds,
  };
}

export function mapGammaEvent(raw: Record<string, unknown>): NormalizedEvent | null {
  const id = String(raw.id ?? '');
  const slug = String(raw.slug ?? '');
  if (!id || !slug) return null;

  const title = String(raw.title ?? 'Untitled');
  const description = String(raw.description ?? '');
  const image = raw.image ? String(raw.image) : null;
  const volumeUsd = Number(raw.volume ?? raw.volumeNum ?? 0) || 0;

  const tags: string[] = Array.isArray(raw.tags)
    ? (raw.tags as unknown[]).map(tagToString).filter(Boolean) as string[]
    : typeof raw.tags === 'string'
      ? [raw.tags]
      : [];

  const marketsRaw = Array.isArray(raw.markets) ? (raw.markets as Record<string, unknown>[]) : [];
  const markets = marketsRaw.map(marketFromGamma).filter(Boolean) as NormalizedMarket[];

  return {
    id,
    slug,
    title,
    description,
    image,
    volumeUsd,
    tags,
    category: deriveCategory(tags, title, description),
    markets,
  };
}
