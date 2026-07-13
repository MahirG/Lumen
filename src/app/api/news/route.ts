import { NextRequest, NextResponse } from 'next/server'
import { getUpcomingNews, filterNews, shouldWarnForNews } from '@/lib/hisab/news'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const highImpact = searchParams.get('high') !== 'false'
  const mediumImpact = searchParams.get('medium') !== 'false'
  const lowImpact = searchParams.get('low') === 'true'
  const window = parseInt(searchParams.get('window') ?? '240')

  const events = getUpcomingNews()
  const filtered = filterNews(events, {
    highImpact, mediumImpact, lowImpact, windowMinutes: window,
  })
  const warning = shouldWarnForNews(events)

  return NextResponse.json({
    events: filtered,
    warning,
    total: events.length,
  })
}
