import { NextResponse } from 'next/server'
import { fetchMarketSnapshot, generateRealisticCandles } from '@/lib/hisab/live-data'
import { rsi, atr, adx } from '@/lib/hisab/smc-engine'
import { getCurrentSession } from '@/lib/hisab/sessions'
import { getUpcomingNews } from '@/lib/hisab/news'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const snapshot = await fetchMarketSnapshot()
    const livePrice = snapshot.gold.price
    const candles1M = generateRealisticCandles(livePrice, '1M', 100)
    const candles1H = generateRealisticCandles(livePrice, '1H', 100)
    const last = candles1M.at(-1)!
    const recent = candles1M.slice(-30)
    const change = livePrice - recent[0].open
    const changePct = (change / recent[0].open) * 100

    const session = getCurrentSession()
    const news = getUpcomingNews()
    const nextHigh = news.find(e => e.impact === 'HIGH' && e.minutesUntil <= 120)

    const closes = candles1H.map(c => c.close)
    const indicators = {
      rsi: rsi(closes),
      atr: atr(candles1H),
      trendStrength: adx(candles1H),
      volatility: (Math.max(...recent.map(c => c.high)) - Math.min(...recent.map(c => c.low))) / recent.length,
      volume: candles1H.slice(-20).reduce((s, c) => s + c.volume, 0) / 20,
      spread: 0.30,
    }

    return NextResponse.json({
      price: {
        symbol: 'XAUUSD',
        bid: livePrice - 0.15,
        ask: livePrice + 0.15,
        last: livePrice,
        change,
        changePct,
        high: Math.max(...recent.map(c => c.high)),
        low: Math.min(...recent.map(c => c.low)),
        open: recent[0].open,
        volume: recent.reduce((s, c) => s + c.volume, 0),
        timestamp: Date.now(),
      },
      indicators,
      session,
      nextNewsCountdown: nextHigh?.minutesUntil,
      newsEvent: nextHigh,
      gold: snapshot.gold,
      forex: { dxy: snapshot.forex.dxy, updatedAt: snapshot.forex.updatedAt },
      dataSource: snapshot.gold.source,
      lastUpdate: Date.now(),
    })
  } catch (err: any) {
    console.error('Dashboard API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
