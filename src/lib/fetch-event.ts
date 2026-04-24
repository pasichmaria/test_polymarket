import { fetchGammaEventBySlugRaw } from '@/lib/gamma-fetch';
import { mapGammaEvent } from '@/lib/gamma-mapper';
import type { NormalizedEvent } from '@/types/market.types';

export async function fetchEventBySlugServer(slug: string): Promise<NormalizedEvent | null> {
  try {
    const raw = (await fetchGammaEventBySlugRaw(slug)) as Record<string, unknown>;
    return mapGammaEvent(raw);
  } catch {
    return null;
  }
}
