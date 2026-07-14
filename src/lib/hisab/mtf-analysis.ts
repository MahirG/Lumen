/**
 * Hisab Gold AI — Multi-Timeframe Analysis
 * Aggregates bias across all timeframes and produces alignment score.
 * For educational purposes only — not financial advice.
 */

import type { Timeframe, MTFAnalysis, TimeframeAnalysis, MarketBias, TradeSetup, SMCAnalysis, Candle } from '@/lib/types/hisab'
import { analyzeSMC, generateCandles } from './smc-engine'

const TIMEFRAMES: Timeframe[] = ['M', 'W', 'D', '4H', '1H', '15M', '5M', '1M']

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  'M': 'Monthly', 'W': 'Weekly', 'D': 'Daily', '4H': '4H',
  '1H': '1H', '15M': '15M', '5M': '5M', '1M': '1M',
}

export function getTimeframeLabel(tf: Timeframe): string {
  return TIMEFRAME_LABELS[tf]
}

export function getAllTimeframes(): Timeframe[] {
  return TIMEFRAMES
}

function smcToTimeframeAnalysis(smc: SMCAnalysis, tf: Timeframe): TimeframeAnalysis {
  let bias: MarketBias = 'NEUTRAL'
  if (smc.trend === 'BULLISH' && smc.swingHigh > smc.equilibrium) bias = 'BUY'
  else if (smc.trend === 'BEARISH' && smc.swingLow < smc.equilibrium) bias = 'SELL'

  let structure: TimeframeAnalysis['structure'] = 'RANGE'
  const lastEvent = smc.structure.lastEvent
  if (lastEvent) {
    if (lastEvent.type === 'BOS' && lastEvent.direction === 'BULLISH') structure = 'BOS_BULL'
    else if (lastEvent.type === 'BOS' && lastEvent.direction === 'BEARISH') structure = 'BOS_BEAR'
    else if (lastEvent.type === 'CHoCH' && lastEvent.direction === 'BULLISH') structure = 'CHoCH_BULL'
    else if (lastEvent.type === 'CHoCH' && lastEvent.direction === 'BEARISH') structure = 'CHoCH_BEAR'
  }

  const lastClose = smc.equilibrium
  let pd: TimeframeAnalysis['premiumDiscount'] = 'EQUILIBRIUM'
  if (lastClose > smc.equilibrium + (smc.swingHigh - smc.equilibrium) * 0.5) pd = 'PREMIUM'
  else if (lastClose < smc.equilibrium - (smc.equilibrium - smc.swingLow) * 0.5) pd = 'DISCOUNT'

  const liquiditySweep = smc.liquidity.some(l => l.swept)

  const notes: string[] = []
  if (smc.structure.chochEvents.length > 0) {
    const last = smc.structure.chochEvents.at(-1)!
    notes.push(`Recent CHoCH ${last.direction.toLowerCase()} at ${last.price.toFixed(2)}`)
  }
  if (smc.orderBlocks.filter(o => !o.mitigated).length > 0) {
    const ob = smc.orderBlocks.filter(o => !o.mitigated).at(-1)!
    notes.push(`Unmitigated ${ob.type.toLowerCase()} OB at ${ob.low.toFixed(2)}-${ob.high.toFixed(2)}`)
  }
  if (smc.fvgs.filter(f => !f.filled).length > 0) {
    notes.push(`${smc.fvgs.filter(f => !f.filled).length} unfilled FVGs`)
  }
  if (liquiditySweep) notes.push('Liquidity sweep detected')

  return {
    timeframe: tf,
    bias,
    trend: smc.trend,
    structure,
    premiumDiscount: pd,
    liquiditySweep,
    notes: notes.join('. ') || 'No notable SMC events',
  }
}

export function runMultiTimeframeAnalysis(customCandles?: Record<Timeframe, Candle[]>): MTFAnalysis {
  const analyses: Record<string, TimeframeAnalysis> = {}
  const candlesMap: Record<string, Candle[]> = {}
  const smcMap: Record<string, SMCAnalysis> = {}

  for (const tf of TIMEFRAMES) {
    const candles = customCandles?.[tf] ?? generateCandles(tf, 200)
    const smc = analyzeSMC(candles, tf)
    candlesMap[tf] = candles
    smcMap[tf] = smc
    analyses[tf] = smcToTimeframeAnalysis(smc, tf)
  }

  // Weight: higher timeframes dominate
  const weights: Record<Timeframe, number> = {
    'M': 4, 'W': 3, 'D': 2.5, '4H': 2, '1H': 1.5, '15M': 1, '5M': 0.7, '1M': 0.5,
  }
  let bullScore = 0, bearScore = 0, totalWeight = 0
  for (const tf of TIMEFRAMES) {
    const w = weights[tf]
    const a = analyses[tf]
    if (a.bias === 'BUY') bullScore += w
    else if (a.bias === 'SELL') bearScore += w
    totalWeight += w
  }

  let overallBias: MarketBias = 'NEUTRAL'
  const bullPct = bullScore / totalWeight
  const bearPct = bearScore / totalWeight
  if (bullPct > 0.6) overallBias = 'BUY'
  else if (bearPct > 0.6) overallBias = 'SELL'
  else if (bullPct > bearPct) overallBias = 'BUY'

  const alignment = Math.round(Math.max(bullPct, bearPct) * 100)
  const overallConfidence = Math.min(95, alignment + Math.round((bullScore + bearScore) / totalWeight * 25))

  return {
    monthly: analyses['M'],
    weekly: analyses['W'],
    daily: analyses['D'],
    h4: analyses['4H'],
    h1: analyses['1H'],
    m15: analyses['15M'],
    m5: analyses['5M'],
    m1: analyses['1M'],
    overallBias,
    overallConfidence,
    alignment,
  }
}

// Generate a complete trade setup based on SMC + MTF analysis
export function generateTradeSetup(smc: SMCAnalysis, mtf: MTFAnalysis, currentPrice: number): TradeSetup {
  const bias = mtf.overallBias
  const confidence = mtf.overallConfidence
  const reasons: string[] = []

  if (mtf.alignment > 70) {
    reasons.push(`${mtf.alignment}% timeframe alignment favors ${bias.toLowerCase()}`)
  }

  // Find relevant OB
  const relevantOBs = smc.orderBlocks.filter(ob => !ob.mitigated)
  const lastBullOB = relevantOBs.filter(o => o.type === 'BULLISH').at(-1)
  const lastBearOB = relevantOBs.filter(o => o.type === 'BEARISH').at(-1)

  const lastChoch = smc.structure.chochEvents.at(-1)
  if (lastChoch) {
    reasons.push(`CHoCH detected (${lastChoch.direction.toLowerCase()}) — short-term reversal signal`)
  }
  const lastBos = smc.structure.bosEvents.at(-1)
  if (lastBos) {
    reasons.push(`BOS confirms ${lastBos.direction.toLowerCase()} continuation`)
  }

  // Find unfilled FVGs
  const unfilledFVGs = smc.fvgs.filter(f => !f.filled)
  if (unfilledFVGs.length > 0) {
    reasons.push(`${unfilledFVGs.length} unfilled FVGs provide imbalance zones`)
  }

  // Liquidity sweep
  const sweptLevels = smc.liquidity.filter(l => l.swept)
  if (sweptLevels.length > 0) {
    reasons.push(`Liquidity sweep detected (${sweptLevels.length} levels) — smart money accumulation`)
  }

  // Premium/discount
  if (currentPrice < smc.equilibrium) {
    reasons.push('Price in discount zone — premium entry for longs')
  } else {
    reasons.push('Price in premium zone — premium entry for shorts')
  }

  // Build entry/SL/TP levels
  let entryZone: TradeSetup['entryZone']
  let stopLoss: number
  let takeProfit1: number
  let takeProfit2: number
  let takeProfit3: number
  let invalidation: string
  let invalidationLevels: number[] = []
  let expectedSession: TradeSetup['expectedSession'] = 'LONDON'

  const range = smc.swingHigh - smc.swingLow
  const atrVal = range * 0.02 // approx ATR

  if (bias === 'BUY') {
    const ob = lastBullOB
    if (ob) {
      entryZone = {
        low: ob.low,
        high: ob.high,
        optimal: (ob.low + ob.high) / 2,
      }
      reasons.push(`Entry in bullish OB at ${ob.low.toFixed(2)}-${ob.high.toFixed(2)}`)
    } else if (smc.discountZone.high > 0) {
      entryZone = {
        low: smc.discountZone.low,
        high: smc.discountZone.high,
        optimal: smc.equilibrium - (smc.equilibrium - smc.discountZone.low) * 0.3,
      }
    } else {
      entryZone = { low: currentPrice - atrVal, high: currentPrice + atrVal * 0.5, optimal: currentPrice - atrVal * 0.3 }
    }
    stopLoss = entryZone.low - atrVal * 1.2
    takeProfit1 = entryZone.optimal + (entryZone.optimal - stopLoss) * 1
    takeProfit2 = entryZone.optimal + (entryZone.optimal - stopLoss) * 2
    takeProfit3 = entryZone.optimal + (entryZone.optimal - stopLoss) * 3
    invalidation = `Trade invalid if price closes below ${stopLoss.toFixed(2)} — invalidates bullish structure`
    invalidationLevels = [stopLoss, smc.swingLow - atrVal * 0.5]
    // Choose session based on liquidity location
    expectedSession = sweptLevels.some(l => l.type === 'SELL_SIDE') ? 'LONDON' : 'NEW_YORK'
  } else if (bias === 'SELL') {
    const ob = lastBearOB
    if (ob) {
      entryZone = {
        low: ob.low,
        high: ob.high,
        optimal: (ob.low + ob.high) / 2,
      }
      reasons.push(`Entry in bearish OB at ${ob.low.toFixed(2)}-${ob.high.toFixed(2)}`)
    } else if (smc.premiumZone.high > 0) {
      entryZone = {
        low: smc.premiumZone.low,
        high: smc.premiumZone.high,
        optimal: smc.equilibrium + (smc.premiumZone.high - smc.equilibrium) * 0.3,
      }
    } else {
      entryZone = { low: currentPrice - atrVal * 0.5, high: currentPrice + atrVal, optimal: currentPrice + atrVal * 0.3 }
    }
    stopLoss = entryZone.high + atrVal * 1.2
    takeProfit1 = entryZone.optimal - (stopLoss - entryZone.optimal) * 1
    takeProfit2 = entryZone.optimal - (stopLoss - entryZone.optimal) * 2
    takeProfit3 = entryZone.optimal - (stopLoss - entryZone.optimal) * 3
    invalidation = `Trade invalid if price closes above ${stopLoss.toFixed(2)} — invalidates bearish structure`
    invalidationLevels = [stopLoss, smc.swingHigh + atrVal * 0.5]
    expectedSession = sweptLevels.some(l => l.type === 'BUY_SIDE') ? 'NEW_YORK' : 'LONDON'
  } else {
    entryZone = { low: currentPrice - atrVal, high: currentPrice + atrVal, optimal: currentPrice }
    stopLoss = currentPrice - atrVal * 1.5
    takeProfit1 = currentPrice + atrVal * 1.5
    takeProfit2 = currentPrice + atrVal * 3
    takeProfit3 = currentPrice + atrVal * 4.5
    invalidation = 'No clear directional bias — wait for confirmation CHoCH before entry'
    invalidationLevels = [stopLoss]
    expectedSession = 'LONDON'
  }

  const risk = Math.abs(entryZone.optimal - stopLoss)
  const reward1 = Math.abs(takeProfit1 - entryZone.optimal)
  const riskReward = risk > 0 ? Math.round((reward1 / risk) * 100) / 100 : 0

  return {
    bias,
    confidence,
    reasons,
    entryZone,
    stopLoss,
    takeProfit1,
    takeProfit2,
    takeProfit3,
    riskReward,
    invalidation,
    expectedSession,
    invalidationLevels,
  }
}
