/**
 * Hisab Gold AI — Live Candle Aggregator
 *
 * Builds REAL OHLC candles for XAUUSD by bucketing actual live spot-price
 * ticks from gold-api.com (see live-data.ts) into timeframe-aligned bars.
 *
 * No random walks, no seeded/synthetic data — every candle is composed
 * exclusively from real prices observed at request time. History accumulates
 * naturally as the server stays warm; a cold start begins with a single
 * real-price candle and grows from there, per ApexEAPro Smart Chart Engine
 * rule: "Never use placeholder candles. Never use historical demo data."
 */

import type { Timeframe } from '@/lib/types/hisab'
import type { Candle } from '@/lib/hisab/smc-engine'
import { fetchGoldPrice } from '@/lib/hisab/live-data'

const MAX_CANDLES = 300

const TF_SECONDS: Record<Timeframe, number> = {
  '1M': 60,
  '5M': 300,
  '15M': 900,
  '1H': 3600,
  '4H': 14400,
  D: 86400,
  W: 604800,
  M: 2592000,
}

// Module-scope buffers persist across warm serverless invocations.
// Resets on cold start — real data still, just shorter history until it rebuilds.
const buffers = new Map<Timeframe, Candle[]>()

/**
 * Fetch the current real gold price and fold it into the live candle buffer
 * for the given timeframe. Returns the full (real) candle history so far.
 */
export async function getLiveXAUCandles(timeframe: Timeframe): Promise<{
  candles: Candle[]
  currentPrice: number
  updatedAt: number
  source: string
}> {
  const gold = await fetchGoldPrice()
  const price = gold.price
  const intervalMs = TF_SECONDS[timeframe] * 1000
  const bucketTime = Math.floor(Date.now() / intervalMs) * intervalMs

  let buf = buffers.get(timeframe)
  if (!buf) {
    buf = []
    buffers.set(timeframe, buf)
  }

  const last = buf[buf.length - 1]

  if (!last) {
    // Cold start — seed with a single real-price candle. History grows from here.
    buf.push({ time: bucketTime, open: price, high: price, low: price, close: price, volume: 1 })
  } else if (bucketTime > last.time) {
    // New timeframe interval elapsed — open a fresh real candle from the last close.
    buf.push({
      time: bucketTime,
      open: last.close,
      high: Math.max(last.close, price),
      low: Math.min(last.close, price),
      close: price,
      volume: 1,
    })
    if (buf.length > MAX_CANDLES) buf.shift()
  } else {
    // Same interval — fold this real tick into the forming candle, like a live feed does.
    last.high = Math.max(last.high, price)
    last.low = Math.min(last.low, price)
    last.close = price
    last.volume += 1
  }

  return {
    candles: buf.slice(),
    currentPrice: price,
    updatedAt: gold.updatedAt,
    source: gold.source,
  }
}
