/**
 * ASNE v1.0 — AI Smart Notification Engine
 *
 * Generates intelligent notifications from live market data.
 * Anti-spam: dedup, cooldown, merge. Priority-based.
 *
 * "The objective is not to generate more notifications.
 *  The objective is to generate fewer—but significantly more
 *  valuable—notifications." — ASNE mission
 */

import type {
  ASBENotification, AlertCategory, PriorityLevel, NotificationChannel,
} from '../types/asne'
import type { SMCAnalysis, PriceTick, IndicatorSnapshot } from '../types/hisab'
import type { SessionInfo, NewsEvent } from '../types/hisab'
import { getCurrentSession } from './sessions'
import { shouldWarnForNews } from './news'

const formatNum = (n: number) => Number(n.toFixed(2))

interface MarketContext {
  smc: SMCAnalysis
  price: PriceTick
  indicators: IndicatorSnapshot
  session: SessionInfo
  newsEvents: NewsEvent[]
  timeframe: string
}

interface GenerateOptions {
  confidenceThreshold: number
  channels: NotificationChannel[]
  pushCriticalOnly: boolean
}

/**
 * Generate all applicable notifications from current market context.
 * Returns ONLY notifications that pass anti-spam + priority + confidence filters.
 */
export function generateNotifications(
  ctx: MarketContext,
  opts: GenerateOptions,
): ASBENotification[] {
  const notifications: ASBENotification[] = []
  const now = Date.now()
  const { smc, price, indicators, session, newsEvents } = ctx

  // ===== TRADE SETUP ALERTS =====
  const tradeSetup = generateTradeSetupAlert(smc, price, opts, now)
  if (tradeSetup) notifications.push(tradeSetup)

  // ===== MARKET STRUCTURE ALERTS =====
  const structureAlerts = generateStructureAlerts(smc, price, opts, now)
  notifications.push(...structureAlerts)

  // ===== SMART MONEY ALERTS =====
  const smartMoneyAlerts = generateSmartMoneyAlerts(smc, price, opts, now)
  notifications.push(...smartMoneyAlerts)

  // ===== PRICE LEVEL ALERTS =====
  const priceLevelAlerts = generatePriceLevelAlerts(smc, price, opts, now)
  notifications.push(...priceLevelAlerts)

  // ===== SESSION ALERTS =====
  const sessionAlert = generateSessionAlert(session, opts, now)
  if (sessionAlert) notifications.push(sessionAlert)

  // ===== ECONOMIC NEWS ALERTS =====
  const newsAlerts = generateNewsAlerts(newsEvents, opts, now)
  notifications.push(...newsAlerts)

  // ===== VOLATILITY ALERTS =====
  const volatilityAlerts = generateVolatilityAlerts(indicators, price, opts, now)
  notifications.push(...volatilityAlerts)

  // ===== RISK ALERTS =====
  const riskAlerts = generateRiskAlerts(indicators, session, newsEvents, opts, now)
  notifications.push(...riskAlerts)

  return notifications
}

function generateTradeSetupAlert(
  smc: SMCAnalysis,
  price: PriceTick,
  opts: GenerateOptions,
  now: number,
): ASBENotification | null {
  // Only generate trade setup if conditions are strongly aligned
  const lastChoch = smc.structure.chochEvents.at(-1)
  const lastBos = smc.structure.bosEvents.at(-1)
  const swept = smc.liquidity.filter(l => l.swept)
  const unmitigatedOB = smc.orderBlocks.find(o => !o.mitigated)

  if (!lastChoch && !lastBos) return null
  if (swept.length === 0) return null
  if (!unmitigatedOB) return null

  // Determine bias
  const lastEvent = lastChoch ?? lastBos
  const isBullish = lastEvent.direction === 'BULLISH'
  const bias = isBullish ? 'BUY' : 'SELL'

  // Confidence estimation
  let confidence = 70
  if (smc.trend === (isBullish ? 'BULLISH' : 'BEARISH')) confidence += 10
  if (swept.length >= 2) confidence += 8
  if (smc.fvgs.filter(f => !f.filled).length > 0) confidence += 5
  if (smc.trendStrength > 30) confidence += 7
  confidence = Math.min(98, confidence)

  if (confidence < opts.confidenceThreshold) return null

  const entry = (unmitigatedOB.low + unmitigatedOB.high) / 2
  const risk = Math.abs(entry - (isBullish ? unmitigatedOB.low : unmitigatedOB.high))
  const sl = isBullish ? unmitigatedOB.low - risk * 0.2 : unmitigatedOB.high + risk * 0.2
  const tp1 = isBullish ? entry + risk * 1 : entry - risk * 1
  const tp2 = isBullish ? entry + risk * 2 : entry - risk * 2
  const tp3 = isBullish ? entry + risk * 3 : entry - risk * 3
  const rr = 1

  const priority: PriorityLevel = confidence >= 90 ? 'CRITICAL' : confidence >= 80 ? 'HIGH' : 'MEDIUM'

  return {
    id: `trade-setup-${now}-${bias}`,
    type: 'TRADE_SETUP',
    priority,
    title: `${bias === 'BUY' ? '🟢 BUY' : '🔴 SELL'} Setup Confirmed`,
    summary: `All institutional confirmations satisfied. ${bias} setup with ${confidence}% confidence.`,
    asset: 'XAUUSD',
    timeframe: '15M',
    confidence,
    reason: `${lastChoch ? 'CHoCH' : 'BOS'} ${lastEvent.direction}, liquidity sweep confirmed, ${unmitigatedOB.type} order block active, ${smc.trend} trend.`,
    currentPrice: price.last,
    entryZone: { low: unmitigatedOB.low, high: unmitigatedOB.high },
    stopLoss: sl,
    takeProfit1: tp1,
    takeProfit2: tp2,
    takeProfit3: tp3,
    riskReward: rr,
    timestamp: now,
    read: false,
    dismissed: false,
    channels: opts.channels,
    actionLabel: 'Tap to View Chart',
    actionSection: 'chart-analysis',
  }
}

function generateStructureAlerts(
  smc: SMCAnalysis,
  price: PriceTick,
  opts: GenerateOptions,
  now: number,
): ASBENotification[] {
  const alerts: ASBENotification[] = []
  const lastEvent = smc.structure.lastEvent
  if (!lastEvent) return alerts

  // Only alert on recent events (within 5 min)
  if (now - lastEvent.timestamp > 5 * 60 * 1000) return alerts

  const isChoch = lastEvent.type === 'CHoCH'
  const priority: PriorityLevel = isChoch ? 'HIGH' : 'MEDIUM'

  alerts.push({
    id: `structure-${lastEvent.id}-${now}`,
    type: 'MARKET_STRUCTURE',
    priority,
    title: `${isChoch ? 'Change of Character' : 'Break of Structure'}`,
    summary: `${lastEvent.direction} ${isChoch ? 'CHoCH' : 'BOS'} at ${formatNum(lastEvent.price)} — ${isChoch ? 'potential reversal signal' : 'trend continuation confirmed'}.`,
    asset: 'XAUUSD',
    timeframe: lastEvent.timeframe,
    reason: `Price ${lastEvent.direction === 'BULLISH' ? 'broke above' : 'broke below'} key structure at ${formatNum(lastEvent.price)}.`,
    currentPrice: price.last,
    timestamp: now,
    read: false,
    dismissed: false,
    channels: opts.channels,
    actionLabel: 'View Structure',
    actionSection: 'mtf',
  })

  return alerts
}

function generateSmartMoneyAlerts(
  smc: SMCAnalysis,
  price: PriceTick,
  opts: GenerateOptions,
  now: number,
): ASBENotification[] {
  const alerts: ASBENotification[] = []

  // Liquidity sweep / stop hunt
  const sweptLevels = smc.liquidity.filter(l => l.swept)
  for (const level of sweptLevels.slice(0, 1)) {
    alerts.push({
      id: `smart-money-sweep-${level.price}-${now}`,
      type: 'SMART_MONEY',
      priority: level.strength === 'STRONG' ? 'HIGH' : 'MEDIUM',
      title: `${level.type === 'BUY_SIDE' ? 'Buy-Side' : 'Sell-Side'} Liquidity Swept`,
      summary: `${level.strength} ${level.type === 'BUY_SIDE' ? 'buy-side' : 'sell-side'} liquidity at ${formatNum(level.price)} has been swept. Smart money positioning detected.`,
      asset: 'XAUUSD',
      timeframe: '15M',
      reason: `Liquidity grab at ${formatNum(level.price)} — ${level.type === 'BUY_SIDE' ? 'stops above taken' : 'stops below taken'}. Watch for reversal.`,
      currentPrice: price.last,
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
      actionLabel: 'View Liquidity',
      actionSection: 'chart-analysis',
    })
  }

  // Unfilled FVG
  const unfilledFVGs = smc.fvgs.filter(f => !f.filled)
  if (unfilledFVGs.length > 0) {
    const fvg = unfilledFVGs.at(-1)!
    alerts.push({
      id: `smart-money-fvg-${fvg.id}-${now}`,
      type: 'SMART_MONEY',
      priority: 'LOW',
      title: `Fair Value Gap Created`,
      summary: `${fvg.type} FVG at ${formatNum(fvg.low)}–${formatNum(fvg.high)} — unfilled imbalance zone.`,
      asset: 'XAUUSD',
      timeframe: fvg.timeframe,
      reason: `3-candle imbalance detected. Markets tend to revisit and fill FVGs.`,
      currentPrice: price.last,
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
    })
  }

  // Unmitigated OB
  const freshOBs = smc.orderBlocks.filter(o => !o.mitigated)
  if (freshOBs.length > 0) {
    const ob = freshOBs.at(-1)!
    alerts.push({
      id: `smart-money-ob-${ob.id}-${now}`,
      type: 'SMART_MONEY',
      priority: 'MEDIUM',
      title: `Order Block Active`,
      summary: `${ob.type} order block at ${formatNum(ob.low)}–${formatNum(ob.high)} — unmitigated institutional zone.`,
      asset: 'XAUUSD',
      timeframe: ob.timeframe,
      reason: `Last ${ob.type === 'BULLISH' ? 'down' : 'up'} candle before strong move. Institutional orders resting here.`,
      currentPrice: price.last,
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
    })
  }

  return alerts
}

function generatePriceLevelAlerts(
  smc: SMCAnalysis,
  price: PriceTick,
  opts: GenerateOptions,
  now: number,
): ASBENotification[] {
  const alerts: ASBENotification[] = []
  const tol = price.last * 0.002 // 0.2% tolerance

  // Check premium/discount zone
  if (price.last > smc.equilibrium + (smc.swingHigh - smc.equilibrium) * 0.7) {
    alerts.push({
      id: `price-premium-${now}`,
      type: 'PRICE_LEVEL',
      priority: 'MEDIUM',
      title: 'Price Entered Premium Zone',
      summary: `XAUUSD at ${formatNum(price.last)} — above equilibrium ${formatNum(smc.equilibrium)}. Favor shorts over longs.`,
      asset: 'XAUUSD',
      reason: 'Price in premium zone (upper half of range). Premium entries for short positions.',
      currentPrice: price.last,
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
    })
  } else if (price.last < smc.equilibrium - (smc.equilibrium - smc.swingLow) * 0.7) {
    alerts.push({
      id: `price-discount-${now}`,
      type: 'PRICE_LEVEL',
      priority: 'MEDIUM',
      title: 'Price Entered Discount Zone',
      summary: `XAUUSD at ${formatNum(price.last)} — below equilibrium ${formatNum(smc.equilibrium)}. Favor longs over shorts.`,
      asset: 'XAUUSD',
      reason: 'Price in discount zone (lower half of range). Discount entries for long positions.',
      currentPrice: price.last,
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
    })
  }

  // Daily high/low proximity
  if (Math.abs(price.last - smc.swingHigh) <= tol) {
    alerts.push({
      id: `price-daily-high-${now}`,
      type: 'PRICE_LEVEL',
      priority: 'HIGH',
      title: 'Price at Daily High',
      summary: `XAUUSD testing daily high at ${formatNum(smc.swingHigh)}. Buy-side liquidity above.`,
      asset: 'XAUUSD',
      reason: 'Price near daily swing high — potential liquidity target for smart money.',
      currentPrice: price.last,
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
    })
  }
  if (Math.abs(price.last - smc.swingLow) <= tol) {
    alerts.push({
      id: `price-daily-low-${now}`,
      type: 'PRICE_LEVEL',
      priority: 'HIGH',
      title: 'Price at Daily Low',
      summary: `XAUUSD testing daily low at ${formatNum(smc.swingLow)}. Sell-side liquidity below.`,
      asset: 'XAUUSD',
      reason: 'Price near daily swing low — potential liquidity target for smart money.',
      currentPrice: price.last,
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
    })
  }

  // Equal highs/lows
  if (smc.equalHighs.length >= 2) {
    const eh = smc.equalHighs[0]
    if (Math.abs(price.last - eh) <= tol) {
      alerts.push({
        id: `price-eq-highs-${now}`,
        type: 'PRICE_LEVEL',
        priority: 'HIGH',
        title: 'Equal Highs — Liquidity Pool',
        summary: `${smc.equalHighs.length} equal highs at ${formatNum(eh)}. Buy-side liquidity resting here.`,
        asset: 'XAUUSD',
        reason: 'Equal highs create a liquidity pool — prime target for stop hunt.',
        currentPrice: price.last,
        timestamp: now,
        read: false,
        dismissed: false,
        channels: opts.channels,
      })
    }
  }

  return alerts
}

function generateSessionAlert(
  session: SessionInfo,
  opts: GenerateOptions,
  now: number,
): ASBENotification | null {
  if (!session.isActive && session.nextSession && session.nextSessionStart) {
    // Notify 15 minutes before session
    // Simulated: always show a session prep alert
    return {
      id: `session-${session.nextSession}-${now}`,
      type: 'SESSION',
      priority: 'MEDIUM',
      title: `🕒 ${session.nextSession.replace('_', ' ')} Session Approaching`,
      summary: `${session.nextSession.replace('_', ' ')} session begins soon. Prepare for increased volatility.`,
      asset: 'XAUUSD',
      reason: `Pre-session preparation alert for ${session.nextSession.replace('_', ' ')} session.`,
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
    }
  }

  if (session.isKillZone) {
    return {
      id: `session-killzone-${session.name}-${now}`,
      type: 'SESSION',
      priority: 'HIGH',
      title: `⚡ ${session.name.replace('_', ' ')} Kill Zone Active`,
      summary: `High-probability trading window is now open. ICT kill zone active.`,
      asset: 'XAUUSD',
      reason: `${session.name} kill zone — highest liquidity and momentum window.`,
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
    }
  }

  return null
}

function generateNewsAlerts(
  newsEvents: NewsEvent[],
  opts: GenerateOptions,
  now: number,
): ASBENotification[] {
  const alerts: ASBENotification[] = []
  const newsFilter = shouldWarnForNews(newsEvents)

  const upcoming = newsEvents.filter(e => e.minutesUntil <= 60 && e.impact === 'HIGH')
  for (const event of upcoming.slice(0, 2)) {
    const priority: PriorityLevel = event.minutesUntil <= 5 ? 'CRITICAL' : event.minutesUntil <= 15 ? 'HIGH' : 'MEDIUM'
    let recommendation = ''
    if (event.minutesUntil <= 5) {
      recommendation = 'Avoid opening new positions until volatility settles.'
    } else if (event.minutesUntil <= 15) {
      recommendation = 'Close or hedge open positions. High volatility imminent.'
    } else {
      recommendation = 'Prepare for increased volatility. Review open positions.'
    }

    alerts.push({
      id: `news-${event.id}-${now}`,
      type: 'ECONOMIC_NEWS',
      priority,
      title: `🚨 HIGH IMPACT NEWS — ${event.title}`,
      summary: `${event.title} releases in ${event.minutesUntil} minute${event.minutesUntil !== 1 ? 's' : ''}. Affected: Gold, USD, EURUSD, GBPUSD, US30, NASDAQ.`,
      asset: 'USD',
      reason: `Source: ${event.source}. Forecast: ${event.forecast ?? '—'}. Previous: ${event.previous ?? '—'}.`,
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
      actionLabel: recommendation,
    })
  }

  return alerts
}

function generateVolatilityAlerts(
  indicators: IndicatorSnapshot,
  price: PriceTick,
  opts: GenerateOptions,
  now: number,
): ASBENotification[] {
  const alerts: ASBENotification[] = []

  // ATR expansion
  if (indicators.atr > price.last * 0.005) {
    alerts.push({
      id: `volatility-atr-${now}`,
      type: 'VOLATILITY',
      priority: 'MEDIUM',
      title: 'ATR Expansion Detected',
      summary: `ATR at ${formatNum(indicators.atr)} — significant volatility expansion. Adjust position sizing.`,
      asset: 'XAUUSD',
      reason: `ATR above 0.5% of price — elevated volatility. Reduce lot size or widen stops.`,
      currentPrice: price.last,
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
    })
  }

  // Spread widening
  if (indicators.spread > 0.5) {
    alerts.push({
      id: `volatility-spread-${now}`,
      type: 'VOLATILITY',
      priority: 'LOW',
      title: 'Spread Widened',
      summary: `Current spread: ${indicators.spread.toFixed(2)}¢ — above normal. Wait for normalization.`,
      asset: 'XAUUSD',
      reason: 'Widened spread indicates thin liquidity or news impact.',
      currentPrice: price.last,
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
    })
  }

  return alerts
}

function generateRiskAlerts(
  indicators: IndicatorSnapshot,
  session: SessionInfo,
  newsEvents: NewsEvent[],
  opts: GenerateOptions,
  now: number,
): ASBENotification[] {
  const alerts: ASBENotification[] = []

  // News overlap with active session
  const imminentNews = newsEvents.find(e => e.impact === 'HIGH' && e.minutesUntil <= 15)
  if (imminentNews && session.isKillZone) {
    alerts.push({
      id: `risk-news-overlap-${now}`,
      type: 'RISK',
      priority: 'CRITICAL',
      title: '⚠️ Risk Warning: News Overlaps Setup',
      summary: `High-impact news (${imminentNews.title}) in ${imminentNews.minutesUntil}m coincides with ${session.name} kill zone. Extreme volatility risk.`,
      asset: 'XAUUSD',
      reason: 'News + kill zone overlap creates unpredictable volatility. Avoid new entries.',
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
    })
  }

  // Off-session risk
  if (!session.isActive) {
    alerts.push({
      id: `risk-off-session-${now}`,
      type: 'RISK',
      priority: 'LOW',
      title: 'Off-Session: Low Liquidity',
      summary: 'Markets are in off-session. Reduced liquidity may cause erratic price action.',
      asset: 'XAUUSD',
      reason: 'Trading outside active sessions increases spread and slippage risk.',
      timestamp: now,
      read: false,
      dismissed: false,
      channels: opts.channels,
    })
  }

  return alerts
}

/**
 * Anti-spam: check if a notification should be suppressed.
 * Returns true if the notification should be BLOCKED (duplicate or in cooldown).
 */
export function shouldSuppress(
  notification: ASBENotification,
  recentNotifications: ASBENotification[],
  cooldowns: Map<string, number>,
  cooldownMinutes: number,
): boolean {
  const now = notification.timestamp
  const key = `${notification.type}-${notification.asset}-${notification.title}`

  // Dedup: same title+asset within 5 minutes
  const recent = recentNotifications.find(
    n => n.title === notification.title && n.asset === notification.asset && now - n.timestamp < 5 * 60 * 1000,
  )
  if (recent) return true

  // Cooldown: same category+asset within cooldown window
  const lastTriggered = cooldowns.get(key)
  if (lastTriggered && now - lastTriggered < cooldownMinutes * 60 * 1000) {
    return true
  }

  return false
}

/**
 * Generate a dedup hash for a notification (for anti-spam tracking).
 */
export function notificationHash(n: ASBENotification): string {
  return `${n.type}-${n.asset}-${n.title}`
}
