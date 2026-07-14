import { NextRequest, NextResponse } from 'next/server'
import { fetchRealNews, filterNews, shouldWarnForNews } from '@/lib/hisab/news'

export const runtime = 'nodejs'
// Revalidate every 5 minutes at the edge
export const revalidate = 300

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const highImpact = searchParams.get('high') !== 'false'
  const mediumImpact = searchParams.get('medium') !== 'false'
  const lowImpact = searchParams.get('low') === 'true'
  const window = parseInt(searchParams.get('window') ?? '1440') // default 24h window

  try {
    const events = await fetchRealNews()
    const filtered = filterNews(events, {
      highImpact, mediumImpact, lowImpact, windowMinutes: window,
    })
    const warning = shouldWarnForNews(events)

    return NextResponse.json({
      events: filtered,
      warning,
      total: events.length,
      source: 'forex-factory',
      cached: false,
      timestamp: Date.now(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch news', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
