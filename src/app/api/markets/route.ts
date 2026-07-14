import { NextResponse } from 'next/server'
import { fetchAllSymbols } from '@/lib/hisab/multi-symbol'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/markets
 * Returns real-time prices for XAUUSD, EURUSD, GBPUSD, BTCUSD, NASDAQ, DXY.
 * Sources: gold-api.com, coingecko.com, open.er-api.com (no API keys needed).
 */
export async function GET() {
  try {
    const symbols = await fetchAllSymbols()
    return NextResponse.json({
      symbols,
      timestamp: Date.now(),
      sources: {
        XAUUSD: 'gold-api.com',
        EURUSD: 'open.er-api.com',
        GBPUSD: 'open.er-api.com',
        BTCUSD: 'coingecko.com',
        NASDAQ: 'simulated',
        DXY: 'computed from forex rates',
      },
    })
  } catch (err: any) {
    console.error('Markets API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
