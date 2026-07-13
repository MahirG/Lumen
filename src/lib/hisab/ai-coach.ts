/**
 * Hisab Gold AI — AI Coach
 *
 * Generates professional mentor-style explanations of every trade setup,
 * explaining the SMC/ICT logic step-by-step.
 * Educational only — not financial advice.
 */

import type { SMCAnalysis, TradeSetup, MTFAnalysis, MarketBias } from '@/lib/types/hisab'

export function generateCoachExplanation(
  smc: SMCAnalysis,
  setup: TradeSetup,
  mtf: MTFAnalysis,
): string {
  const parts: string[] = []
  const bias = setup.bias
  const biasLabel = bias === 'BUY' ? 'bullish' : bias === 'SELL' ? 'bearish' : 'neutral'

  // 1. Higher timeframe context
  const higherTFs = [mtf.monthly, mtf.weekly, mtf.daily]
  const alignedHigher = higherTFs.filter(t => t.bias === bias).length
  if (alignedHigher >= 2) {
    parts.push(`On the higher timeframes (Monthly, Weekly, Daily), ${alignedHigher} out of 3 timeframes align ${biasLabel}, giving us a clear directional bias with ${mtf.alignment}% overall alignment. We want to trade with this institutional flow, not against it.`)
  } else {
    parts.push(`The higher timeframes are mixed right now, with ${mtf.alignment}% alignment. This means we need to be more selective with entries and reduce position sizing accordingly.`)
  }

  // 2. Liquidity sweep narrative
  const sweptLevels = smc.liquidity.filter(l => l.swept)
  if (sweptLevels.length > 0) {
    const buySide = sweptLevels.find(l => l.type === 'BUY_SIDE')
    const sellSide = sweptLevels.find(l => l.type === 'SELL_SIDE')
    if (buySide && bias === 'SELL') {
      parts.push(`Price swept buy-side liquidity resting above ${buySide.price.toFixed(2)} — this is smart money taking out stop losses from early longs. Once that liquidity is taken, institutions can distribute their longs into the breakout and reverse the market downward.`)
    } else if (sellSide && bias === 'BUY') {
      parts.push(`Price swept sell-side liquidity resting below ${sellSide.price.toFixed(2)} — smart money accumulated longs at the expense of late shorts. The sweep and reversal is a classic sign of institutional accumulation.`)
    } else {
      parts.push(`A liquidity sweep was detected at ${sweptLevels[0].price.toFixed(2)}, which signals potential smart money positioning. We need to see how price reacts at this level before committing.`)
    }
  }

  // 3. CHoCH / BOS narrative
  const lastChoch = smc.structure.chochEvents.at(-1)
  const lastBos = smc.structure.bosEvents.at(-1)
  if (lastChoch) {
    parts.push(`A ${lastChoch.direction.toLowerCase()} Change of Character (CHoCH) printed at ${lastChoch.price.toFixed(2)} — this is the first sign that the prior trend is exhausted and smart money is shifting positions. The CHoCH is our early signal to start looking for entries in the new direction.`)
  }
  if (lastBos) {
    parts.push(`The Break of Structure (BOS) at ${lastBos.price.toFixed(2)} confirms ${lastBos.direction.toLowerCase()} continuation. The market is making higher highs (or lower lows) — institutional order flow is aligned with our bias.`)
  }

  // 4. Order block entry
  const relevantOBs = smc.orderBlocks.filter(o => !o.mitigated)
  if (bias === 'BUY') {
    const ob = relevantOBs.find(o => o.type === 'BULLISH')
    if (ob) {
      parts.push(`The retracement into the bullish order block at ${ob.low.toFixed(2)}-${ob.high.toFixed(2)} offers a higher-probability long setup. This is the last down candle before the strong impulsive move up — institutions placed large buy orders here and price often returns to mitigate this zone before continuing.`)
    }
  } else if (bias === 'SELL') {
    const ob = relevantOBs.find(o => o.type === 'BEARISH')
    if (ob) {
      parts.push(`The retracement into the bearish order block at ${ob.low.toFixed(2)}-${ob.high.toFixed(2)} offers a higher-probability short setup. This is the last up candle before the strong impulsive move down — institutions placed large sell orders here and price often returns to mitigate this zone before continuing.`)
    }
  }

  // 5. FVG / imbalance
  const unfilledFVGs = smc.fvgs.filter(f => !f.filled)
  if (unfilledFVGs.length > 0) {
    const fvg = unfilledFVGs.at(-1)!
    parts.push(`There's an unfilled ${fvg.type.toLowerCase()} Fair Value Gap at ${fvg.low.toFixed(2)}-${fvg.high.toFixed(2)} — markets tend to revisit imbalances to fill them before trending. This gives us an additional confluence zone for entry.`)
  }

  // 6. Premium/Discount
  const lastPrice = setup.entryZone.optimal
  if (lastPrice < smc.equilibrium && bias === 'BUY') {
    parts.push(`Price is in the discount zone (below the 50% equilibrium at ${smc.equilibrium.toFixed(2)}), which gives us a premium entry for longs. We're buying below fair value — exactly where smart money accumulates.`)
  } else if (lastPrice > smc.equilibrium && bias === 'SELL') {
    parts.push(`Price is in the premium zone (above the 50% equilibrium at ${smc.equilibrium.toFixed(2)}), which gives us a premium entry for shorts. We're selling above fair value — exactly where smart money distributes.`)
  }

  // 7. Session recommendation
  parts.push(`The expected session for this setup is ${setup.expectedSession.replace('_', ' ')}, where liquidity is highest and the move is most likely to play out. Avoid entering during low-liquidity Asian session unless the setup is exceptionally clean.`)

  // 8. Risk warning
  parts.push(`The trade is invalidated if price closes ${bias === 'BUY' ? 'below' : 'above'} ${setup.stopLoss.toFixed(2)} — this would invalidate the ${biasLabel} structure and we exit immediately, no questions asked. Risk management is non-negotiable.`)

  // 9. Closing
  parts.push(`This is a probability-based setup, not a guarantee. Confidence is ${setup.confidence}% based on timeframe alignment and structural confluence. Always size positions correctly, set your stop loss before entry, and never move your stop loss against you. Educational analysis — never financial advice.`)

  return parts.join(' ')
}

export function generateQuickCoachTip(smc: SMCAnalysis, bias: MarketBias): string {
  const tips: string[] = []
  if (smc.structure.chochEvents.length > 0) {
    const last = smc.structure.chochEvents.at(-1)!
    tips.push(`CHoCH ${last.direction.toLowerCase()} at ${last.price.toFixed(2)} — watch for OB retest`)
  }
  if (smc.liquidity.some(l => l.swept)) {
    tips.push('Liquidity swept — smart money likely positioning for reversal')
  }
  if (smc.fvgs.filter(f => !f.filled).length > 0) {
    tips.push('Unfilled FVGs present — potential magnet for price')
  }
  if (smc.trend === 'RANGING') {
    tips.push('Market is ranging — wait for breakout and retest')
  }
  if (tips.length === 0) {
    return `No high-probability setup detected right now. Patience is a position. Wait for clear ${bias === 'BUY' ? 'bullish' : 'bearish'} CHoCH before considering entry.`
  }
  return tips.join('. ')
}
