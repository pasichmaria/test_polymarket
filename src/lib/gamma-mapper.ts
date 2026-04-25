import type { NormalizedEvent, NormalizedMarket } from '@/types/market.types';

type TagLike = { label?: unknown; slug?: unknown; name?: unknown; ticker?: unknown };

function parseMaybeJsonArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== 'string') return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Parse Polymarket-style outcome price payload (JSON string array or number[]). */
function parseOutcomePrices(raw: unknown): number[] {
  return parseMaybeJsonArray(raw)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

/** Parse CLOB outcome token IDs (JSON string array or string[]). */
function parseClobTokenIds(raw: unknown): string[] {
  return parseMaybeJsonArray(raw)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function toFiniteNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function normalizeCategoryToken(raw: string): string {
  return raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ');
}

const CATEGORY_KEYWORDS = {
  sports: ['sport', 'nfl', 'nba', 'soccer', 'tennis', 'mlb'],
  politics: ['politic', 'election', 'trump', 'biden', 'congress', 'senate'],
  crypto: ['crypto', 'bitcoin', 'eth', 'defi', 'solana'],
} as const;

function scoreCategorySegment(text: string, keywords: readonly string[], baseWeight: number): number {
  const normalized = normalizeCategoryToken(text);
  if (!normalized) return 0;

  const tokens = new Set(normalized.split(/\s+/).filter(Boolean));
  let score = 0;

  for (const keyword of keywords) {
    if (tokens.has(keyword)) {
      score += baseWeight + 1;
      continue;
    }
    if (normalized.includes(keyword)) {
      score += baseWeight;
    }
  }

  return score;
}

function normalizeBinaryPrices(yesRaw: number, noRaw: number): [number, number] {
  const yesClamped = clamp01(yesRaw);
  const noClamped = clamp01(noRaw);
  const total = yesClamped + noClamped;

  if (total <= 0) return [0.5, 0.5];
  return [yesClamped / total, noClamped / total];
}

function tagToString(tag: unknown): string | null {
  if (typeof tag === 'string') {
    const normalized = tag.trim();
    return normalized ? normalized : null;
  }

  if (tag && typeof tag === 'object') {
    const obj = tag as TagLike;
    const candidate = obj.label ?? obj.slug ?? obj.name ?? obj.ticker;
    if (typeof candidate === 'string') {
      const normalized = candidate.trim();
      return normalized ? normalized : null;
    }
  }

  return null;
}

function deriveCategory(tags: string[], title: string, description: string): string {
  const uniqueTags = Array.from(new Set(tags.map((tag) => normalizeCategoryToken(tag)).filter(Boolean)));
  const categories = Object.entries(CATEGORY_KEYWORDS) as Array<[category: string, keywords: readonly string[]]>;

  let bestCategory: string = 'all';
  let bestScore = 0;

  for (const [category, keywords] of categories) {
    const tagsScore = uniqueTags.reduce((acc, tag) => acc + scoreCategorySegment(tag, keywords, 3), 0);
    const titleScore = scoreCategorySegment(title, keywords, 2);
    const descriptionScore = scoreCategorySegment(description, keywords, 1);
    const totalScore = tagsScore + titleScore + descriptionScore;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestCategory = category;
    }
  }

  return bestCategory;
}

function marketFromGamma(m: Record<string, unknown>): NormalizedMarket | null {
  const id = String(m.id ?? m.conditionId ?? '').trim();
  if (!id) return null;
  const slug = typeof m.slug === 'string' ? m.slug : typeof m.marketSlug === 'string' ? m.marketSlug : undefined;
  const question = String(m.question ?? m.groupItemTitle ?? 'Market').trim() || 'Market';
  const prices = parseOutcomePrices(m.outcomePrices ?? m.outcomesPrices);
  const [yesPrice, noPrice] = normalizeBinaryPrices(prices[0] ?? 0.5, prices[1] ?? 0.5);
  const volumeUsd = toFiniteNumber(m.volumeNum ?? m.volume, 0);
  const clobTokenIds = parseClobTokenIds(m.clobTokenIds);

  return {
    id,
    slug,
    question,
    yesPrice,
    noPrice,
    volumeUsd,
    clobTokenIds,
  };
}

export function mapGammaEvent(raw: Record<string, unknown>): NormalizedEvent | null {
  const id = String(raw.id ?? '').trim();
  const slug = String(raw.slug ?? '').trim();
  if (!id || !slug) return null;

  const title = String(raw.title ?? 'Untitled').trim() || 'Untitled';
  const description = String(raw.description ?? '').trim();
  const image = raw.image ? String(raw.image) : null;
  const volumeUsd = toFiniteNumber(raw.volume ?? raw.volumeNum, 0);

  const tagValues = Array.isArray(raw.tags) ? raw.tags : typeof raw.tags === 'string' ? [raw.tags] : [];
  const tags = tagValues.reduce<string[]>((acc, tag) => {
    const normalized = tagToString(tag);
    if (normalized) acc.push(normalized);
    return acc;
  }, []);

  const marketsRaw = Array.isArray(raw.markets) ? raw.markets : [];
  const markets = marketsRaw.reduce<NormalizedMarket[]>((acc, rawMarket) => {
    if (!rawMarket || typeof rawMarket !== 'object') return acc;
    const mapped = marketFromGamma(rawMarket as Record<string, unknown>);
    if (mapped) acc.push(mapped);
    return acc;
  }, []);

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
