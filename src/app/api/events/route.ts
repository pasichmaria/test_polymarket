import { fetchGammaEventsRaw } from '@/lib/gamma-fetch';
import { mapGammaEvent } from '@/lib/gamma-mapper';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ?? '40';
  const closed = searchParams.get('closed') ?? 'false';

  try {
    const data = await fetchGammaEventsRaw(limit, closed);
    const arr = Array.isArray(data) ? data : [];
    const events = arr
      .map((x) => mapGammaEvent(x as Record<string, unknown>))
      .filter(Boolean);

    return NextResponse.json({
      events,
      source: 'gamma',
    });
  } catch (e) {
    return NextResponse.json({
      events: [],
      source: 'gamma',
      error: e instanceof Error ? e.message : 'fetch failed',
    }, { status: 502 });
  }
}
