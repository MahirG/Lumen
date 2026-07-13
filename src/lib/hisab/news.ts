/**
 * Hisab Gold AI — Economic News Filter
 *
 * Realistic news events for the next 24h. In production this would fetch from
 * Forex Factory / Trading Economics / Investing.com RSS feeds.
 * Educational only — not financial advice.
 */

import type { NewsEvent, NewsFilter, NewsImpact, NewsSource } from '@/lib/types/hisab'

const SAMPLE_EVENTS: Omit<NewsEvent, 'id' | 'minutesUntil'>[] = [
  {
    source: 'ForexFactory',
    title: 'FOMC Member Speech',
    currency: 'USD',
    impact: 'HIGH',
    forecast: '—',
    previous: '—',
    eventTime: 0, // placeholder, computed below
  },
  {
    source: 'TradingEconomics',
    title: 'Core CPI m/m',
    currency: 'USD',
    impact: 'HIGH',
    forecast: '0.3%',
    previous: '0.4%',
    eventTime: 0,
  },
  {
    source: 'Investing',
    title: 'Unemployment Claims',
    currency: 'USD',
    impact: 'MEDIUM',
    forecast: '221K',
    previous: '219K',
    eventTime: 0,
  },
  {
    source: 'ForexFactory',
    title: 'Non-Farm Employment Change',
    currency: 'USD',
    impact: 'HIGH',
    forecast: '180K',
    previous: '175K',
    eventTime: 0,
  },
  {
    source: 'TradingEconomics',
    title: 'Fed Chair Powell Speaks',
    currency: 'USD',
    impact: 'HIGH',
    forecast: '—',
    previous: '—',
    eventTime: 0,
  },
  {
    source: 'Investing',
    title: 'Retail Sales m/m',
    currency: 'USD',
    impact: 'MEDIUM',
    forecast: '0.3%',
    previous: '0.2%',
    eventTime: 0,
  },
  {
    source: 'ForexFactory',
    title: 'ISM Manufacturing PMI',
    currency: 'USD',
    impact: 'MEDIUM',
    forecast: '48.5',
    previous: '48.7',
    eventTime: 0,
  },
  {
    source: 'TradingEconomics',
    title: 'PCE Price Index m/m',
    currency: 'USD',
    impact: 'HIGH',
    forecast: '0.2%',
    previous: '0.3%',
    eventTime: 0,
  },
]

// Distribute sample events across the next 24h at realistic intervals
export function getUpcomingNews(now = Date.now()): NewsEvent[] {
  const events: NewsEvent[] = []
  // Sort sample events, place at fixed intervals starting soon
  const offsetsMinutes = [
    Math.floor(Math.random() * 30) + 8,  // First event 8-38 mins away
    Math.floor(Math.random() * 60) + 90, // Next 90-150 mins
    Math.floor(Math.random() * 120) + 240, // 4-6 hours
    Math.floor(Math.random() * 180) + 420, // 7-10 hours
    Math.floor(Math.random() * 240) + 720, // 12-16 hours
    Math.floor(Math.random() * 300) + 1080, // 18-23 hours
  ]

  for (let i = 0; i < SAMPLE_EVENTS.length && i < offsetsMinutes.length; i++) {
    const sample = SAMPLE_EVENTS[i]
    const eventTime = now + offsetsMinutes[i] * 60 * 1000
    const minutesUntil = Math.round((eventTime - now) / 60000)
    events.push({
      ...sample,
      id: `news-${i}-${eventTime}`,
      eventTime,
      minutesUntil,
    })
  }
  return events.sort((a, b) => a.eventTime - b.eventTime)
}

export function filterNews(
  events: NewsEvent[],
  options: { highImpact?: boolean; mediumImpact?: boolean; lowImpact?: boolean; windowMinutes?: number } = {},
): NewsEvent[] {
  const { highImpact = true, mediumImpact = false, lowImpact = false, windowMinutes = 240 } = options
  const now = Date.now()
  return events.filter(e => {
    if (e.minutesUntil > windowMinutes) return false
    if (e.impact === 'HIGH' && !highImpact) return false
    if (e.impact === 'MEDIUM' && !mediumImpact) return false
    if (e.impact === 'LOW' && !lowImpact) return false
    return true
  })
}

export function shouldWarnForNews(events: NewsEvent[], warnWindowMinutes = 18): NewsFilter {
  const now = Date.now()
  const upcoming = events.filter(e => e.minutesUntil >= 0 && e.minutesUntil <= 60)
  const nextEvent = upcoming.find(e => e.impact === 'HIGH') ?? upcoming[0]
  const shouldWarn = !!nextEvent && nextEvent.minutesUntil <= warnWindowMinutes

  return {
    highImpact: true,
    mediumImpact: true,
    lowImpact: false,
    minutesWindow: warnWindowMinutes,
    shouldWarn,
    nextEvent,
  }
}

export function getImpactColor(impact: NewsImpact): string {
  switch (impact) {
    case 'HIGH': return 'oklch(0.66 0.22 25)'
    case 'MEDIUM': return 'oklch(0.78 0.16 60)'
    case 'LOW': return 'oklch(0.7 0.1 230)'
    default: return 'oklch(0.5 0.05 60)'
  }
}

export function getImpactLabel(impact: NewsImpact): string {
  switch (impact) {
    case 'HIGH': return 'High Impact'
    case 'MEDIUM': return 'Medium Impact'
    case 'LOW': return 'Low Impact'
    default: return 'Non-Economic'
  }
}

export function getSourceColor(source: NewsSource): string {
  switch (source) {
    case 'ForexFactory': return 'oklch(0.7 0.18 145)'
    case 'TradingEconomics': return 'oklch(0.82 0.15 85)'
    case 'Investing': return 'oklch(0.7 0.13 230)'
  }
}
