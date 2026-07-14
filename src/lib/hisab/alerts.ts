/**
 * Hisab Gold AI — Smart Alerts Generator
 *
 * Detects real-time SMC events and generates alerts.
 */

import type { AlertType, AlertSeverity } from '@/lib/types/hisab'
import type { SMCAnalysis, Timeframe } from '@/lib/types/hisab'
import type { Alert } from '@prisma/client'

export interface SmartAlert {
  id: string
  type: AlertType
  symbol: string
  timeframe: Timeframe
  message: string
  severity: AlertSeverity
  price: number
  timestamp: number
}

const ALERT_LABELS: Record<AlertType, string> = {
  LIQUIDITY_SWEEP: 'Liquidity Sweep',
  BOS: 'Break of Structure',
  CHOCH: 'Change of Character',
  ORDER_BLOCK: 'Order Block',
  MITIGATION: 'OB Mitigation',
  FVG_FILL: 'FVG Fill',
  PREMIUM: 'Premium Zone',
  DISCOUNT: 'Discount Zone',
  INDUCEMENT: 'Inducement',
  EQUAL_HIGHS_LOWS: 'Equal Highs/Lows',
}

const ALERT_ICONS: Record<AlertType, string> = {
  LIQUIDITY_SWEEP: 'Waves',
  BOS: 'TrendingUp',
  CHOCH: 'Shuffle',
  ORDER_BLOCK: 'SquareStack',
  MITIGATION: 'CircleDot',
  FVG_FILL: 'Gap',
  PREMIUM: 'ArrowUpCircle',
  DISCOUNT: 'ArrowDownCircle',
  INDUCEMENT: 'Anchor',
  EQUAL_HIGHS_LOWS: 'Equal',
}

export function getAlertLabel(type: AlertType): string {
  return ALERT_LABELS[type]
}

export function getAlertIcon(type: AlertType): string {
  return ALERT_ICONS[type]
}

export function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical': return '#FF5252'
    case 'warn': return '#FFC107'
    case 'info': return '#F5C542'
  }
}

export function generateAlertsFromSMC(
  smc: SMCAnalysis,
  timeframe: Timeframe,
  prevSweepState?: Set<string>,
): SmartAlert[] {
  const alerts: SmartAlert[] = []
  const now = Date.now()
  const symbol = 'XAUUSD'

  // Liquidity sweep alerts (only new sweeps)
  const newSweptLevels = smc.liquidity.filter(l => {
    if (!l.swept) return false
    if (prevSweepState?.has(`${l.type}-${l.price}`)) return false
    return true
  })
  for (const level of newSweptLevels) {
    alerts.push({
      id: `alert-sweep-${timeframe}-${level.price}-${now}`,
      type: 'LIQUIDITY_SWEEP',
      symbol,
      timeframe,
      message: `${level.type === 'BUY_SIDE' ? 'Buy-side' : 'Sell-side'} liquidity swept at ${level.price.toFixed(2)} — potential smart money reversal signal.`,
      severity: level.strength === 'STRONG' ? 'critical' : 'warn',
      price: level.price,
      timestamp: now,
    })
  }

  // CHoCH alert
  const lastChoch = smc.structure.chochEvents.at(-1)
  if (lastChoch && now - lastChoch.timestamp < 60000 * 15) {
    alerts.push({
      id: `alert-choch-${timeframe}-${lastChoch.timestamp}`,
      type: 'CHOCH',
      symbol,
      timeframe,
      message: `${lastChoch.direction === 'BULLISH' ? 'Bullish' : 'Bearish'} CHoCH at ${lastChoch.price.toFixed(2)} — short-term structure shift detected.`,
      severity: 'critical',
      price: lastChoch.price,
      timestamp: lastChoch.timestamp,
    })
  }

  // BOS alert
  const lastBos = smc.structure.bosEvents.at(-1)
  if (lastBos && now - lastBos.timestamp < 60000 * 15) {
    alerts.push({
      id: `alert-bos-${timeframe}-${lastBos.timestamp}`,
      type: 'BOS',
      symbol,
      timeframe,
      message: `${lastBos.direction === 'BULLISH' ? 'Bullish' : 'Bearish'} BOS at ${lastBos.price.toFixed(2)} — trend continuation confirmed.`,
      severity: 'warn',
      price: lastBos.price,
      timestamp: lastBos.timestamp,
    })
  }

  // Unmitigated order block alert
  const unmitigatedOBs = smc.orderBlocks.filter(o => !o.mitigated)
  for (const ob of unmitigatedOBs.slice(-2)) {
    alerts.push({
      id: `alert-ob-${timeframe}-${ob.id}`,
      type: 'ORDER_BLOCK',
      symbol,
      timeframe,
      message: `Unmitigated ${ob.type.toLowerCase()} order block at ${ob.low.toFixed(2)}-${ob.high.toFixed(2)} — watch for reaction.`,
      severity: 'info',
      price: (ob.low + ob.high) / 2,
      timestamp: now,
    })
  }

  // Mitigation alert
  const mitigatedOBs = smc.orderBlocks.filter(o => o.mitigated && o.mitigationPct > 50)
  for (const ob of mitigatedOBs.slice(-1)) {
    alerts.push({
      id: `alert-mitigation-${timeframe}-${ob.id}`,
      type: 'MITIGATION',
      symbol,
      timeframe,
      message: `Order block ${ob.mitigationPct.toFixed(0)}% mitigated — institutional orders being filled.`,
      severity: 'info',
      price: (ob.low + ob.high) / 2,
      timestamp: now,
    })
  }

  // FVG Fill alert
  const recentlyFilledFVGs = smc.fvgs.filter(f => f.filled && now - f.createdAt < 60000 * 60)
  for (const fvg of recentlyFilledFVGs.slice(-1)) {
    alerts.push({
      id: `alert-fvg-${timeframe}-${fvg.id}`,
      type: 'FVG_FILL',
      symbol,
      timeframe,
      message: `${fvg.type.toLowerCase()} FVG filled at ${fvg.low.toFixed(2)}-${fvg.high.toFixed(2)} — imbalance corrected.`,
      severity: 'info',
      price: (fvg.low + fvg.high) / 2,
      timestamp: now,
    })
  }

  // Equal highs/lows alert
  if (smc.equalHighs.length > 0 || smc.equalLows.length > 0) {
    if (smc.equalHighs.length >= 2) {
      alerts.push({
        id: `alert-eq-highs-${timeframe}-${now}`,
        type: 'EQUAL_HIGHS_LOWS',
        symbol,
        timeframe,
        message: `${smc.equalHighs.length} equal highs detected at ${smc.equalHighs[0].toFixed(2)} — buy-side liquidity pool.`,
        severity: 'warn',
        price: smc.equalHighs[0],
        timestamp: now,
      })
    }
    if (smc.equalLows.length >= 2) {
      alerts.push({
        id: `alert-eq-lows-${timeframe}-${now}`,
        type: 'EQUAL_HIGHS_LOWS',
        symbol,
        timeframe,
        message: `${smc.equalLows.length} equal lows detected at ${smc.equalLows[0].toFixed(2)} — sell-side liquidity pool.`,
        severity: 'warn',
        price: smc.equalLows[0],
        timestamp: now,
      })
    }
  }

  // Inducement alert
  for (const ind of smc.inducement.slice(-1)) {
    alerts.push({
      id: `alert-inducement-${timeframe}-${ind.price}-${now}`,
      type: 'INDUCEMENT',
      symbol,
      timeframe,
      message: `Inducement level at ${ind.price.toFixed(2)} — trap for retail traders, watch for ${ind.type === 'BUY' ? 'long' : 'short'} entry after sweep.`,
      severity: 'warn',
      price: ind.price,
      timestamp: now,
    })
  }

  // Premium/discount zone
  const currentPrice = smc.equilibrium
  if (currentPrice > smc.premiumZone.low + (smc.premiumZone.high - smc.premiumZone.low) * 0.7) {
    alerts.push({
      id: `alert-premium-${timeframe}-${now}`,
      type: 'PREMIUM',
      symbol,
      timeframe,
      message: `Price in premium zone (above equilibrium ${smc.equilibrium.toFixed(2)}) — favor shorts over longs.`,
      severity: 'info',
      price: currentPrice,
      timestamp: now,
    })
  } else if (currentPrice < smc.discountZone.high - (smc.discountZone.high - smc.discountZone.low) * 0.7) {
    alerts.push({
      id: `alert-discount-${timeframe}-${now}`,
      type: 'DISCOUNT',
      symbol,
      timeframe,
      message: `Price in discount zone (below equilibrium ${smc.equilibrium.toFixed(2)}) — favor longs over shorts.`,
      severity: 'info',
      price: currentPrice,
      timestamp: now,
    })
  }

  return alerts.sort((a, b) => b.timestamp - a.timestamp)
}

export function alertToDbAlert(alert: SmartAlert): Omit<Alert, 'id' | 'createdAt' | 'acknowledged'> {
  return {
    type: alert.type,
    symbol: alert.symbol,
    timeframe: alert.timeframe,
    message: alert.message,
    severity: alert.severity,
    price: alert.price,
  }
}
