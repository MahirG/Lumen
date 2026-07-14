'use client'

import { create } from 'zustand'
import type { PriceTick, IndicatorSnapshot, SessionInfo, NewsEvent, SmartAlert, Timeframe } from '@/lib/types/hisab'
import { rsi, atr, adx } from '@/lib/hisab/smc-engine'
import { getCurrentSession } from '@/lib/hisab/sessions'
import { getUpcomingNews, shouldWarnForNews } from '@/lib/hisab/news'
import { generateAlertsFromSMC } from '@/lib/hisab/alerts'
import { analyzeSMC } from '@/lib/hisab/smc-engine'
import { generateRealisticCandles } from '@/lib/hisab/live-data'
import type { Candle } from '@/lib/hisab/smc-engine'

interface MarketState {
  price: PriceTick | null
  indicators: IndicatorSnapshot | null
  session: SessionInfo | null
  newsEvents: NewsEvent[]
  alerts: SmartAlert[]
  candles: Record<Timeframe, Candle[]>
  spread: number
  basePrice: number
  dataSource: 'live' | 'cached' | 'fallback'
  lastRealUpdate: number
  liveTickOffset: number // small synthetic delta between real updates

  // Actions
  init: () => Promise<void>
  fetchRealPrice: () => Promise<void>
  fetchRealNews: () => Promise<void>
  microTick: () => void
  refreshNews: () => void
  refreshSession: () => void
  refreshAlerts: (timeframe?: Timeframe) => void
  acknowledgeAlert: (id: string) => void
}

const TIMEFRAMES: Timeframe[] = ['1M', '5M', '15M', '1H', '4H', 'D', 'W', 'M']

function computeIndicatorsFromCandles(candles: Candle[]): IndicatorSnapshot {
  const closes = candles.map(c => c.close)
  const last20 = candles.slice(-20)
  const volatility = (Math.max(...last20.map(c => c.high)) - Math.min(...last20.map(c => c.low))) / last20.length
  const avgVolume = candles.length > 20
    ? candles.slice(-20).reduce((s, c) => s + c.volume, 0) / 20
    : candles.at(-1)?.volume ?? 0
  return {
    rsi: rsi(closes),
    atr: atr(candles),
    volatility,
    trendStrength: adx(candles),
    volume: avgVolume,
    spread: Math.max(0.20, volatility * 0.05),
  }
}

function buildPriceFromCandlesAndLive(candles: Candle[], livePrice: number, prev?: PriceTick | null): PriceTick {
  const recent = candles.slice(-30)
  const sessionOpen = recent[0]?.open ?? livePrice
  const change = livePrice - sessionOpen
  const changePct = sessionOpen > 0 ? (change / sessionOpen) * 100 : 0
  const high = Math.max(...recent.map(c => c.high), livePrice)
  const low = Math.min(...recent.map(c => c.low), livePrice)
  const spread = Math.max(0.20, (recent.at(-1)?.high ?? 1 - recent.at(-1)?.low ?? 0) * 0.05)
  return {
    symbol: 'XAUUSD',
    bid: livePrice - spread / 2,
    ask: livePrice + spread / 2,
    last: livePrice,
    change,
    changePct,
    high,
    low,
    open: sessionOpen,
    volume: recent.reduce((sum, c) => sum + c.volume, 0),
    timestamp: Date.now(),
  }
}

export const useMarketStore = create<MarketState>((set, get) => ({
  price: null,
  indicators: null,
  session: null,
  newsEvents: [],
  alerts: [],
  candles: {} as Record<Timeframe, Candle[]>,
  spread: 0.30,
  basePrice: 2650,
  dataSource: 'fallback',
  lastRealUpdate: 0,
  liveTickOffset: 0,

  init: async () => {
    // Set session immediately; load news in background (uses fallback calendar synchronously)
    const session = getCurrentSession()
    const newsEvents = getUpcomingNews()
    set({ session, newsEvents })

    // Fetch real gold price
    await get().fetchRealPrice()

    // Fetch real economic news (non-blocking)
    get().fetchRealNews()
  },

  fetchRealPrice: async () => {
    try {
      const res = await fetch('/api/price', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const livePrice: number = data.gold?.price
      const source: 'live' | 'cached' | 'fallback' = data.gold?.source === 'gold-api.com' ? 'live' : data.gold?.source === 'cached' ? 'cached' : 'fallback'

      if (typeof livePrice !== 'number' || livePrice <= 0) {
        throw new Error('Invalid price')
      }

      // Build candles anchored to the real price (regenerate on first load or when price drifts significantly)
      const state = get()
      const existingCandles = state.candles
      const needRebuild = !existingCandles['1M'] || existingCandles['1M'].length === 0 ||
        Math.abs((existingCandles['1M'].at(-1)?.close ?? 0) - livePrice) > livePrice * 0.02 // >2% drift

      let candles: Record<Timeframe, Candle[]>
      if (needRebuild) {
        candles = {} as Record<Timeframe, Candle[]>
        for (const tf of TIMEFRAMES) {
          candles[tf] = generateRealisticCandles(livePrice, tf, 200)
        }
      } else {
        // Update only the last candle's close to match live price
        candles = { ...existingCandles }
        for (const tf of TIMEFRAMES) {
          const arr = [...(existingCandles[tf] ?? [])]
          if (arr.length > 0) {
            const last = { ...arr.at(-1)! }
            last.close = livePrice
            last.high = Math.max(last.high, livePrice)
            last.low = Math.min(last.low, livePrice)
            last.volume += Math.random() * 100
            arr[arr.length - 1] = last
            candles[tf] = arr
          }
        }
      }

      const price = buildPriceFromCandlesAndLive(candles['1M'], livePrice, state.price)
      const indicators = computeIndicatorsFromCandles(candles['1H'])

      set({
        candles,
        price,
        indicators,
        basePrice: livePrice,
        dataSource: source,
        lastRealUpdate: Date.now(),
        liveTickOffset: 0,
        spread: price.ask - price.bid,
      })

      // Generate initial alerts from real candle data
      if (needRebuild) {
        const smc = analyzeSMC(candles['15M'], '15M')
        const initialAlerts = generateAlertsFromSMC(smc, '15M')
        set({ alerts: initialAlerts.slice(0, 12) })
      }
    } catch (err) {
      console.warn('[market-store] Real price fetch failed, using fallback:', err)
      // Fallback to synthetic if we have no data yet
      const state = get()
      if (!state.price) {
        const fallbackPrice = 2650 + (Math.random() - 0.5) * 30
        const candles = {} as Record<Timeframe, Candle[]>
        for (const tf of TIMEFRAMES) {
          candles[tf] = generateRealisticCandles(fallbackPrice, tf, 200)
        }
        const price = buildPriceFromCandlesAndLive(candles['1M'], fallbackPrice)
        const indicators = computeIndicatorsFromCandles(candles['1H'])
        set({
          candles, price, indicators, basePrice: fallbackPrice,
          dataSource: 'fallback', lastRealUpdate: Date.now(),
        })
      }
    }
  },

  microTick: () => {
    const state = get()
    if (!state.price) return

    // Apply a small synthetic delta to the last known real price for visual liveliness.
    // This makes the ticker flash green/red between real API updates without
    // making up the underlying price level.
    const driftScale = (state.indicators?.atr ?? 1) * 0.05
    const delta = (Math.random() - 0.5) * driftScale
    const newOffset = state.liveTickOffset + delta
    // Clamp the offset so we don't drift far from the real price
    const clampedOffset = Math.max(-driftScale * 4, Math.min(driftScale * 4, newOffset))
    const displayPrice = state.basePrice + clampedOffset

    const newBid = displayPrice - state.spread / 2
    const newAsk = displayPrice + state.spread / 2

    // Update the last 1M candle's close to track the micro-tick
    const candles1M = [...(state.candles['1M'] ?? [])]
    if (candles1M.length > 0) {
      const lastCandle = { ...candles1M.at(-1)! }
      lastCandle.close = displayPrice
      lastCandle.high = Math.max(lastCandle.high, displayPrice)
      lastCandle.low = Math.min(lastCandle.low, displayPrice)
      lastCandle.volume += Math.random() * 50
      candles1M[candles1M.length - 1] = lastCandle
    }

    const recent = candles1M.slice(-30)
    const change = displayPrice - (recent[0]?.open ?? displayPrice)
    const changePct = (recent[0]?.open ?? displayPrice) > 0 ? (change / (recent[0]?.open ?? displayPrice)) * 100 : 0

    set({
      candles: { ...state.candles, '1M': candles1M },
      price: {
        ...state.price,
        bid: newBid,
        ask: newAsk,
        last: displayPrice,
        change,
        changePct,
        high: Math.max(state.price.high, displayPrice),
        low: Math.min(state.price.low, displayPrice),
        timestamp: Date.now(),
      },
      liveTickOffset: clampedOffset,
    })

    // Refresh news countdown
    const refreshedNews = state.newsEvents.map(e => ({
      ...e,
      minutesUntil: Math.max(-120, Math.round((e.eventTime - Date.now()) / 60000)),
    }))
    set({ newsEvents: refreshedNews })
  },

  fetchRealNews: async () => {
    try {
      const res = await fetch('/api/news?high=true&medium=true&low=false&window=1440', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data.events) && data.events.length > 0) {
        set({ newsEvents: data.events })
      }
    } catch (err) {
      // Silent fallback — store already has the synchronous fallback calendar
      console.warn('[market-store] News fetch failed, using fallback calendar:', err)
    }
  },

  refreshNews: () => {
    // Trigger a fresh fetch from the API (non-blocking)
    get().fetchRealNews()
    // Immediately show the fallback calendar so the UI updates instantly
    set({ newsEvents: getUpcomingNews() })
  },

  refreshSession: () => {
    set({ session: getCurrentSession() })
  },

  refreshAlerts: (timeframe: Timeframe = '15M') => {
    const state = get()
    const candles = state.candles[timeframe]
    if (!candles || candles.length === 0) return
    const smc = analyzeSMC(candles, timeframe)
    const newAlerts = generateAlertsFromSMC(smc, timeframe)
    const merged = [...newAlerts, ...state.alerts].slice(0, 50)
    set({ alerts: merged })
  },

  acknowledgeAlert: (id: string) => {
    const state = get()
    set({ alerts: state.alerts.filter(a => a.id !== id) })
  },
}))
