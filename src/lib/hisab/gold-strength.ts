/**
 * Hisab Gold AI — Gold Strength Meter
 *
 * Aggregates DXY, US10Y yields, interest rate expectations, volatility, and
 * safe-haven demand to compute a single Gold strength score.
 * Educational only — not financial advice.
 */

import type { GoldStrength, GoldStrengthComponents } from '@/lib/types/hisab'

interface RawInputs {
  dxy: number
  dxyChange: number
  us10y: number
  us10yChange: number
  volatilityPercentile: number
  vix: number
  safeHavenDemand: number // 0-100
}

// Generate realistic current inputs. In production, would fetch from API.
export function getRawInputs(seed = Date.now()): RawInputs {
  // Use seed for some variation
  const variance = (Math.sin(seed / 60000) + 1) / 2 // 0-1, changes every minute
  return {
    dxy: 104.2 + (variance - 0.5) * 1.2,
    dxyChange: (variance - 0.5) * 0.6,
    us10y: 4.28 + (variance - 0.5) * 0.08,
    us10yChange: (variance - 0.5) * 0.04,
    volatilityPercentile: 35 + variance * 40,
    vix: 14 + variance * 6,
    safeHavenDemand: 45 + variance * 30,
  }
}

export function computeGoldStrength(raw: RawInputs): GoldStrength {
  // DXY: inversely correlated with gold. Higher DXY = weaker gold.
  // Range ~100-110 → 0% to 100% bearish for gold
  const dxyImpact = Math.max(-50, Math.min(50, (104 - raw.dxy) * 8)) + raw.dxyChange * -10

  // US10Y: inversely correlated. Higher yields = weaker gold (opportunity cost)
  const us10yImpact = Math.max(-50, Math.min(50, (4.3 - raw.us10y) * 40)) + raw.us10yChange * -50

  // Interest rates trend: hawkish = bearish for gold, dovish = bullish
  let rateTrend: 'HAWKISH' | 'DOVISH' | 'NEUTRAL' = 'NEUTRAL'
  if (raw.us10y > 4.35 && raw.us10yChange > 0.02) rateTrend = 'HAWKISH'
  else if (raw.us10y < 4.2 && raw.us10yChange < -0.02) rateTrend = 'DOVISH'
  const rateImpact = rateTrend === 'HAWKISH' ? -25 : rateTrend === 'DOVISH' ? 25 : 0

  // Volatility: high volatility is mildly bullish for gold (safe haven)
  const volImpact = (raw.volatilityPercentile - 50) * 0.3

  // Safe haven demand
  const safeHavenImpact = (raw.safeHavenDemand - 50) * 0.6

  const components: GoldStrengthComponents = {
    dxy: {
      value: raw.dxy,
      change: raw.dxyChange,
      impact: dxyImpact,
    },
    us10y: {
      value: raw.us10y,
      change: raw.us10yChange,
      impact: us10yImpact,
    },
    interestRates: {
      value: raw.us10y,
      trend: rateTrend,
      impact: rateImpact,
    },
    volatility: {
      value: raw.vix,
      percentile: raw.volatilityPercentile,
      impact: volImpact,
    },
    safeHaven: {
      value: raw.safeHavenDemand,
      impact: safeHavenImpact,
    },
  }

  // Aggregate to score 0-100
  const totalImpact = dxyImpact + us10yImpact + rateImpact + volImpact + safeHavenImpact
  const score = Math.max(0, Math.min(100, 50 + totalImpact * 0.4))

  let label: GoldStrength['label'] = 'NEUTRAL'
  if (score >= 80) label = 'VERY_STRONG'
  else if (score >= 65) label = 'STRONG'
  else if (score >= 35) label = 'NEUTRAL'
  else if (score >= 20) label = 'WEAK'
  else label = 'VERY_WEAK'

  const direction: GoldStrength['direction'] = score >= 60 ? 'BULLISH' : score <= 40 ? 'BEARISH' : 'NEUTRAL'

  let summary = ''
  if (direction === 'BULLISH') {
    summary = `Gold is currently supported by ${dxyImpact > 0 ? 'USD weakness' : ''} ${safeHavenImpact > 0 ? 'and elevated safe-haven demand' : ''}. ${rateTrend === 'DOVISH' ? 'Dovish rate expectations are providing additional tailwind.' : ''} Probability favors continued upside momentum.`
  } else if (direction === 'BEARISH') {
    summary = `Gold faces headwinds from ${dxyImpact < 0 ? 'strong USD' : ''} ${us10yImpact < 0 ? 'and rising yields' : ''}. ${rateTrend === 'HAWKISH' ? 'Hawkish monetary policy stance caps upside.' : ''} Probability favors consolidation or pullback.`
  } else {
    summary = `Gold is in a balanced state with offsetting forces. ${raw.volatilityPercentile > 60 ? 'Elevated volatility suggests breakout potential in either direction.' : 'Range-bound conditions likely to persist.'}`
  }

  return { score, label, direction, components, summary }
}

export function getStrengthLabel(label: GoldStrength['label']): string {
  switch (label) {
    case 'VERY_STRONG': return 'Very Strong'
    case 'STRONG': return 'Strong'
    case 'NEUTRAL': return 'Neutral'
    case 'WEAK': return 'Weak'
    case 'VERY_WEAK': return 'Very Weak'
  }
}

export function getStrengthColor(score: number): string {
  if (score >= 65) return 'oklch(0.72 0.18 145)' // bull green
  if (score >= 50) return 'oklch(0.82 0.15 85)' // gold
  if (score >= 35) return 'oklch(0.75 0.02 60)' // neutral
  return 'oklch(0.66 0.22 25)' // bear red
}
