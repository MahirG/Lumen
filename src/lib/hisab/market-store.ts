'use client'

import { create } from 'zustand'
import type { PriceTick, IndicatorSnapshot, SessionInfo, NewsEvent, SmartAlert } from '@/lib/types/hisab'
import { generateCandles, nextTick, liveTick, rsi, atr, adx } from '@/lib/hisab/smc-engine'
import { getCurrentSession } from '@/lib/hisab/sessions'
import { getUpcomingNews, shouldWarnForNews } from '@/lib/hisab/news'
import { generateAlertsFromSMC } from '@/lib/hisab/alerts'
import { analyzeSMC } from '@/lib/hisab/smc-engine'
import type { Timeframe } from '@/lib/types/hisab'

interface MarketState {
  price: PriceTick | null
  indicators: IndicatorSnapshot | null
  session: SessionInfo | null
  newsEvents: NewsEvent[]
  alerts: SmartAlert[]
  candles: Record<Timeframe, ReturnType<typeof generateCandles>>
  spread: number
  basePrice: number

  // Actions
  init: () => void
  tick: () => void
  refreshNews: () => void
  refreshSession: () => void
  refreshAlerts: (timeframe?: Timeframe) => void
  acknowledgeAlert: (id: string) => void
}

const TIMEFRAMES: Timeframe[] = ['1M', '5M', '15M', '1H', '4H', 'D', 'W', 'M']

function buildInitialCandles(): Record<Timeframe, ReturnType<typeof generateCandles>> {
  const map = {} as Record<Timeframe, ReturnType<typeof generateCandles>>
  for (const tf of TIMEFRAMES) {
    map[tf] = generateCandles(tf, 200)
  }
  return map
}

function computePriceFromCandles(candles: ReturnType<typeof generateCandles>): PriceTick {
  const recent = candles.slice(-30)
  const last = candles.at(-1)!
  const first = recent[0]
  const change = last.close - first.open
  const changePct = (change / first.open) * 100
  const high = Math.max(...recent.map(c => c.high))
  const low = Math.min(...recent.map(c => c.low))
  return {
    symbol: 'XAUUSD',
    bid: last.close - 0.15,
    ask: last.close + 0.15,
    last: last.close,
    change,
    changePct,
    high,
    low,
    open: first.open,
    volume: recent.reduce((sum, c) => sum + c.volume, 0),
    timestamp: Date.now(),
  }
}

function computeIndicators(candles: ReturnType<typeof generateCandles>): IndicatorSnapshot {
  const closes = candles.map(c => c.close)
  const last20 = candles.slice(-20)
  const volatility = (Math.max(...last20.map(c => c.high)) - Math.min(...last20.map(c => c.low))) / last20.length
  const lastVolume = candles.at(-1)?.volume ?? 0
  const avgVolume = closes.length > 20
    ? candles.slice(-20).reduce((s, c) => s + c.volume, 0) / 20
    : lastVolume
  return {
    rsi: rsi(closes),
    atr: atr(candles),
    volatility,
    trendStrength: adx(candles),
    volume: avgVolume,
    spread: 0.30, // typical XAUUSD spread in cents
  }
}

export const useMarketStore = create<MarketState>((set, get) => ({
  price: null,
  indicators: null,
  session: null,
  newsEvents: [],
  alerts: [],
  candles: {} as Record<Timeframe, ReturnType<typeof generateCandles>>,
  spread: 0.30,
  basePrice: 2650,

  init: () => {
    const candles = buildInitialCandles()
    const price = computePriceFromCandles(candles['1M'])
    const indicators = computeIndicators(candles['1H'])
    const session = getCurrentSession()
    const newsEvents = getUpcomingNews()
    set({
      candles,
      price,
      indicators,
      session,
      newsEvents,
      basePrice: price.last,
      spread: 0.30,
    })
    // Initial alert generation
    const smc = analyzeSMC(candles['15M'], '15M')
    const initialAlerts = generateAlertsFromSMC(smc, '15M')
    set({ alerts: initialAlerts.slice(0, 12) })
  },

  tick: () => {
    const state = get()
    if (!state.price) return
    const newPrice = liveTick(state.price.last)
    const newBid = newPrice - 0.15
    const newAsk = newPrice + 0.15

    // Update 1M candle
    const candles1M = [...state.candles['1M']]
    const lastCandle = { ...candles1M.at(-1)! }
    lastCandle.close = newPrice
    lastCandle.high = Math.max(lastCandle.high, newPrice)
    lastCandle.low = Math.min(lastCandle.low, newPrice)
    lastCandle.volume += Math.random() * 100
    candles1M[candles1M.length - 1] = lastCandle

    // Occasionally roll a new candle
    if (Math.random() < 0.04) {
      candles1M.push(nextTick(lastCandle, '1M'))
      if (candles1M.length > 250) candles1M.shift()
    }

    const newCandles = { ...state.candles, '1M': candles1M }
    const recent = candles1M.slice(-30)
    const change = newPrice - recent[0].open
    const changePct = (change / recent[0].open) * 100

    const newIndicators = computeIndicators(candles1M)

    set({
      candles: newCandles,
      price: {
        ...state.price,
        bid: newBid,
        ask: newAsk,
        last: newPrice,
        change,
        changePct,
        high: Math.max(state.price.high, newPrice),
        low: Math.min(state.price.low, newPrice),
        timestamp: Date.now(),
      },
      indicators: newIndicators,
    })

    // Occasionally generate alerts (5% chance per tick)
    if (Math.random() < 0.05) {
      const smc = analyzeSMC(candles1M, '1M')
      const newAlerts = generateAlertsFromSMC(smc, '1M')
      if (newAlerts.length > 0) {
        const merged = [...newAlerts, ...state.alerts].slice(0, 30)
        set({ alerts: merged })
      }
    }

    // Refresh news countdown every tick
    const refreshedNews = state.newsEvents.map(e => ({
      ...e,
      minutesUntil: Math.max(0, Math.round((e.eventTime - Date.now()) / 60000)),
    }))
    set({ newsEvents: refreshedNews })
  },

  refreshNews: () => {
    const events = getUpcomingNews()
    set({ newsEvents: events })
  },

  refreshSession: () => {
    set({ session: getCurrentSession() })
  },

  refreshAlerts: (timeframe: Timeframe = '15M') => {
    const state = get()
    const smc = analyzeSMC(state.candles[timeframe], timeframe)
    const newAlerts = generateAlertsFromSMC(smc, timeframe)
    const merged = [...newAlerts, ...state.alerts].slice(0, 50)
    set({ alerts: merged })
  },

  acknowledgeAlert: (id: string) => {
    const state = get()
    set({ alerts: state.alerts.filter(a => a.id !== id) })
  },
}))
