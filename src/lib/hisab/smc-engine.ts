/**
 * Hisab Gold AI — SMC / ICT Analysis Engine
 *
 * Pure functions that simulate Smart Money Concepts detection on OHLC candles.
 * This is a deterministic probability engine for educational purposes —
 * it never guarantees profits and is NOT financial advice.
 */

import type {
  SMCAnalysis, LiquidityLevel, OrderBlock, FairValueGap,
  StructureEvent, TrendDirection, Timeframe,
} from '@/lib/types/hisab'

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const ATR_PERIOD = 14
const RSI_PERIOD = 14

export function ema(values: number[], period: number): number[] {
  if (values.length === 0) return []
  const k = 2 / (period + 1)
  const out: number[] = [values[0]]
  for (let i = 1; i < values.length; i++) {
    out.push(values[i] * k + out[i - 1] * (1 - k))
  }
  return out
}

export function sma(values: number[], period: number): number[] {
  const out: number[] = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) { out.push(NaN); continue }
    const slice = values.slice(i - period + 1, i + 1)
    out.push(slice.reduce((a, b) => a + b, 0) / period)
  }
  return out
}

export function rsi(closes: number[], period = RSI_PERIOD): number {
  if (closes.length < period + 1) return 50
  let gains = 0, losses = 0
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff >= 0) gains += diff
    else losses -= diff
  }
  const avgGain = gains / period
  const avgLoss = losses / period
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

export function atr(candles: Candle[], period = ATR_PERIOD): number {
  if (candles.length < period + 1) return 0
  const trs: number[] = []
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i], p = candles[i - 1]
    const tr = Math.max(
      c.high - c.low,
      Math.abs(c.high - p.close),
      Math.abs(c.low - p.close),
    )
    trs.push(tr)
  }
  const slice = trs.slice(-period)
  return slice.reduce((a, b) => a + b, 0) / period
}

export function adx(candles: Candle[], period = 14): number {
  if (candles.length < period * 2) return 25
  let plusDM = 0, minusDM = 0, tr = 0
  for (let i = candles.length - period; i < candles.length; i++) {
    const c = candles[i], p = candles[i - 1]
    const up = c.high - p.high
    const down = p.low - c.low
    if (up > down && up > 0) plusDM += up
    if (down > up && down > 0) minusDM += down
    tr += Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close))
  }
  if (tr === 0) return 25
  const plusDI = (plusDM / tr) * 100
  const minusDI = (minusDM / tr) * 100
  const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI || 1) * 100
  return Math.min(100, dx * 1.4)
}

// Detect swing highs/lows using fractal pattern
export function findSwings(candles: Candle[], lookback = 3): { highs: number[]; lows: number[] } {
  const highs: number[] = []
  const lows: number[] = []
  for (let i = lookback; i < candles.length - lookback; i++) {
    let isHigh = true, isLow = true
    for (let j = i - lookback; j <= i + lookback; j++) {
      if (j === i) continue
      if (candles[j].high >= candles[i].high) isHigh = false
      if (candles[j].low <= candles[i].low) isLow = false
    }
    if (isHigh) highs.push(candles[i].high)
    if (isLow) lows.push(candles[i].low)
  }
  return { highs, lows }
}

// Detect Break of Structure (BOS) & Change of Character (CHoCH)
export function detectStructure(candles: Candle[], timeframe: Timeframe): {
  bosEvents: StructureEvent[]
  chochEvents: StructureEvent[]
  lastEvent?: StructureEvent
  swingHigh: number
  swingLow: number
  trend: TrendDirection
} {
  const { highs, lows } = findSwings(candles, 3)
  const bosEvents: StructureEvent[] = []
  const chochEvents: StructureEvent[] = []
  let lastDirection: 'BULLISH' | 'BEARISH' | null = null

  // Use most recent swings
  const recentHighs = highs.slice(-8)
  const recentLows = lows.slice(-8)

  let swingHigh = recentHighs.length ? Math.max(...recentHighs) : candles.at(-1)?.high ?? 0
  let swingLow = recentLows.length ? Math.min(...recentLows) : candles.at(-1)?.low ?? 0

  for (let i = 1; i < candles.length; i++) {
    const c = candles[i]
    const prevHigh = Math.max(...candles.slice(Math.max(0, i - 20), i).map(x => x.high))
    const prevLow = Math.min(...candles.slice(Math.max(0, i - 20), i).map(x => x.low))

    if (c.close > prevHigh) {
      const direction = 'BULLISH' as const
      if (lastDirection === 'BEARISH') {
        chochEvents.push({
          id: `choch-${i}-${timeframe}`,
          type: 'CHoCH',
          direction,
          price: c.close,
          timeframe,
          timestamp: c.time,
        })
      } else if (lastDirection === 'BULLISH') {
        bosEvents.push({
          id: `bos-${i}-${timeframe}`,
          type: 'BOS',
          direction,
          price: c.close,
          timeframe,
          timestamp: c.time,
        })
      }
      lastDirection = direction
    } else if (c.close < prevLow) {
      const direction = 'BEARISH' as const
      if (lastDirection === 'BULLISH') {
        chochEvents.push({
          id: `choch-${i}-${timeframe}`,
          type: 'CHoCH',
          direction,
          price: c.close,
          timeframe,
          timestamp: c.time,
        })
      } else if (lastDirection === 'BEARISH') {
        bosEvents.push({
          id: `bos-${i}-${timeframe}`,
          type: 'BOS',
          direction,
          price: c.close,
          timeframe,
          timestamp: c.time,
        })
      }
      lastDirection = direction
    }
  }

  const recentBull = bosEvents.filter(e => e.direction === 'BULLISH').slice(-2)
  const recentBear = bosEvents.filter(e => e.direction === 'BEARISH').slice(-2)
  const lastBull = recentBull.at(-1)
  const lastBear = recentBear.at(-1)
  let trend: TrendDirection = 'NEUTRAL'
  if (lastBull && (!lastBear || lastBull.timestamp > lastBear.timestamp)) trend = 'BULLISH'
  else if (lastBear && (!lastBull || lastBear.timestamp > lastBull.timestamp)) trend = 'BEARISH'

  const all = [...bosEvents, ...chochEvents].sort((a, b) => a.timestamp - b.timestamp)
  return {
    bosEvents,
    chochEvents,
    lastEvent: all.at(-1),
    swingHigh,
    swingLow,
    trend,
  }
}

// Detect Equal Highs / Equal Lows (liquidity pools)
export function detectEqualLevels(candles: Candle[], tolerance = 0.15): {
  equalHighs: number[]
  equalLows: number[]
} {
  const { highs, lows } = findSwings(candles, 2)
  const equalHighs: number[] = []
  const equalLows: number[] = []
  for (let i = 0; i < highs.length; i++) {
    for (let j = i + 1; j < highs.length; j++) {
      if (Math.abs(highs[i] - highs[j]) <= tolerance) {
        if (!equalHighs.includes(highs[i])) equalHighs.push(highs[i])
      }
    }
  }
  for (let i = 0; i < lows.length; i++) {
    for (let j = i + 1; j < lows.length; j++) {
      if (Math.abs(lows[i] - lows[j]) <= tolerance) {
        if (!equalLows.includes(lows[i])) equalLows.push(lows[i])
      }
    }
  }
  return { equalHighs, equalLows }
}

// Detect liquidity levels (buy-side above highs, sell-side below lows)
export function detectLiquidity(candles: Candle[], swingHighs: number[], swingLows: number[]): LiquidityLevel[] {
  const result: LiquidityLevel[] = []
  const lastClose = candles.at(-1)?.close ?? 0
  const recentHigh = Math.max(...candles.slice(-30).map(c => c.high))
  const recentLow = Math.min(...candles.slice(-30).map(c => c.low))

  // Buy-side liquidity: above recent swing highs
  const sortedHighs = [...new Set(swingHighs)].sort((a, b) => b - a).slice(0, 3)
  sortedHighs.forEach((price, i) => {
    const swept = lastClose > price
    result.push({
      price,
      type: 'BUY_SIDE',
      strength: i === 0 ? 'STRONG' : i === 1 ? 'MEDIUM' : 'WEAK',
      swept,
    })
  })
  // Sell-side liquidity
  const sortedLows = [...new Set(swingLows)].sort((a, b) => a - b).slice(0, 3)
  sortedLows.forEach((price, i) => {
    const swept = lastClose < price
    result.push({
      price,
      type: 'SELL_SIDE',
      strength: i === 0 ? 'STRONG' : i === 1 ? 'MEDIUM' : 'WEAK',
      swept,
    })
  })
  // Add current session extremes as liquidity
  result.push({
    price: recentHigh,
    type: 'BUY_SIDE',
    strength: 'MEDIUM',
    swept: lastClose >= recentHigh,
  })
  result.push({
    price: recentLow,
    type: 'SELL_SIDE',
    strength: 'MEDIUM',
    swept: lastClose <= recentLow,
  })
  return result
}

// Detect Order Blocks
export function detectOrderBlocks(candles: Candle[], timeframe: Timeframe): OrderBlock[] {
  const blocks: OrderBlock[] = []
  for (let i = 2; i < candles.length - 1; i++) {
    const prev = candles[i - 1], curr = candles[i], next = candles[i + 1]
    // Bullish OB: last down candle before strong up move
    const isDownCandle = prev.close < prev.open
    const isStrongUp = next.close > next.open && (next.close - next.open) > (prev.open - prev.close) * 1.5
    if (isDownCandle && isStrongUp) {
      const ob: OrderBlock = {
        id: `ob-bull-${i}-${timeframe}`,
        high: prev.high,
        low: prev.low,
        type: 'BULLISH',
        mitigated: false,
        mitigationPct: 0,
        timeframe,
      }
      // Check if mitigated by later candles
      for (let j = i + 2; j < candles.length; j++) {
        if (candles[j].low <= ob.high) {
          ob.mitigated = true
          const range = ob.high - ob.low || 1
          ob.mitigationPct = Math.min(100, ((ob.high - candles[j].low) / range) * 100)
        }
      }
      blocks.push(ob)
    }
    // Bearish OB
    const isUpCandle = prev.close > prev.open
    const isStrongDown = next.close < next.open && (next.open - next.close) > (prev.close - prev.open) * 1.5
    if (isUpCandle && isStrongDown) {
      const ob: OrderBlock = {
        id: `ob-bear-${i}-${timeframe}`,
        high: prev.high,
        low: prev.low,
        type: 'BEARISH',
        mitigated: false,
        mitigationPct: 0,
        timeframe,
      }
      for (let j = i + 2; j < candles.length; j++) {
        if (candles[j].high >= ob.low) {
          ob.mitigated = true
          const range = ob.high - ob.low || 1
          ob.mitigationPct = Math.min(100, ((candles[j].high - ob.low) / range) * 100)
        }
      }
      blocks.push(ob)
    }
  }
  // Return most recent unmitigated blocks first
  return blocks.slice(-8)
}

// Detect Fair Value Gaps (3-candle imbalance)
export function detectFVGs(candles: Candle[], timeframe: Timeframe): FairValueGap[] {
  const fvgs: FairValueGap[] = []
  for (let i = 2; i < candles.length; i++) {
    const c1 = candles[i - 2], c3 = candles[i]
    // Bullish FVG: c1.high < c3.low
    if (c1.high < c3.low) {
      const fvg: FairValueGap = {
        id: `fvg-bull-${i}-${timeframe}`,
        high: c3.low,
        low: c1.high,
        type: 'BULLISH',
        filled: false,
        fillPct: 0,
        timeframe,
        createdAt: c3.time,
      }
      for (let j = i + 1; j < candles.length; j++) {
        if (candles[j].low <= fvg.high) {
          const filledAmt = fvg.high - Math.max(candles[j].low, fvg.low)
          const range = fvg.high - fvg.low || 1
          fvg.fillPct = Math.min(100, (filledAmt / range) * 100)
          if (candles[j].low <= fvg.low) {
            fvg.filled = true
            fvg.fillPct = 100
          }
        }
      }
      fvgs.push(fvg)
    }
    // Bearish FVG: c1.low > c3.high
    if (c1.low > c3.high) {
      const fvg: FairValueGap = {
        id: `fvg-bear-${i}-${timeframe}`,
        high: c1.low,
        low: c3.high,
        type: 'BEARISH',
        filled: false,
        fillPct: 0,
        timeframe,
        createdAt: c3.time,
      }
      for (let j = i + 1; j < candles.length; j++) {
        if (candles[j].high >= fvg.low) {
          const filledAmt = Math.min(candles[j].high, fvg.high) - fvg.low
          const range = fvg.high - fvg.low || 1
          fvg.fillPct = Math.min(100, (filledAmt / range) * 100)
          if (candles[j].high >= fvg.high) {
            fvg.filled = true
            fvg.fillPct = 100
          }
        }
      }
      fvgs.push(fvg)
    }
  }
  return fvgs.slice(-12)
}

// Detect inducement (minor liquidity resting above/below OB)
export function detectInducement(candles: Candle[], orderBlocks: OrderBlock[]): { price: number; type: 'BUY' | 'SELL' }[] {
  const result: { price: number; type: 'BUY' | 'SELL' }[] = []
  const recent = candles.slice(-10)
  for (const ob of orderBlocks) {
    if (ob.mitigated) continue
    if (ob.type === 'BULLISH') {
      const minorHigh = Math.max(...recent.map(c => c.high))
      if (minorHigh < ob.high && minorHigh > ob.low) {
        result.push({ price: minorHigh, type: 'SELL' })
      }
    } else {
      const minorLow = Math.min(...recent.map(c => c.low))
      if (minorLow > ob.low && minorLow < ob.high) {
        result.push({ price: minorLow, type: 'BUY' })
      }
    }
  }
  return result
}

// Compute premium/discount zones using Fibonacci equilibrium
export function computePremiumDiscount(swingHigh: number, swingLow: number): {
  premiumZone: { high: number; low: number }
  discountZone: { high: number; low: number }
  equilibrium: number
} {
  const range = swingHigh - swingLow
  const equilibrium = swingLow + range * 0.5
  return {
    premiumZone: { high: swingHigh, low: equilibrium },
    discountZone: { high: equilibrium, low: swingLow },
    equilibrium,
  }
}

// Master SMC analysis function
export function analyzeSMC(candles: Candle[], timeframe: Timeframe): SMCAnalysis {
  const structure = detectStructure(candles, timeframe)
  const { equalHighs, equalLows } = detectEqualLevels(candles)
  const liquidity = detectLiquidity(candles, structure.swingHigh ? [structure.swingHigh] : [], structure.swingLow ? [structure.swingLow] : [])
  const orderBlocks = detectOrderBlocks(candles, timeframe)
  const fvgs = detectFVGs(candles, timeframe)
  const inducement = detectInducement(candles, orderBlocks)
  const zones = computePremiumDiscount(structure.swingHigh, structure.swingLow)

  const trendStrength = adx(candles)
  let resolvedTrend: TrendDirection = structure.trend
  if (trendStrength < 20) resolvedTrend = 'RANGING'

  return {
    trend: resolvedTrend,
    trendStrength,
    structure: {
      bosEvents: structure.bosEvents,
      chochEvents: structure.chochEvents,
      lastEvent: structure.lastEvent,
    },
    liquidity,
    orderBlocks,
    fvgs,
    equalHighs,
    equalLows,
    inducement,
    premiumZone: zones.premiumZone,
    discountZone: zones.discountZone,
    equilibrium: zones.equilibrium,
    swingHigh: structure.swingHigh,
    swingLow: structure.swingLow,
  }
}

// === Synthetic candle generation for demo / real-time simulation ===
// XAUUSD price is around $2,650 in 2025. We generate realistic OHLC with
// volatility scaled to timeframe.
const BASE_PRICE = 2650

export function generateCandles(timeframe: Timeframe, count = 200): Candle[] {
  const tfMultipliers: Record<Timeframe, number> = {
    '1M': 0.3,
    '5M': 0.6,
    '15M': 1.0,
    '1H': 2.5,
    '4H': 5.0,
    'D': 12,
    'W': 30,
    'M': 60,
  }
  const tfSeconds: Record<Timeframe, number> = {
    '1M': 60, '5M': 300, '15M': 900, '1H': 3600, '4H': 14400,
    'D': 86400, 'W': 604800, 'M': 2592000,
  }
  const volatility = tfMultipliers[timeframe]
  const interval = tfSeconds[timeframe]
  const now = Date.now()
  const candles: Candle[] = []
  let price = BASE_PRICE + (Math.random() - 0.5) * 50
  let trend = 0

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * interval * 1000
    // Drift cycles — sometimes trending, sometimes ranging
    if (i % 30 === 0) trend = (Math.random() - 0.5) * 0.4
    const noise = (Math.random() - 0.5) * volatility * 2
    const open = price
    const close = open + noise + trend * volatility
    const range = Math.abs(noise) * (1 + Math.random()) + volatility * 0.3
    const high = Math.max(open, close) + Math.random() * range * 0.5
    const low = Math.min(open, close) - Math.random() * range * 0.5
    const volume = 1000 + Math.random() * 5000 + Math.abs(noise) * 200
    candles.push({ time, open, high, low, close, volume })
    price = close
  }
  return candles
}

// Generate a single new candle tick (for real-time updates)
export function nextTick(lastCandle: Candle, timeframe: Timeframe): Candle {
  const tfMultipliers: Record<Timeframe, number> = {
    '1M': 0.05, '5M': 0.1, '15M': 0.2, '1H': 0.5, '4H': 1.2, 'D': 4, 'W': 10, 'M': 25,
  }
  const tfSeconds: Record<Timeframe, number> = {
    '1M': 60, '5M': 300, '15M': 900, '1H': 3600, '4H': 14400,
    'D': 86400, 'W': 604800, 'M': 2592000,
  }
  const vol = tfMultipliers[timeframe]
  const delta = (Math.random() - 0.5) * vol * 2
  const open = lastCandle.close
  const close = open + delta
  const high = Math.max(open, close) + Math.random() * vol * 0.3
  const low = Math.min(open, close) - Math.random() * vol * 0.3
  const volume = lastCandle.volume + (Math.random() - 0.5) * 500
  return {
    time: lastCandle.time + tfSeconds[timeframe] * 1000,
    open, high, low, close, volume,
  }
}

// Generate a single live tick (price update within current candle)
export function liveTick(currentPrice: number): number {
  const delta = (Math.random() - 0.5) * 0.8
  return Math.max(0, currentPrice + delta)
}
