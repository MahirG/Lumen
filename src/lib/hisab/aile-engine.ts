/**
 * AILE v1.0 — Apex Institutional Liquidity Engine
 *
 * 12-phase institutional Smart Money Concepts analysis engine.
 *
 * PHILOSOPHY:
 *   "Never force trades. Patience is edge.
 *    Liquidity comes first. Structure comes second.
 *    Order Block comes third. Entry comes last.
 *    If one condition is missing, output WAIT."
 *
 * Educational only — never financial advice. Probability-based analysis.
 */

import type { Timeframe, TrendDirection, TradingSession, SMCAnalysis, MTFAnalysis, Candle } from '../types/hisab'
import type {
  AILEAnalysis, HTFContext, TimeframeBias, LiquidityPool, KeyLevel,
  InstitutionalOB, FVGZone, BreakerBlock, MitigationBlock,
  FibonacciFramework, LiquidityConfirmation, StructureConfirmation,
  OBDetection, EntryConditions, RiskManagement, TradeManagement,
  ConfidenceScore, AILEOutput,
} from '../types/aile'
import {
  analyzeSMC, generateCandles, rsi, atr, adx, findSwings,
  detectStructure, detectEqualLevels, detectLiquidity, detectOrderBlocks,
  detectFVGs, detectInducement, computePremiumDiscount,
} from './smc-engine'
import { runMultiTimeframeAnalysis } from './mtf-analysis'
import { getCurrentSession } from './sessions'
import { getUpcomingNews, shouldWarnForNews } from './news'

const formatNum = (n: number) => Number(n.toFixed(2))

// ============================================================
// PHASE 1 — HIGHER TIMEFRAME CONTEXT
// ============================================================

function buildTimeframeBias(candles: Candle[], timeframe: Timeframe): TimeframeBias {
  const smc = analyzeSMC(candles, timeframe)
  const pd = computePremiumDiscount(smc.swingHigh, smc.swingLow)
  const lastClose = candles.at(-1)?.close ?? 0

  let bias: TimeframeBias['bias'] = 'NEUTRAL'
  if (smc.trend === 'BULLISH') bias = 'BULLISH'
  else if (smc.trend === 'BEARISH') bias = 'BEARISH'

  let pdZone: TimeframeBias['premiumDiscount'] = 'EQUILIBRIUM'
  if (lastClose > smc.equilibrium + (pd.premiumZone.high - smc.equilibrium) * 0.3) pdZone = 'PREMIUM'
  else if (lastClose < smc.equilibrium - (smc.equilibrium - pd.discountZone.low) * 0.3) pdZone = 'DISCOUNT'

  const notes: string[] = []
  const lastBos = smc.structure.bosEvents.at(-1)
  const lastChoch = smc.structure.chochEvents.at(-1)
  if (lastChoch) notes.push(`${lastChoch.direction} CHoCH`)
  if (lastBos) notes.push(`${lastBos.direction} BOS`)
  if (smc.liquidity.some(l => l.swept)) notes.push('liq sweep')
  const unmitOBs = smc.orderBlocks.filter(o => !o.mitigated).length
  if (unmitOBs > 0) notes.push(`${unmitOBs} fresh OBs`)

  return {
    timeframe,
    trend: smc.trend,
    bias,
    premiumDiscount: pdZone,
    swingHigh: smc.swingHigh,
    swingLow: smc.swingLow,
    notes: notes.join(', ') || 'no notable events',
  }
}

function rankOrderBlock(
  ob: { id: string; high: number; low: number; type: 'BULLISH' | 'BEARISH'; mitigated: boolean; mitigationPct: number; timeframe: Timeframe },
  candles: Candle[],
  fibZone: { high: number; low: number } | null,
  fvgs: FVGZone[],
): InstitutionalOB {
  // Find the OB candle to check volume
  const obRange = ob.high - ob.low
  const obIndex = candles.findIndex(c => c.low <= ob.high && c.high >= ob.low)
  const obCandle = obIndex >= 0 ? candles[obIndex] : null
  const avgVolume = candles.slice(-20).reduce((s, c) => s + c.volume, 0) / 20
  const highVolume = obCandle ? obCandle.volume > avgVolume * 1.3 : false

  // Institutional candle: large body relative to range
  const institutional = obCandle ? Math.abs(obCandle.close - obCandle.open) > obRange * 0.6 : false

  // FVG confluence: any unfilled FVG overlapping the OB
  const fvgConfluence = fvgs.some(f =>
    !f.filled &&
    f.type === (ob.type === 'BULLISH' ? 'BULLISH' : 'BEARISH') &&
    f.low <= ob.high && f.high >= ob.low
  )

  // Fib confluence: OB overlaps OTE zone
  const fibConfluence = fibZone ? (ob.low <= fibZone.high && ob.high >= fibZone.low) : false

  const fresh = !ob.mitigated
  const unmitigated = ob.mitigationPct < 50

  // Score: 0-100
  let score = 0
  if (fresh) score += 30
  if (unmitigated) score += 20
  if (highVolume) score += 20
  if (institutional) score += 15
  if (fvgConfluence) score += 10
  if (fibConfluence) score += 5

  let rank: InstitutionalOB['rank'] = 'REJECT'
  if (score >= 80) rank = 'A_PLUS'
  else if (score >= 60) rank = 'A'
  else if (score >= 40) rank = 'B'

  return {
    id: ob.id,
    high: ob.high,
    low: ob.low,
    type: ob.type,
    timeframe: ob.timeframe,
    fresh,
    unmitigated,
    highVolume,
    institutional,
    rank,
    fvgConfluence,
    fibConfluence,
    score,
    description: `${ob.type} OB ${formatNum(ob.low)}-${formatNum(ob.high)} | Rank ${rank} | Score ${score}/100 | ${fresh ? 'Fresh' : 'Mitigated'} | ${highVolume ? 'High Vol' : 'Avg Vol'}${fvgConfluence ? ' | FVG confluence' : ''}${fibConfluence ? ' | Fib confluence' : ''}`,
  }
}

function buildLiquidityPools(smc: SMCAnalysis, timeframe: Timeframe): LiquidityPool[] {
  const pools: LiquidityPool[] = []
  for (const liq of smc.liquidity) {
    // Determine if internal (within recent range) or external (beyond)
    const range = smc.swingHigh - smc.swingLow
    const isExternal = liq.type === 'BUY_SIDE'
      ? liq.price >= smc.swingHigh - range * 0.05
      : liq.price <= smc.swingLow + range * 0.05
    pools.push({
      price: liq.price,
      type: liq.type,
      scope: isExternal ? 'EXTERNAL' : 'INTERNAL',
      strength: liq.strength,
      swept: liq.swept,
      description: `${liq.type === 'BUY_SIDE' ? 'Buy-side' : 'Sell-side'} ${isExternal ? 'external' : 'internal'} liquidity at ${formatNum(liq.price)}${liq.swept ? ' (SWEPT)' : ''}`,
    })
  }
  return pools
}

function buildKeyLevels(
  smcByTf: Record<Timeframe, SMCAnalysis>,
  fib: FibonacciFramework,
  currentPrice: number,
): KeyLevel[] {
  const levels: KeyLevel[] = []
  const tolerance = currentPrice * 0.005 // 0.5% tolerance for "at level"

  // Daily OBs
  for (const ob of smcByTf.D.orderBlocks.filter(o => !o.mitigated)) {
    const mid = (ob.low + ob.high) / 2
    levels.push({
      price: mid,
      type: 'DAILY_OB',
      strength: 'STRONG',
      description: `Daily ${ob.type} OB at ${formatNum(ob.low)}-${formatNum(ob.high)}`,
      confluence: 1,
    })
  }
  // 4H OBs
  for (const ob of smcByTf['4H'].orderBlocks.filter(o => !o.mitigated)) {
    const mid = (ob.low + ob.high) / 2
    levels.push({
      price: mid,
      type: '4H_OB',
      strength: 'MEDIUM',
      description: `4H ${ob.type} OB at ${formatNum(ob.low)}-${formatNum(ob.high)}`,
      confluence: 1,
    })
  }
  // Weekly OBs
  for (const ob of smcByTf.W.orderBlocks.filter(o => !o.mitigated)) {
    const mid = (ob.low + ob.high) / 2
    levels.push({
      price: mid,
      type: 'WEEKLY_OB',
      strength: 'STRONG',
      description: `Weekly ${ob.type} OB at ${formatNum(ob.low)}-${formatNum(ob.high)}`,
      confluence: 1,
    })
  }
  // Liquidity
  for (const liq of smcByTf.D.liquidity) {
    levels.push({
      price: liq.price,
      type: 'LIQUIDITY',
      strength: liq.strength === 'STRONG' ? 'STRONG' : liq.strength === 'MEDIUM' ? 'MEDIUM' : 'WEAK',
      description: `${liq.type === 'BUY_SIDE' ? 'Buy-side' : 'Sell-side'} liquidity at ${formatNum(liq.price)}`,
      confluence: 1,
    })
  }
  // Equal highs/lows
  for (const eh of smcByTf.D.equalHighs) {
    levels.push({ price: eh, type: 'EQUAL_HIGHS', strength: 'MEDIUM', description: `Equal highs at ${formatNum(eh)}`, confluence: 1 })
  }
  for (const el of smcByTf.D.equalLows) {
    levels.push({ price: el, type: 'EQUAL_LOWS', strength: 'MEDIUM', description: `Equal lows at ${formatNum(el)}`, confluence: 1 })
  }
  // Fibonacci levels
  for (const level of fib.levels) {
    if (level.label === '0.618' || level.label === '0.705' || level.label === '0.79' || level.label === '0.5') {
      levels.push({
        price: level.price,
        type: 'FIBONACCI',
        strength: level.zone === 'OTE' ? 'STRONG' : 'MEDIUM',
        description: `Fibonacci ${level.label} at ${formatNum(level.price)} (${level.zone})`,
        confluence: 1,
      })
    }
  }
  // Previous high/low
  levels.push({ price: smcByTf.D.swingHigh, type: 'PREVIOUS_HIGH', strength: 'STRONG', description: `Previous day high at ${formatNum(smcByTf.D.swingHigh)}`, confluence: 1 })
  levels.push({ price: smcByTf.D.swingLow, type: 'PREVIOUS_LOW', strength: 'STRONG', description: `Previous day low at ${formatNum(smcByTf.D.swingLow)}`, confluence: 1 })

  // Compute confluence: count levels within tolerance of each other
  for (const level of levels) {
    level.confluence = levels.filter(l => Math.abs(l.price - level.price) <= tolerance).length
  }

  return levels.sort((a, b) => b.confluence - a.confluence || b.price - a.price)
}

function buildBreakerBlocks(smc: SMCAnalysis, timeframe: Timeframe): BreakerBlock[] {
  // Breaker = former OB that failed and flipped
  const breakers: BreakerBlock[] = []
  for (const ob of smc.orderBlocks.filter(o => o.mitigated && o.mitigationPct > 80)) {
    breakers.push({
      high: ob.high,
      low: ob.low,
      type: ob.type === 'BULLISH' ? 'BEARISH' : 'BULLISH', // flipped
      timeframe,
      description: `${ob.type === 'BULLISH' ? 'Bearish' : 'Bullish'} breaker block at ${formatNum(ob.low)}-${formatNum(ob.high)}`,
    })
  }
  return breakers
}

function buildMitigationBlocks(smc: SMCAnalysis, timeframe: Timeframe): MitigationBlock[] {
  // Mitigation blocks = partially mitigated OBs
  const blocks: MitigationBlock[] = []
  for (const ob of smc.orderBlocks.filter(o => o.mitigated && o.mitigationPct < 80)) {
    blocks.push({
      high: ob.high,
      low: ob.low,
      type: ob.type,
      timeframe,
      description: `${ob.type} mitigation block at ${formatNum(ob.low)}-${formatNum(ob.high)} (${ob.mitigationPct.toFixed(0)}% mitigated)`,
    })
  }
  return blocks
}

export function runPhase1_HTFContext(
  candlesByTf: Record<Timeframe, Candle[]>,
  smcByTf: Record<Timeframe, SMCAnalysis>,
  fib: FibonacciFramework,
  currentPrice: number,
): HTFContext {
  const monthly = buildTimeframeBias(candlesByTf.M, 'M')
  const weekly = buildTimeframeBias(candlesByTf.W, 'W')
  const daily = buildTimeframeBias(candlesByTf.D, 'D')
  const h4 = buildTimeframeBias(candlesByTf['4H'], '4H')
  const h1 = buildTimeframeBias(candlesByTf['1H'], '1H')

  // Primary trend: weighted by higher timeframes
  const weights = { monthly: 4, weekly: 3, daily: 2.5, h4: 2, h1: 1.5 }
  let bullScore = 0, bearScore = 0
  if (monthly.bias === 'BULLISH') bullScore += weights.monthly
  else if (monthly.bias === 'BEARISH') bearScore += weights.monthly
  if (weekly.bias === 'BULLISH') bullScore += weights.weekly
  else if (weekly.bias === 'BEARISH') bearScore += weights.weekly
  if (daily.bias === 'BULLISH') bullScore += weights.daily
  else if (daily.bias === 'BEARISH') bearScore += weights.daily

  let primaryTrend: TrendDirection = 'NEUTRAL'
  let institutionalBias: HTFContext['institutionalBias'] = 'NEUTRAL'
  if (bullScore > bearScore + 2) { primaryTrend = 'BULLISH'; institutionalBias = 'BULLISH' }
  else if (bearScore > bullScore + 2) { primaryTrend = 'BEARISH'; institutionalBias = 'BEARISH' }

  // Premium/discount from daily
  let premiumDiscount: HTFContext['premiumDiscount'] = 'EQUILIBRIUM'
  if (currentPrice > daily.swingHigh - (daily.swingHigh - daily.swingLow) * 0.3) premiumDiscount = 'PREMIUM'
  else if (currentPrice < daily.swingLow + (daily.swingHigh - daily.swingLow) * 0.3) premiumDiscount = 'DISCOUNT'

  // Liquidity pools from daily + 4H
  const liquidityPools = [
    ...buildLiquidityPools(smcByTf.D, 'D'),
    ...buildLiquidityPools(smcByTf['4H'], '4H'),
  ]

  // Protected highs/lows: swing points not yet swept
  const protectedHighs = smcByTf.D.liquidity.filter(l => l.type === 'BUY_SIDE' && !l.swept).map(l => l.price)
  const protectedLows = smcByTf.D.liquidity.filter(l => l.type === 'SELL_SIDE' && !l.swept).map(l => l.price)

  // Key levels
  const keyLevels = buildKeyLevels(smcByTf, fib, currentPrice)

  // Institutional OBs from daily + 4H
  const allFVGs: FVGZone[] = [
    ...smcByTf.D.fvgs.map(f => ({ ...f, timeframe: 'D' as Timeframe })),
    ...smcByTf['4H'].fvgs.map(f => ({ ...f, timeframe: '4H' as Timeframe })),
  ]
  const institutionalOrderBlocks: InstitutionalOB[] = [
    ...smcByTf.D.orderBlocks.map(ob => rankOrderBlock(ob, candlesByTf.D, fib.oteZone, allFVGs)),
    ...smcByTf['4H'].orderBlocks.map(ob => rankOrderBlock(ob, candlesByTf['4H'], fib.oteZone, allFVGs)),
  ].sort((a, b) => b.score - a.score)

  const fairValueGaps = allFVGs
  const breakerBlocks = [
    ...buildBreakerBlocks(smcByTf.D, 'D'),
    ...buildBreakerBlocks(smcByTf['4H'], '4H'),
  ]
  const mitigationBlocks = [
    ...buildMitigationBlocks(smcByTf.D, 'D'),
    ...buildMitigationBlocks(smcByTf['4H'], '4H'),
  ]

  // Aligned: at least 3 of 5 timeframes agree
  const biases = [monthly.bias, weekly.bias, daily.bias, h4.bias, h1.bias]
  const bullCount = biases.filter(b => b === 'BULLISH').length
  const bearCount = biases.filter(b => b === 'BEARISH').length
  const aligned = bullCount >= 3 || bearCount >= 3

  return {
    monthly, weekly, daily, h4, h1,
    primaryTrend,
    institutionalBias,
    premiumDiscount,
    majorSwingHigh: daily.swingHigh,
    majorSwingLow: daily.swingLow,
    liquidityPools,
    protectedHighs,
    protectedLows,
    keyLevels,
    institutionalOrderBlocks,
    fairValueGaps,
    breakerBlocks,
    mitigationBlocks,
    aligned,
  }
}

// ============================================================
// PHASE 3 — FIBONACCI FRAMEWORK
// ============================================================

export function runPhase3_Fibonacci(swingHigh: number, swingLow: number, currentPrice: number): FibonacciFramework {
  const direction: 'UP' | 'DOWN' = swingHigh > swingLow ? 'UP' : 'DOWN'
  const range = Math.abs(swingHigh - swingLow)

  // For a down-swing (swingHigh is start, swingLow is end), fib levels from low to high
  // For an up-swing (swingLow is start, swingHigh is end), fib levels from low to high
  // Standard: 0 at swingLow, 1.0 at swingHigh (for bearish swing being retraced upward)
  const fibLevels = [
    { level: 0, label: '0.0' },
    { level: 0.5, label: '0.5' },
    { level: 0.618, label: '0.618' },
    { level: 0.705, label: '0.705' },
    { level: 0.79, label: '0.79' },
    { level: 1.0, label: '1.0' },
  ]

  const levels = fibLevels.map(fl => {
    const price = swingLow + range * fl.level
    let zone: FibonacciFramework['levels'][0]['zone'] = 'EQUILIBRIUM'
    if (fl.level >= 0.618 && fl.level <= 0.79) zone = 'OTE'
    else if (fl.level > 0.5) zone = 'PREMIUM'
    else if (fl.level < 0.5) zone = 'DISCOUNT'
    return { ...fl, price, zone }
  })

  const equilibrium = swingLow + range * 0.5
  const oteZone = {
    high: swingLow + range * 0.79,
    low: swingLow + range * 0.618,
  }
  const premiumZone = { high: swingHigh, low: equilibrium }
  const discountZone = { high: equilibrium, low: swingLow }

  const inOTE = currentPrice >= oteZone.low && currentPrice <= oteZone.high
  const inPremium = currentPrice > equilibrium
  const inDiscount = currentPrice < equilibrium

  // Current level: which fib level is closest
  const currentLevel = currentPrice

  return {
    swingHigh,
    swingLow,
    direction,
    levels,
    premiumZone,
    discountZone,
    oteZone,
    equilibrium,
    currentLevel,
    inOTE,
    inPremium,
    inDiscount,
  }
}

// ============================================================
// PHASE 4 — LIQUIDITY CONFIRMATION
// ============================================================

export function runPhase4_Liquidity(
  smc15M: SMCAnalysis,
  smc1H: SMCAnalysis,
  smc4H: SMCAnalysis,
  candles15M: Candle[],
): LiquidityConfirmation {
  const allLiquidity = [
    ...smc15M.liquidity,
    ...smc1H.liquidity,
    ...smc4H.liquidity,
  ]

  const buySideLiquidity = allLiquidity.filter(l => l.type === 'BUY_SIDE')
  const sellSideLiquidity = allLiquidity.filter(l => l.type === 'SELL_SIDE')

  const liquiditySweeps = allLiquidity.filter(l => l.swept)
  const stopHunts = liquiditySweeps.filter(l => l.strength === 'STRONG')

  const internalLiquidity = allLiquidity.filter(l => l.strength === 'WEAK' || l.strength === 'MEDIUM')
  const externalLiquidity = allLiquidity.filter(l => l.strength === 'STRONG')

  const inducement = [
    ...detectInducement(candles15M, smc15M.orderBlocks),
    ...smc15M.inducement,
  ]

  // LiquidityEngineered: at least one strong sweep in the last few candles
  const liquidityEngineered = liquiditySweeps.length > 0
  const sweepDirection: LiquidityConfirmation['sweepDirection'] = liquiditySweeps.some(l => l.type === 'BUY_SIDE')
    ? 'BEARISH' // buy-side swept → bearish reversal expected
    : liquiditySweeps.some(l => l.type === 'SELL_SIDE')
    ? 'BULLISH'
    : 'NONE'

  let description = ''
  if (liquidityEngineered) {
    description = `Liquidity engineered: ${liquiditySweeps.length} sweep(s) detected. ${sweepDirection === 'BULLISH' ? 'Sell-side' : 'Buy-side'} liquidity taken — smart money accumulating ${sweepDirection === 'BULLISH' ? 'longs' : 'shorts'}.`
  } else {
    description = 'No liquidity sweep yet. WAIT for liquidity to be engineered before considering entry.'
  }

  return {
    buySideLiquidity,
    sellSideLiquidity,
    equalHighs: smc15M.equalHighs,
    equalLows: smc15M.equalLows,
    stopHunts,
    liquiditySweeps,
    inducement,
    internalLiquidity,
    externalLiquidity,
    liquidityEngineered,
    sweepDirection,
    description,
  }
}

// ============================================================
// PHASE 5 — STRUCTURE CONFIRMATION
// ============================================================

export function runPhase5_Structure(smc15M: SMCAnalysis, smc1H: SMCAnalysis): StructureConfirmation {
  // Look at most recent structure event across 15M and 1H
  const allEvents = [
    ...smc15M.structure.bosEvents,
    ...smc15M.structure.chochEvents,
    ...smc1H.structure.bosEvents,
    ...smc1H.structure.chochEvents,
  ].sort((a, b) => b.timestamp - a.timestamp)

  const lastEvent = allEvents[0]

  if (!lastEvent) {
    return {
      eventType: 'NONE',
      direction: 'NONE',
      price: 0,
      strong: false,
      candleClose: false,
      description: 'No BOS or CHoCH detected. WAIT for structure confirmation after liquidity sweep.',
      confirmed: false,
    }
  }

  // Strong: event was recent (within 5 candles worth of time)
  const now = Date.now()
  const strong = now - lastEvent.timestamp < 60 * 60 * 1000 // within 1 hour
  const candleClose = true // our synthetic detection always uses closes

  let description = ''
  if (lastEvent.type === 'CHoCH') {
    description = `${lastEvent.direction} Change of Character at ${formatNum(lastEvent.price)} — first sign of reversal. ${strong ? 'Strong recent event.' : 'Older event — may be stale.'}`
  } else {
    description = `${lastEvent.direction} Break of Structure at ${formatNum(lastEvent.price)} — trend continuation confirmed. ${strong ? 'Strong recent event.' : 'Older event — may be stale.'}`
  }

  return {
    eventType: lastEvent.type,
    direction: lastEvent.direction,
    price: lastEvent.price,
    strong,
    candleClose,
    description,
    confirmed: strong && candleClose,
  }
}

// ============================================================
// PHASE 6 — ORDER BLOCK DETECTION
// ============================================================

export function runPhase6_OBDetection(
  smcByTf: Record<Timeframe, SMCAnalysis>,
  candlesByTf: Record<Timeframe, Candle[]>,
  fib: FibonacciFramework,
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL',
): OBDetection {
  const allFVGs: FVGZone[] = [
    ...smcByTf['15M'].fvgs.map(f => ({ ...f, timeframe: '15M' as Timeframe })),
    ...smcByTf['1H'].fvgs.map(f => ({ ...f, timeframe: '1H' as Timeframe })),
    ...smcByTf['4H'].fvgs.map(f => ({ ...f, timeframe: '4H' as Timeframe })),
  ]

  const orderBlocks: InstitutionalOB[] = []
  for (const tf of ['15M', '1H', '4H'] as Timeframe[]) {
    for (const ob of smcByTf[tf].orderBlocks) {
      const ranked = rankOrderBlock(ob, candlesByTf[tf], fib.oteZone, allFVGs)
      // Only keep OBs aligned with bias
      if (bias === 'BULLISH' && ob.type === 'BULLISH') orderBlocks.push(ranked)
      else if (bias === 'BEARISH' && ob.type === 'BEARISH') orderBlocks.push(ranked)
      else if (bias === 'NEUTRAL') orderBlocks.push(ranked)
    }
  }

  // Best OB: highest score, must be A+ or A
  const qualifying = orderBlocks.filter(ob => ob.rank === 'A_PLUS' || ob.rank === 'A')
  const bestOB = qualifying.sort((a, b) => b.score - a.score)[0] ?? null

  const description = bestOB
    ? `Best order block: ${bestOB.description}`
    : qualifying.length > 0
    ? `${qualifying.length} qualifying OBs found but none ranked A+ or A. Reject poor quality order blocks.`
    : 'No qualifying institutional order blocks detected. WAIT.'

  return { orderBlocks, bestOB, description }
}

// ============================================================
// PHASE 7 — ENTRY CONDITIONS
// ============================================================

export function runPhase7_EntryConditions(
  phase1: HTFContext,
  phase2: { atKeyLevel: boolean; level: KeyLevel | null },
  phase4: LiquidityConfirmation,
  phase5: StructureConfirmation,
  phase6: OBDetection,
  phase3: FibonacciFramework,
  rr: number | null,
): EntryConditions {
  const htfBias = phase1.institutionalBias !== 'NEUTRAL' && phase1.aligned
  const keyLevel = phase2.atKeyLevel
  const liquiditySweep = phase4.liquidityEngineered
  const bosOrChoch = phase5.confirmed
  const institutionalOB = phase6.bestOB !== null && (phase6.bestOB.rank === 'A_PLUS' || phase6.bestOB.rank === 'A')
  const fibConfluence = phase3.inOTE || (phase6.bestOB?.fibConfluence ?? false)

  // Premium/discount alignment: for BUY, want discount; for SELL, want premium
  const bias = phase1.institutionalBias
  const premiumDiscountAlignment = bias === 'BULLISH'
    ? phase1.premiumDiscount === 'DISCOUNT'
    : bias === 'BEARISH'
    ? phase1.premiumDiscount === 'PREMIUM'
    : false

  const cleanRR = rr !== null && rr >= 2

  const missing: string[] = []
  if (!htfBias) missing.push('HTF bias alignment')
  if (!keyLevel) missing.push('Key level confluence')
  if (!liquiditySweep) missing.push('Liquidity sweep')
  if (!bosOrChoch) missing.push('BOS/CHoCH confirmation')
  if (!institutionalOB) missing.push('Institutional Order Block (A+ or A)')
  if (!fibConfluence) missing.push('Fibonacci confluence (OTE 0.618-0.79)')
  if (!premiumDiscountAlignment) missing.push('Premium/Discount alignment')
  if (!cleanRR) missing.push('Clean Risk-to-Reward (≥ 1:2)')

  const allMet = missing.length === 0

  const description = allMet
    ? 'ALL 8 entry conditions met. High-probability institutional setup confirmed.'
    : `${8 - missing.length}/8 conditions met. Missing: ${missing.join(', ')}. OUTPUT: WAIT.`

  return {
    htfBias, keyLevel, liquiditySweep, bosOrChoch,
    institutionalOB, fibConfluence, premiumDiscountAlignment, cleanRR,
    allMet, missing, description,
  }
}

// ============================================================
// PHASE 8 & 9 — STOP LOSS & TAKE PROFITS
// ============================================================

export function runPhase8to9_RiskManagement(
  bias: 'BULLISH' | 'BEARISH',
  bestOB: InstitutionalOB | null,
  liquiditySweeps: LiquidityPool[],
  opposingLiquidity: LiquidityPool[],
  htfTarget: number,
  currentPrice: number,
  atrValue: number,
): RiskManagement | null {
  if (!bestOB) return null

  const entry = (bestOB.low + bestOB.high) / 2
  let stopLoss: number
  let tp1: number
  let tp2: number
  let tp3: number

  if (bias === 'BULLISH') {
    // SL below the liquidity sweep (below OB low)
    const sweepLow = liquiditySweeps.filter(l => l.type === 'SELL_SIDE').reduce((min, l) => Math.min(min, l.price), entry)
    stopLoss = Math.min(bestOB.low, sweepLow) - atrValue * 0.5
    // TP1: nearest internal liquidity above (buy-side internal)
    tp1 = opposingLiquidity
      .filter(l => l.type === 'BUY_SIDE' && l.price > entry)
      .sort((a, b) => a.price - b.price)[0]?.price ?? entry + (entry - stopLoss) * 1
    // TP2: opposing external liquidity pool
    tp2 = opposingLiquidity
      .filter(l => l.type === 'BUY_SIDE' && l.price > tp1)
      .sort((a, b) => a.price - b.price)[0]?.price ?? entry + (entry - stopLoss) * 2
    // TP3: HTF target (swing high)
    tp3 = Math.max(htfTarget, entry + (entry - stopLoss) * 3)
  } else {
    // SELL
    const sweepHigh = liquiditySweeps.filter(l => l.type === 'BUY_SIDE').reduce((max, l) => Math.max(max, l.price), entry)
    stopLoss = Math.max(bestOB.high, sweepHigh) + atrValue * 0.5
    tp1 = opposingLiquidity
      .filter(l => l.type === 'SELL_SIDE' && l.price < entry)
      .sort((a, b) => b.price - a.price)[0]?.price ?? entry - (stopLoss - entry) * 1
    tp2 = opposingLiquidity
      .filter(l => l.type === 'SELL_SIDE' && l.price < tp1)
      .sort((a, b) => b.price - a.price)[0]?.price ?? entry - (stopLoss - entry) * 2
    tp3 = Math.min(htfTarget, entry - (stopLoss - entry) * 3)
  }

  const riskDistance = Math.abs(entry - stopLoss)
  const reward1 = Math.abs(tp1 - entry)
  const reward2 = Math.abs(tp2 - entry)
  const reward3 = Math.abs(tp3 - entry)
  const rr1 = riskDistance > 0 ? reward1 / riskDistance : 0
  const rr2 = riskDistance > 0 ? reward2 / riskDistance : 0
  const rr3 = riskDistance > 0 ? reward3 / riskDistance : 0

  const invalidation = `Trade invalid if price closes ${bias === 'BULLISH' ? 'below' : 'above'} ${formatNum(stopLoss)}. This invalidates the ${bias === 'BULLISH' ? 'bullish' : 'bearish'} structure and the order block is violated.`

  return {
    entry, stopLoss, tp1, tp2, tp3,
    riskDistance, reward1, reward2, reward3,
    rr1, rr2, rr3, invalidation,
  }
}

// ============================================================
// PHASE 10 — TRADE MANAGEMENT
// ============================================================

export function runPhase10_TradeManagement(bias: 'BULLISH' | 'BEARISH', rm: RiskManagement | null): TradeManagement {
  if (!rm) {
    return {
      afterTP1: 'N/A — no active setup',
      afterTP2: 'N/A — no active setup',
      afterTP3: 'N/A — no active setup',
      trailingPlan: 'N/A — no active setup',
      breakEvenTrigger: 'N/A — no active setup',
      description: 'No trade management plan — WAIT state active.',
    }
  }

  return {
    afterTP1: `When price reaches TP1 at ${formatNum(rm.tp1)}, move stop loss to break even (${formatNum(rm.entry)}). Protect capital. Secure the trade — no risk remaining.`,
    afterTP2: `When price reaches TP2 at ${formatNum(rm.tp2)}, partial close 50% of remaining position. Trail stop behind most recent ${bias === 'BULLISH' ? 'higher low' : 'lower high'}.`,
    afterTP3: `When price reaches TP3 at ${formatNum(rm.tp3)}, close remaining runner or trail with HTF structure as guide. This is the higher timeframe target.`,
    trailingPlan: `Trail only after new structure forms in trade direction. For ${bias}, trail behind each new ${bias === 'BULLISH' ? 'higher low' : 'lower high'} on 15M timeframe. Do not trail prematurely.`,
    breakEvenTrigger: `Move stop to break even after TP1 (${formatNum(rm.tp1)}) is hit. Never give back risk capital on a winning trade.`,
    description: `Complete trade management plan for ${bias} setup. Risk-off after TP1, partial at TP2, runner to TP3.`,
  }
}

// ============================================================
// PHASE 11 — CONFIDENCE SCORE
// ============================================================

export function runPhase11_Confidence(
  phase1: HTFContext,
  phase4: LiquidityConfirmation,
  phase6: OBDetection,
  phase3: FibonacciFramework,
  phase7: EntryConditions,
  rr: number | null,
  smc15M: SMCAnalysis,
): ConfidenceScore {
  // HTF alignment: 0-15
  const tfBiases = [phase1.monthly.bias, phase1.weekly.bias, phase1.daily.bias, phase1.h4.bias, phase1.h1.bias]
  const bullCount = tfBiases.filter(b => b === 'BULLISH').length
  const bearCount = tfBiases.filter(b => b === 'BEARISH').length
  const maxAlign = Math.max(bullCount, bearCount)
  const htfAlignment = Math.round((maxAlign / 5) * 15)

  // Liquidity: 0-15
  const liquidity = Math.min(15, phase4.liquiditySweeps.length * 5 + (phase4.sweepDirection !== 'NONE' ? 5 : 0))

  // OB quality: 0-15
  const obQuality = phase6.bestOB
    ? phase6.bestOB.rank === 'A_PLUS' ? 15
    : phase6.bestOB.rank === 'A' ? 12
    : phase6.bestOB.rank === 'B' ? 8
    : 4
    : 0

  // FVG: 0-10
  const unfilledFVGs = phase1.fairValueGaps.filter(f => !f.filled).length
  const fvg = Math.min(10, unfilledFVGs * 3)

  // Session: 0-10
  const session = getCurrentSession()
  const sessionScore = session.isKillZone ? 10 : session.isActive ? 7 : 3

  // News: 0-10
  const newsEvents = getUpcomingNews()
  const newsWarn = shouldWarnForNews(newsEvents)
  const news = newsWarn.shouldWarn ? 2 : 8

  // Risk reward: 0-10
  const riskReward = rr !== null ? Math.min(10, rr * 3) : 0

  // Trend strength: 0-10
  const trendStrength = Math.min(10, (smc15M.trendStrength / 10))

  // Momentum: 0-5 (RSI direction)
  const momentum = 5 // neutral baseline

  // Market structure: 0-10
  const lastEvent = smc15M.structure.lastEvent
  const marketStructure = lastEvent
    ? lastEvent.type === 'CHoCH' ? 8 : lastEvent.type === 'BOS' ? 7 : 4
    : 3

  const total = htfAlignment + liquidity + obQuality + fvg + sessionScore + news + riskReward + trendStrength + momentum + marketStructure

  let label: ConfidenceScore['label'] = 'WAIT'
  if (!phase7.allMet) label = 'WAIT'
  else if (total >= 80) label = 'A_PLUS'
  else if (total >= 65) label = 'A'
  else if (total >= 50) label = 'B'
  else if (total >= 35) label = 'C'

  const description = `Confidence ${total}/100 (${label}). HTF: ${htfAlignment}/15, Liq: ${liquidity}/15, OB: ${obQuality}/15, FVG: ${fvg}/10, Session: ${sessionScore}/10, News: ${news}/10, RR: ${riskReward}/10, Trend: ${trendStrength.toFixed(1)}/10, Momentum: ${momentum}/5, Structure: ${marketStructure}/10.${phase7.allMet ? '' : ' WAIT — conditions not fully met.'}`

  return {
    htfAlignment, liquidity, obQuality, fvg, session: sessionScore, news,
    riskReward, trendStrength, momentum, marketStructure,
    total, label, description,
  }
}

// ============================================================
// PHASE 12 — OUTPUT
// ============================================================

export function runPhase12_Output(
  phase1: HTFContext,
  phase2: { atKeyLevel: boolean; level: KeyLevel | null },
  phase4: LiquidityConfirmation,
  phase5: StructureConfirmation,
  phase6: OBDetection,
  phase7: EntryConditions,
  phase8to9: RiskManagement | null,
  phase10: TradeManagement,
  phase11: ConfidenceScore,
  phase3: FibonacciFramework,
): AILEOutput {
  const marketBias: AILEOutput['marketBias'] = phase7.allMet
    ? (phase1.institutionalBias === 'BULLISH' ? 'BUY' : phase1.institutionalBias === 'BEARISH' ? 'SELL' : 'WAIT')
    : 'WAIT'

  const narrative = phase7.allMet
    ? `Institutional ${phase1.institutionalBias === 'BULLISH' ? 'bullish' : 'bearish'} setup confirmed. Higher timeframes aligned (${phase1.monthly.bias}/${phase1.weekly.bias}/${phase1.daily.bias}). Price reached key level: ${phase2.level?.description ?? 'confluence zone'}. Liquidity engineered via ${phase4.sweepDirection === 'BULLISH' ? 'sell-side' : 'buy-side'} sweep. Structure confirmed with ${phase5.eventType} at ${formatNum(phase5.price)}. Entry into ${phase6.bestOB?.type === 'BULLISH' ? 'bullish' : 'bearish'} order block (${phase6.bestOB?.rank}) with Fibonacci OTE confluence. All 8 conditions met. This is a high-probability institutional setup — execute with discipline.`
    : `WAIT. ${phase7.description} The institutional engine requires ALL 8 conditions: HTF bias, key level, liquidity sweep, BOS/CHoCH, institutional OB, Fibonacci confluence, premium/discount alignment, and clean R:R. Currently ${8 - phase7.missing.length}/8 met. Patience is edge — do not force trades. Wait for the market to engineer liquidity, confirm structure, and present an A+ order block in the OTE zone.`

  const educationalNote = 'Educational analysis only — probability-based, not financial advice. The AILE engine identifies institutional setups but never guarantees profits. Always confirm with your own research, use proper risk management, and never risk more than you can afford to lose.'

  const fibZone = phase3.inOTE
    ? `OTE Zone (0.618-0.79): ${formatNum(phase3.oteZone.low)} - ${formatNum(phase3.oteZone.high)}`
    : phase3.inPremium
    ? `Premium Zone (above 0.5 equilibrium at ${formatNum(phase3.equilibrium)})`
    : `Discount Zone (below 0.5 equilibrium at ${formatNum(phase3.equilibrium)})`

  const liquidityType = phase4.liquidityEngineered
    ? `${phase4.sweepDirection === 'BULLISH' ? 'Sell-side' : 'Buy-side'} liquidity sweep (${phase4.liquiditySweeps.length} level(s))`
    : 'No liquidity sweep — waiting'

  const structure = phase5.confirmed
    ? `${phase5.eventType} ${phase5.direction} at ${formatNum(phase5.price)}`
    : 'No confirmed structure event'

  const expectedSession: TradingSession = phase4.sweepDirection === 'BULLISH' ? 'LONDON' : 'NEW_YORK'

  return {
    marketBias,
    confidence: phase11.total,
    confidenceLabel: phase11.label,
    trend: phase1.primaryTrend,
    keyLevel: phase2.level,
    liquidityType,
    structure,
    orderBlock: phase6.bestOB,
    fibonacciZone: fibZone,
    entry: phase8to9?.entry ?? null,
    stopLoss: phase8to9?.stopLoss ?? null,
    tp1: phase8to9?.tp1 ?? null,
    tp2: phase8to9?.tp2 ?? null,
    tp3: phase8to9?.tp3 ?? null,
    riskReward: phase8to9 ? phase8to9.rr1 : null,
    invalidation: phase8to9?.invalidation ?? 'No active setup — WAIT state',
    tradeManagementPlan: phase10,
    expectedSession,
    narrative,
    educationalNote,
  }
}

// ============================================================
// PHASE 2 — KEY LEVEL VALIDATION
// ============================================================

export function runPhase2_KeyLevel(phase1: HTFContext, currentPrice: number): {
  atKeyLevel: boolean
  level: KeyLevel | null
  confluence: number
  description: string
} {
  const tolerance = currentPrice * 0.005 // 0.5%
  // Find the closest key level with highest confluence
  const sorted = [...phase1.keyLevels].sort((a, b) => {
    const distA = Math.abs(a.price - currentPrice)
    const distB = Math.abs(b.price - currentPrice)
    // Prioritize being at the level (within tolerance), then confluence
    const aAt = distA <= tolerance ? 0 : 1
    const bAt = distB <= tolerance ? 0 : 1
    if (aAt !== bAt) return aAt - bAt
    return b.confluence - a.confluence
  })

  const closest = sorted[0]
  const atKeyLevel = closest ? Math.abs(closest.price - currentPrice) <= tolerance : false

  const description = atKeyLevel
    ? `Price is at key level: ${closest!.description} (confluence: ${closest!.confluence}). Institutional confluence exists — proceed to next phase.`
    : closest
    ? `Nearest key level is ${closest.description} at ${formatNum(closest.price)} (current: ${formatNum(currentPrice)}). Price NOT at key level — WAIT for price to reach institutional confluence.`
    : 'No key levels identified.'

  return {
    atKeyLevel,
    level: closest,
    confluence: closest?.confluence ?? 0,
    description,
  }
}

// ============================================================
// MASTER AILE ANALYSIS — Run all 12 phases
// ============================================================

export function runAILEAnalysis(
  candlesByTf?: Record<Timeframe, Candle[]>,
  currentPrice?: number,
): AILEAnalysis {
  // Generate or use provided candles for all timeframes
  const tfs: Timeframe[] = ['1M', '5M', '15M', '1H', '4H', 'D', 'W', 'M']
  const candles: Record<Timeframe, Candle[]> = {} as Record<Timeframe, Candle[]>
  for (const tf of tfs) {
    candles[tf] = candlesByTf?.[tf] ?? generateCandles(tf, 200)
  }

  const price = currentPrice ?? candles['1M'].at(-1)!.close

  // Run SMC analysis on all timeframes
  const smcByTf: Record<Timeframe, SMCAnalysis> = {} as Record<Timeframe, SMCAnalysis>
  for (const tf of tfs) {
    smcByTf[tf] = analyzeSMC(candles[tf], tf)
  }

  // Phase 3: Fibonacci (from daily swing)
  const fib = runPhase3_Fibonacci(smcByTf.D.swingHigh, smcByTf.D.swingLow, price)

  // Phase 1: HTF Context
  const phase1 = runPhase1_HTFContext(candles, smcByTf, fib, price)

  // Phase 2: Key Level Validation
  const phase2 = runPhase2_KeyLevel(phase1, price)

  // Phase 4: Liquidity Confirmation
  const phase4 = runPhase4_Liquidity(smcByTf['15M'], smcByTf['1H'], smcByTf['4H'], candles['15M'])

  // Phase 5: Structure Confirmation
  const phase5 = runPhase5_Structure(smcByTf['15M'], smcByTf['1H'])

  // Phase 6: OB Detection
  const phase6 = runPhase6_OBDetection(smcByTf, candles, fib, phase1.institutionalBias)

  // Pre-compute RR for phase 7
  const atrValue = atr(candles['15M'])
  const opposingLiquidity = phase1.liquidityPools
  const htfTarget = phase1.institutionalBias === 'BULLISH' ? phase1.majorSwingHigh : phase1.majorSwingLow
  const tempRM = runPhase8to9_RiskManagement(
    phase1.institutionalBias === 'NEUTRAL' ? 'BULLISH' : phase1.institutionalBias,
    phase6.bestOB,
    phase4.liquiditySweeps,
    opposingLiquidity,
    htfTarget,
    price,
    atrValue,
  )
  const rr = tempRM?.rr1 ?? null

  // Phase 7: Entry Conditions
  const phase7 = runPhase7_EntryConditions(phase1, phase2, phase4, phase5, phase6, fib, rr)

  // Phase 8 & 9: Risk Management (only if conditions met)
  const phase8to9 = phase7.allMet
    ? runPhase8to9_RiskManagement(
        phase1.institutionalBias === 'NEUTRAL' ? 'BULLISH' : phase1.institutionalBias,
        phase6.bestOB,
        phase4.liquiditySweeps,
        opposingLiquidity,
        htfTarget,
        price,
        atrValue,
      )
    : null

  // Phase 10: Trade Management
  const phase10 = runPhase10_TradeManagement(
    phase1.institutionalBias === 'NEUTRAL' ? 'BULLISH' : phase1.institutionalBias,
    phase8to9,
  )

  // Phase 11: Confidence Score
  const phase11 = runPhase11_Confidence(phase1, phase4, phase6, fib, phase7, rr, smcByTf['15M'])

  // Phase 12: Output
  const phase12 = runPhase12_Output(phase1, phase2, phase4, phase5, phase6, phase7, phase8to9, phase10, phase11, fib)

  return {
    phase1, phase2, phase3: fib, phase4, phase5, phase6, phase7, phase8to9, phase10, phase11, phase12,
    timestamp: Date.now(),
    symbol: 'XAUUSD',
    currentPrice: price,
  }
}
