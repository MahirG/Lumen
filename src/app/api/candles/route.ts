import { NextRequest, NextResponse } from 'next/server'
import { getLiveXAUCandles } from '@/lib/hisab/live-candles'
import { analyzeSMC } from '@/lib/hisab/smc-engine'
import type { Timeframe } from '@/lib/types/hisab'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_TIMEFRAMES: Timeframe[] = ['1M', '5M', '15M', '1H', '4H', 'D', 'W', 'M']

/**
 * GET /api/candles?timeframe=15M
 *
 * Returns REAL XAUUSD OHLC candles (built from live gold-api.com ticks — see
 * live-candles.ts) plus a Smart Money Concepts analysis computed on those
 * real candles. No placeholder or demo data at any point in this pipeline.
 */
export async function GET(req: NextRequest) {
  const tfParam = (req.nextUrl.searchParams.get('timeframe') ?? '15M') as Timeframe
  const timeframe = VALID_TIMEFRAMES.includes(tfParam) ? tfParam : '15M'

  try {
    const { candles, currentPrice, updatedAt, source } = await getLiveXAUCandles(timeframe)
    const analysis = analyzeSMC(candles, timeframe)

    return NextResponse.json({
      symbol: 'XAUUSD',
      timeframe,
      candles,
      analysis,
      currentPrice,
      updatedAt,
      source,
      candleCount: candles.length,
      isLive: true,
      timestamp: Date.now(),
    })
  } catch (err: any) {
    console.error('Candles API error:', err)
    return NextResponse.json(
      { error: 'Failed to build live candles', message: err.message },
      { status: 500 },
    )
  }
}
