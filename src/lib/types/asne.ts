/**
 * ASNE v1.0 — AI Smart Notification Engine
 *
 * Type system for the institutional notification engine.
 * Monitors market 24/7 and notifies subscribers ONLY when meaningful,
 * high-priority events occur. Anti-spam, priority-based, multi-channel.
 *
 * Educational only — never financial advice.
 */

export type NotificationChannel =
  | 'BROWSER_PUSH'
  | 'MOBILE_PUSH'
  | 'EMAIL'
  | 'SMS'
  | 'TELEGRAM'
  | 'WHATSAPP'
  | 'DISCORD'
  | 'IN_APP'

export type AlertCategory =
  | 'TRADE_SETUP'
  | 'PRICE_LEVEL'
  | 'MARKET_STRUCTURE'
  | 'SMART_MONEY'
  | 'SESSION'
  | 'ECONOMIC_NEWS'
  | 'VOLATILITY'
  | 'RISK'

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type SubscriptionTier = 'FREE' | 'PRO' | 'PREMIUM' | 'VIP' | 'INSTITUTIONAL'

export type AssetFilter = 'ALL' | 'GOLD' | 'FOREX' | 'CRYPTO' | 'XAUUSD' | 'EURUSD' | 'GBPUSD'
export type SignalFilter = 'ALL' | 'BUY_ONLY' | 'SELL_ONLY' | 'NEWS_ONLY' | 'SESSIONS_ONLY' | 'HIGH_CONFIDENCE_ONLY'

export interface ASBENotification {
  id: string
  type: AlertCategory
  priority: PriorityLevel
  title: string
  summary: string
  asset: string
  timeframe?: string
  confidence?: number
  reason: string
  currentPrice?: number
  entryZone?: { low: number; high: number }
  stopLoss?: number
  takeProfit1?: number
  takeProfit2?: number
  takeProfit3?: number
  riskReward?: number
  timestamp: number
  read: boolean
  dismissed: boolean
  channels: NotificationChannel[]
  actionLabel?: string
  actionSection?: string
}

export interface ChannelSubscription {
  channel: NotificationChannel
  enabled: boolean
  config: {
    email?: string
    phone?: string
    telegramChatId?: string
    discordWebhook?: string
    whatsappNumber?: string
  }
}

export interface AlertSubscription {
  category: AlertCategory
  enabled: boolean
  minPriority: PriorityLevel
  cooldownMinutes: number
  lastTriggered?: number
}

export interface PriceLevelSubscription {
  id: string
  price: number
  label: string
  type: 'KEY_LEVEL' | 'ORDER_BLOCK' | 'FVG' | 'PREMIUM' | 'DISCOUNT' | 'FIB_OTE' | 'DAILY_HIGH' | 'DAILY_LOW' | 'WEEKLY_HIGH' | 'WEEKLY_LOW' | 'LIQUIDITY_SWEEP' | 'EQUAL_HIGHS' | 'EQUAL_LOWS' | 'TRENDLINE' | 'SUPPORT' | 'RESISTANCE' | 'PDH' | 'PDL' | 'ASIAN_HIGH' | 'ASIAN_LOW' | 'LONDON_HIGH' | 'LONDON_LOW' | 'NY_HIGH' | 'NY_LOW'
  enabled: boolean
  triggered: boolean
  createdAt: number
}

export interface UserSettings {
  tier: SubscriptionTier
  confidenceThreshold: number // 0-100, only notify if above
  assetFilter: AssetFilter
  signalFilter: SignalFilter
  pushCriticalOnly: boolean // only CRITICAL + HIGH trigger push by default
  quietHours: { enabled: boolean; start: string; end: string }
}

export interface NotificationStats {
  total: number
  unread: number
  critical: number
  high: number
  medium: number
  low: number
  byCategory: Record<AlertCategory, number>
  last24h: number
}

export interface AntiSpamState {
  cooldowns: Map<string, number> // key: category+asset, value: lastTriggered timestamp
  recentHashes: Set<string> // dedup hashes
  mergeWindow: number // ms window to merge similar events
}

export interface TIER_FEATURES {
  maxChannels: number
  maxPriceLevels: number
  categories: AlertCategory[]
  cooldownMultiplier: number
  label: string
  color: string
}

export const TIER_CONFIG: Record<SubscriptionTier, TIER_FEATURES> = {
  FREE: {
    maxChannels: 2,
    maxPriceLevels: 5,
    categories: ['SESSION', 'ECONOMIC_NEWS'],
    cooldownMultiplier: 2,
    label: 'Free',
    color: '#F7A707',
  },
  PRO: {
    maxChannels: 4,
    maxPriceLevels: 15,
    categories: ['SESSION', 'ECONOMIC_NEWS', 'PRICE_LEVEL', 'MARKET_STRUCTURE', 'VOLATILITY'],
    cooldownMultiplier: 1.5,
    label: 'Pro',
    color: '#F7A707',
  },
  PREMIUM: {
    maxChannels: 6,
    maxPriceLevels: 30,
    categories: ['SESSION', 'ECONOMIC_NEWS', 'PRICE_LEVEL', 'MARKET_STRUCTURE', 'SMART_MONEY', 'VOLATILITY', 'RISK', 'TRADE_SETUP'],
    cooldownMultiplier: 1,
    label: 'Premium',
    color: '#F7A707',
  },
  VIP: {
    maxChannels: 7,
    maxPriceLevels: 50,
    categories: ['SESSION', 'ECONOMIC_NEWS', 'PRICE_LEVEL', 'MARKET_STRUCTURE', 'SMART_MONEY', 'VOLATILITY', 'RISK', 'TRADE_SETUP'],
    cooldownMultiplier: 0.7,
    label: 'VIP',
    color: '#F7A707',
  },
  INSTITUTIONAL: {
    maxChannels: 8,
    maxPriceLevels: 999,
    categories: ['SESSION', 'ECONOMIC_NEWS', 'PRICE_LEVEL', 'MARKET_STRUCTURE', 'SMART_MONEY', 'VOLATILITY', 'RISK', 'TRADE_SETUP'],
    cooldownMultiplier: 0.5,
    label: 'Institutional',
    color: '#00E676',
  },
}

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  BROWSER_PUSH: 'Browser Push',
  MOBILE_PUSH: 'Mobile Push',
  EMAIL: 'Email',
  SMS: 'SMS',
  TELEGRAM: 'Telegram',
  WHATSAPP: 'WhatsApp',
  DISCORD: 'Discord Webhook',
  IN_APP: 'In-App',
}

export const CATEGORY_LABELS: Record<AlertCategory, string> = {
  TRADE_SETUP: 'Smart Trade Alerts',
  PRICE_LEVEL: 'Price Level Alerts',
  MARKET_STRUCTURE: 'Market Structure',
  SMART_MONEY: 'Smart Money',
  SESSION: 'Session Alerts',
  ECONOMIC_NEWS: 'Economic News',
  VOLATILITY: 'Volatility Alerts',
  RISK: 'Risk Alerts',
}

export const PRIORITY_CONFIG: Record<PriorityLevel, { color: string; label: string; triggersPush: boolean }> = {
  CRITICAL: { color: '#FF5252', label: 'Critical', triggersPush: true },
  HIGH: { color: '#F7A707', label: 'High', triggersPush: true },
  MEDIUM: { color: '#F7A707', label: 'Medium', triggersPush: false },
  LOW: { color: '#F7A707', label: 'Low', triggersPush: false },
}
