'use client'

import { create } from 'zustand'
import type {
  ASBENotification, ChannelSubscription, AlertSubscription,
  PriceLevelSubscription, UserSettings, NotificationStats,
  AlertCategory, NotificationChannel, SubscriptionTier, PriorityLevel,
} from '@/lib/types/asne'
import { TIER_CONFIG } from '@/lib/types/asne'
import { generateNotifications, shouldSuppress, notificationHash } from './asne-engine'
import { useMarketStore } from './market-store'
import { analyzeSMC } from './smc-engine'

const STORAGE_KEY = 'asne-state-v1'

interface ASNEState {
  notifications: ASBENotification[]
  channels: ChannelSubscription[]
  alertSubs: AlertSubscription[]
  priceLevels: PriceLevelSubscription[]
  settings: UserSettings
  cooldowns: Record<string, number>
  bellOpen: boolean

  // Actions
  init: () => void
  generateFromMarket: () => void
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
  clearAll: () => void
  toggleChannel: (channel: NotificationChannel) => void
  toggleAlert: (category: AlertCategory) => void
  addPriceLevel: (price: number, label: string, type: PriceLevelSubscription['type']) => void
  removePriceLevel: (id: string) => void
  setTier: (tier: SubscriptionTier) => void
  setConfidenceThreshold: (val: number) => void
  setAssetFilter: (filter: UserSettings['assetFilter']) => void
  setSignalFilter: (filter: UserSettings['signalFilter']) => void
  setBellOpen: (open: boolean) => void
  getStats: () => NotificationStats
}

const DEFAULT_CHANNELS: ChannelSubscription[] = [
  { channel: 'IN_APP', enabled: true, config: {} },
  { channel: 'BROWSER_PUSH', enabled: true, config: {} },
  { channel: 'TELEGRAM', enabled: false, config: {} },
  { channel: 'EMAIL', enabled: false, config: {} },
  { channel: 'MOBILE_PUSH', enabled: false, config: {} },
  { channel: 'DISCORD', enabled: false, config: {} },
  { channel: 'SMS', enabled: false, config: {} },
  { channel: 'WHATSAPP', enabled: false, config: {} },
]

const DEFAULT_ALERTS: AlertSubscription[] = [
  { category: 'TRADE_SETUP', enabled: true, minPriority: 'HIGH', cooldownMinutes: 30 },
  { category: 'MARKET_STRUCTURE', enabled: true, minPriority: 'MEDIUM', cooldownMinutes: 15 },
  { category: 'SMART_MONEY', enabled: true, minPriority: 'MEDIUM', cooldownMinutes: 20 },
  { category: 'PRICE_LEVEL', enabled: true, minPriority: 'MEDIUM', cooldownMinutes: 10 },
  { category: 'SESSION', enabled: true, minPriority: 'LOW', cooldownMinutes: 60 },
  { category: 'ECONOMIC_NEWS', enabled: true, minPriority: 'HIGH', cooldownMinutes: 5 },
  { category: 'VOLATILITY', enabled: true, minPriority: 'MEDIUM', cooldownMinutes: 30 },
  { category: 'RISK', enabled: true, minPriority: 'HIGH', cooldownMinutes: 15 },
]

const DEFAULT_SETTINGS: UserSettings = {
  tier: 'PREMIUM',
  confidenceThreshold: 75,
  assetFilter: 'ALL',
  signalFilter: 'ALL',
  pushCriticalOnly: true,
  quietHours: { enabled: false, start: '22:00', end: '07:00' },
}

function loadFromStorage(): Partial<ASNEState> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveToStorage(state: ASNEState) {
  if (typeof window === 'undefined') return
  try {
    const toSave = {
      channels: state.channels,
      alertSubs: state.alertSubs,
      priceLevels: state.priceLevels,
      settings: state.settings,
      cooldowns: state.cooldowns,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {}
}

const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3,
}

export const useASNEStore = create<ASNEState>((set, get) => ({
  notifications: [],
  channels: DEFAULT_CHANNELS,
  alertSubs: DEFAULT_ALERTS,
  priceLevels: [],
  settings: DEFAULT_SETTINGS,
  cooldowns: {},
  bellOpen: false,

  init: () => {
    const saved = loadFromStorage()
    if (saved) {
      set({
        channels: saved.channels ?? DEFAULT_CHANNELS,
        alertSubs: saved.alertSubs ?? DEFAULT_ALERTS,
        priceLevels: saved.priceLevels ?? [],
        settings: { ...DEFAULT_SETTINGS, ...saved.settings },
        cooldowns: saved.cooldowns ?? {},
      })
    }
    // Generate initial notifications after a delay
    setTimeout(() => get().generateFromMarket(), 2000)
  },

  generateFromMarket: () => {
    const market = useMarketStore.getState()
    if (!market.price || !market.indicators || !market.session) return
    if (!market.candles['15M']) return

    const smc = analyzeSMC(market.candles['15M'], '15M')
    const state = get()

    // Filter channels to enabled ones
    const enabledChannels = state.channels.filter(c => c.enabled).map(c => c.channel)
    if (enabledChannels.length === 0) return

    const rawNotifications = generateNotifications(
      {
        smc,
        price: market.price,
        indicators: market.indicators,
        session: market.session,
        newsEvents: market.newsEvents,
        timeframe: '15M',
      },
      {
        confidenceThreshold: state.settings.confidenceThreshold,
        channels: enabledChannels,
        pushCriticalOnly: state.settings.pushCriticalOnly,
      },
    )

    // Apply anti-spam + subscription filters
    const now = Date.now()
    const newNotifs: ASBENotification[] = []
    const newCooldowns = { ...state.cooldowns }

    for (const notif of rawNotifications) {
      // Check alert subscription
      const sub = state.alertSubs.find(s => s.category === notif.type)
      if (!sub || !sub.enabled) continue

      // Check tier allows this category
      const tierConfig = TIER_CONFIG[state.settings.tier]
      if (!tierConfig.categories.includes(notif.type)) continue

      // Check priority threshold
      if (PRIORITY_ORDER[notif.priority] > PRIORITY_ORDER[sub.minPriority]) continue

      // Check confidence threshold for trade setups
      if (notif.type === 'TRADE_SETUP' && notif.confidence && notif.confidence < state.settings.confidenceThreshold) continue

      // Anti-spam
      const cooldownMin = sub.cooldownMinutes * tierConfig.cooldownMultiplier
      if (shouldSuppress(notif, state.notifications, new Map(Object.entries(newCooldowns)), cooldownMin)) continue

      // Track cooldown
      const hash = notificationHash(notif)
      newCooldowns[hash] = now

      newNotifs.push(notif)
    }

    if (newNotifs.length > 0) {
      const merged = [...newNotifs, ...state.notifications].slice(0, 100) // keep last 100
      set({ notifications: merged, cooldowns: newCooldowns })
    }
  },

  markRead: (id: string) => {
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }))
  },

  markAllRead: () => {
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
    }))
  },

  dismiss: (id: string) => {
    set(s => ({
      notifications: s.notifications.filter(n => n.id !== id),
    }))
  },

  clearAll: () => {
    set({ notifications: [] })
  },

  toggleChannel: (channel: NotificationChannel) => {
    set(s => {
      const channels = s.channels.map(c =>
        c.channel === channel ? { ...c, enabled: !c.enabled } : c,
      )
      const newState = { ...s, channels }
      saveToStorage(newState)
      return { channels }
    })
  },

  toggleAlert: (category: AlertCategory) => {
    set(s => {
      const alertSubs = s.alertSubs.map(a =>
        a.category === category ? { ...a, enabled: !a.enabled } : a,
      )
      const newState = { ...s, alertSubs }
      saveToStorage(newState)
      return { alertSubs }
    })
  },

  addPriceLevel: (price, label, type) => {
    set(s => {
      const tierConfig = TIER_CONFIG[s.settings.tier]
      if (s.priceLevels.length >= tierConfig.maxPriceLevels) return s
      const newLevel: PriceLevelSubscription = {
        id: `pl-${Date.now()}`,
        price, label, type,
        enabled: true, triggered: false,
        createdAt: Date.now(),
      }
      const priceLevels = [newLevel, ...s.priceLevels]
      const newState = { ...s, priceLevels }
      saveToStorage(newState)
      return { priceLevels }
    })
  },

  removePriceLevel: (id: string) => {
    set(s => {
      const priceLevels = s.priceLevels.filter(p => p.id !== id)
      const newState = { ...s, priceLevels }
      saveToStorage(newState)
      return { priceLevels }
    })
  },

  setTier: (tier: SubscriptionTier) => {
    set(s => {
      const settings = { ...s.settings, tier }
      const newState = { ...s, settings }
      saveToStorage(newState)
      return { settings }
    })
  },

  setConfidenceThreshold: (val: number) => {
    set(s => {
      const settings = { ...s.settings, confidenceThreshold: val }
      const newState = { ...s, settings }
      saveToStorage(newState)
      return { settings }
    })
  },

  setAssetFilter: (filter) => {
    set(s => {
      const settings = { ...s.settings, assetFilter: filter }
      saveToStorage({ ...s, settings })
      return { settings }
    })
  },

  setSignalFilter: (filter) => {
    set(s => {
      const settings = { ...s.settings, signalFilter: filter }
      saveToStorage({ ...s, settings })
      return { settings }
    })
  },

  setBellOpen: (open: boolean) => set({ bellOpen: open }),

  getStats: () => {
    const notifs = get().notifications
    const now = Date.now()
    const last24h = notifs.filter(n => now - n.timestamp < 24 * 60 * 60 * 1000).length
    const byCategory = {} as Record<AlertCategory, number>
    for (const n of notifs) {
      byCategory[n.type] = (byCategory[n.type] ?? 0) + 1
    }
    return {
      total: notifs.length,
      unread: notifs.filter(n => !n.read).length,
      critical: notifs.filter(n => n.priority === 'CRITICAL').length,
      high: notifs.filter(n => n.priority === 'HIGH').length,
      medium: notifs.filter(n => n.priority === 'MEDIUM').length,
      low: notifs.filter(n => n.priority === 'LOW').length,
      byCategory,
      last24h,
    }
  },
}))
