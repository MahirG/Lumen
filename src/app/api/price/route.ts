import { NextResponse } from 'next/server'
import { fetchMarketSnapshot } from '@/lib/hisab/live-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/price
 * Returns the current real XAUUSD spot price and forex rates.
 * Data is cached server-side for 30s (gold) and 30min (forex).
 */
export async function GET() {
  try {
    const snapshot = await fetchMarketSnapshot()
    return NextResponse.json({
      gold: snapshot.gold,
      forex: {
        dxy: snapshot.forex.dxy,
        base: snapshot.forex.base,
        rates: {
          EUR: snapshot.forex.rates.EUR,
          JPY: snapshot.forex.rates.JPY,
          GBP: snapshot.forex.rates.GBP,
          CAD: snapshot.forex.rates.CAD,
          SEK: snapshot.forex.rates.SEK,
          CHF: snapshot.forex.rates.CHF,
        },
        updatedAt: snapshot.forex.updatedAt,
      },
      timestamp: snapshot.timestamp,
      disclaimer: 'Real-time data from gold-api.com & open.er-api.com. Educational use only.',
    })
  } catch (err: any) {
    console.error('Price API error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch market data', message: err.message },
      { status: 500 },
    )
  }
}
