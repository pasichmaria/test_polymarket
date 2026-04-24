import { fetchGammaEventBySlugRaw } from '@/lib/gamma-fetch';
import { mapGammaEvent } from '@/lib/gamma-mapper';
import { NextResponse } from 'next/server';

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { slug } = await context.params;

  try {
    const raw = (await fetchGammaEventBySlugRaw(slug)) as Record<string, unknown>;
    const event = mapGammaEvent(raw);
    if (!event) {
      return NextResponse.json({ event: null, error: 'parse' }, { status: 404 });
    }
    return NextResponse.json({ event, source: 'gamma' });
  } catch (e) {
    return NextResponse.json({ event: null, source: 'gamma', error: String(e) }, { status: 404 });
  }
}
