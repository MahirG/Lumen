'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, BellRing, BellOff, Settings, Trash2, Check, CheckCheck, X,
  TrendingUp, TrendingDown, Activity, Waves, Newspaper, Clock,
  AlertTriangle, Zap, Crown, Mail, MessageSquare, Send, Smartphone,
  Globe, Monitor, Plus, Filter, Award, Shield, ChevronRight, Target,
} from 'lucide-react'
import { LiquidGlassCard, GlowButton, PremiumBadge, PremiumProgress, StatusBadge } from '../primitives'
import { useASNEStore } from '@/lib/hisab/asne-store'
import { useMarketStore } from '@/lib/hisab/market-store'
import { formatNumber } from '@/lib/hisab/risk-manager'
import {
  CHANNEL_LABELS, CATEGORY_LABELS, PRIORITY_CONFIG, TIER_CONFIG,
} from '@/lib/types/asne'
import type {
  ASBENotification, NotificationChannel, AlertCategory, SubscriptionTier,
  PriorityLevel, PriceLevelSubscription,
} from '@/lib/types/asne'
import { cn } from '@/lib/utils'

const CHANNEL_ICONS: Record<NotificationChannel, React.ComponentType<{ className?: string }>> = {
  BROWSER_PUSH: Monitor,
  MOBILE_PUSH: Smartphone,
  EMAIL: Mail,
  SMS: MessageSquare,
  TELEGRAM: Send,
  WHATSAPP: MessageSquare,
  DISCORD: Globe,
  IN_APP: Bell,
}

const CATEGORY_ICONS: Record<AlertCategory, React.ComponentType<{ className?: string }>> = {
  TRADE_SETUP: TrendingUp,
  PRICE_LEVEL: Target,
  MARKET_STRUCTURE: Activity,
  SMART_MONEY: Waves,
  SESSION: Clock,
  ECONOMIC_NEWS: Newspaper,
  VOLATILITY: Zap,
  RISK: Shield,
}

type Tab = 'feed' | 'channels' | 'alerts' | 'levels' | 'settings'

export function ASNEEngine({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const [tab, setTab] = React.useState<Tab>('feed')
  const notifications = useASNEStore(s => s.notifications)
  // Compute stats from notifications array (avoids getStats() infinite loop)
  const stats = React.useMemo(() => {
    const now = Date.now()
    const last24h = notifications.filter(n => now - n.timestamp < 24 * 60 * 60 * 1000).length
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      critical: notifications.filter(n => n.priority === 'CRITICAL').length,
      high: notifications.filter(n => n.priority === 'HIGH').length,
      medium: notifications.filter(n => n.priority === 'MEDIUM').length,
      low: notifications.filter(n => n.priority === 'LOW').length,
      last24h,
    }
  }, [notifications])

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'feed', label: 'Live Feed', icon: BellRing, badge: stats.unread },
    { id: 'channels', label: 'Channels', icon: Send },
    { id: 'alerts', label: 'Alert Types', icon: Filter },
    { id: 'levels', label: 'Price Levels', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatBox label="Total Alerts" value={stats.total} icon={<Bell className="w-4 h-4" />} color="text-[oklch(0.92_0.13_85)]" />
        <StatBox label="Unread" value={stats.unread} icon={<BellRing className="w-4 h-4" />} color="text-[oklch(0.85_0.15_25)]" />
        <StatBox label="Critical" value={stats.critical} icon={<AlertTriangle className="w-4 h-4" />} color="text-[oklch(0.85_0.15_25)]" />
        <StatBox label="High Priority" value={stats.high} icon={<Zap className="w-4 h-4" />} color="text-[oklch(0.92_0.13_85)]" />
        <StatBox label="Last 24h" value={stats.last24h} icon={<Clock className="w-4 h-4" />} color="text-[oklch(0.85_0.13_220)]" />
      </div>

      {/* Tab bar */}
      <LiquidGlassCard className="p-2">
        <div className="flex flex-wrap gap-1">
          {tabs.map(t => {
            const Icon = t.icon
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/[5%]',
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[oklch(0.66_0.24_25)] text-white">
                    {t.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div layoutId="asne-tab-active" className="absolute inset-0 rounded-lg bg-gradient-to-r from-[oklch(0.82_0.15_85/15%)] to-transparent border border-[oklch(0.82_0.15_85/20%)] -z-10" />
                )}
              </button>
            )
          })}
        </div>
      </LiquidGlassCard>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'feed' && <FeedTab onNavigate={onNavigate} />}
          {tab === 'channels' && <ChannelsTab />}
          {tab === 'alerts' && <AlertsTab />}
          {tab === 'levels' && <LevelsTab />}
          {tab === 'settings' && <SettingsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function StatBox({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <LiquidGlassCard className="p-4" hover>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <div className={cn('text-2xl font-mono font-bold', color)}>{value}</div>
    </LiquidGlassCard>
  )
}

// ============================================================
// FEED TAB — Live notification feed
// ============================================================

function FeedTab({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const notifications = useASNEStore(s => s.notifications)
  const markRead = useASNEStore(s => s.markRead)
  const markAllRead = useASNEStore(s => s.markAllRead)
  const dismiss = useASNEStore(s => s.dismiss)
  const clearAll = useASNEStore(s => s.clearAll)
  const [filter, setFilter] = React.useState<PriorityLevel | 'ALL'>('ALL')

  const filtered = filter === 'ALL' ? notifications : notifications.filter(n => n.priority === filter)

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <LiquidGlassCard className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(p => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-all',
                  filter === p
                    ? 'text-foreground border-current'
                    : 'text-muted-foreground border-border/30 hover:border-border/60',
                )}
                style={filter === p && p !== 'ALL' ? { color: PRIORITY_CONFIG[p].color, borderColor: `${PRIORITY_CONFIG[p].color}60` } : {}}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <GlowButton variant="ghost" size="sm" onClick={markAllRead}>
              <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
            </GlowButton>
            <GlowButton variant="ghost" size="sm" onClick={clearAll}>
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </GlowButton>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Feed */}
      {filtered.length === 0 ? (
        <LiquidGlassCard className="p-12 text-center">
          <BellOff className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No notifications yet. ASNE is monitoring the market 24/7.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">You'll be notified when meaningful events occur.</p>
        </LiquidGlassCard>
      ) : (
        <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
          <AnimatePresence>
            {filtered.map((notif, i) => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                onRead={() => markRead(notif.id)}
                onDismiss={() => dismiss(notif.id)}
                onNavigate={onNavigate}
                delay={i * 0.03}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function NotificationCard({ notif, onRead, onDismiss, onNavigate, delay }: {
  notif: ASBENotification
  onRead: () => void
  onDismiss: () => void
  onNavigate?: (s: string) => void
  delay: number
}) {
  const Icon = CATEGORY_ICONS[notif.type]
  const priorityCfg = PRIORITY_CONFIG[notif.priority]
  const isTradeSetup = notif.type === 'TRADE_SETUP'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay }}
      onClick={onRead}
      className={cn(
        'group relative rounded-xl border p-4 cursor-pointer transition-all hover:border-white/[15%]',
        !notif.read && 'border-l-2',
      )}
      style={{
        borderLeftColor: !notif.read ? priorityCfg.color : undefined,
      }}
    >
      <div className="liquid-glass rounded-xl absolute inset-0" />
      <div className="relative">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${priorityCfg.color}20`, border: `1px solid ${priorityCfg.color}40` }}
          >
            <Icon className="w-4 h-4" style={{ color: priorityCfg.color }} />
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge variant={notif.priority === 'CRITICAL' ? 'danger' : notif.priority === 'HIGH' ? 'gold' : notif.priority === 'MEDIUM' ? 'info' : 'neutral'}>
                  {notif.priority}
                </StatusBadge>
                <span className="text-sm font-semibold">{notif.title}</span>
                {!notif.read && <span className="w-2 h-2 rounded-full bg-[oklch(0.82_0.15_85)] animate-pulse" />}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDismiss() }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed mb-2">{notif.summary}</p>
            {notif.reason && (
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{notif.reason}</p>
            )}
            {/* Trade setup details */}
            {isTradeSetup && notif.entryZone && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 p-2 rounded-lg bg-white/[4%]">
                <Detail label="Entry" value={`$${formatNumber(notif.entryZone.low, 2)}-$${formatNumber(notif.entryZone.high, 2)}`} />
                <Detail label="SL" value={`$${formatNumber(notif.stopLoss ?? 0, 2)}`} color="text-[oklch(0.85_0.15_25)]" />
                <Detail label="TP1-3" value={`$${formatNumber(notif.takeProfit1 ?? 0, 0)} / $${formatNumber(notif.takeProfit3 ?? 0, 0)}`} color="text-[oklch(0.85_0.15_145)]" />
                <Detail label="R:R" value={`1:${formatNumber(notif.riskReward ?? 0, 1)}`} color="text-[oklch(0.92_0.13_85)]" />
              </div>
            )}
            {notif.confidence && (
              <div className="mt-2">
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-mono">{notif.confidence}%</span>
                </div>
                <PremiumProgress value={notif.confidence} color={notif.confidence >= 90 ? 'gold' : notif.confidence >= 75 ? 'bull' : 'neutral'} height={4} />
              </div>
            )}
            {/* Footer */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[6%]">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                <span>{notif.asset}</span>
                {notif.timeframe && <span>· {notif.timeframe}</span>}
                <span>· {new Date(notif.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {notif.actionLabel && notif.actionSection && onNavigate && (
                <button
                  onClick={(e) => { e.stopPropagation(); onNavigate(notif.actionSection!) }}
                  className="text-[11px] font-medium text-[oklch(0.92_0.13_85)] hover:underline flex items-center gap-0.5"
                >
                  {notif.actionLabel} <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
            {/* Recommendation for news */}
            {notif.actionLabel && !notif.actionSection && (
              <p className="text-[11px] text-[oklch(0.92_0.13_85)] mt-1 italic">{notif.actionLabel}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Detail({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase text-muted-foreground">{label}</div>
      <div className={cn('text-[11px] font-mono font-semibold', color)}>{value}</div>
    </div>
  )
}

// ============================================================
// CHANNELS TAB
// ============================================================

function ChannelsTab() {
  const channels = useASNEStore(s => s.channels)
  const toggleChannel = useASNEStore(s => s.toggleChannel)
  const tier = useASNEStore(s => s.settings.tier)
  const tierConfig = TIER_CONFIG[tier]
  const enabledCount = channels.filter(c => c.enabled).length

  return (
    <div className="space-y-4">
      <LiquidGlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Delivery Channels</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Subscribe to one or multiple channels. {tierConfig.label} tier: {enabledCount}/{tierConfig.maxChannels} active.</p>
          </div>
          <PremiumBadge variant="gold">{enabledCount} Active</PremiumBadge>
        </div>
        {enabledCount >= tierConfig.maxChannels && (
          <p className="text-[11px] text-[oklch(0.85_0.15_25)] mt-2">⚠️ Channel limit reached for {tierConfig.label} tier. Upgrade to add more.</p>
        )}
      </LiquidGlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {channels.map(ch => {
          const Icon = CHANNEL_ICONS[ch.channel]
          const isLocked = !ch.enabled && enabledCount >= tierConfig.maxChannels
          return (
            <LiquidGlassCard key={ch.channel} className={cn('p-4 transition-all', ch.enabled && 'border-[oklch(0.82_0.15_85/25%)]')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    ch.enabled ? 'bg-[oklch(0.82_0.15_85/12%)] border border-[oklch(0.82_0.15_85/25%)]' : 'bg-white/[4%] border border-white/[8%]',
                  )}>
                    <Icon className={cn('w-5 h-5', ch.enabled ? 'text-[oklch(0.92_0.13_85)]' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{CHANNEL_LABELS[ch.channel]}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {ch.enabled ? 'Active' : isLocked ? 'Locked — upgrade tier' : 'Disabled'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleChannel(ch.channel)}
                  disabled={isLocked}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-all',
                    ch.enabled ? 'bg-[oklch(0.82_0.15_85/30%)]' : 'bg-white/10',
                    isLocked && 'opacity-40 cursor-not-allowed',
                  )}
                  aria-label={`Toggle ${CHANNEL_LABELS[ch.channel]}`}
                >
                  <motion.div
                    animate={{ x: ch.enabled ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={cn(
                      'absolute top-0.5 w-5 h-5 rounded-full',
                      ch.enabled ? 'bg-[oklch(0.95_0.10_85)] shadow-[0_0_8px_oklch(0.82_0.15_85/50%)]' : 'bg-muted-foreground',
                    )}
                  />
                </button>
              </div>
            </LiquidGlassCard>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// ALERTS TAB — Category toggles
// ============================================================

function AlertsTab() {
  const alertSubs = useASNEStore(s => s.alertSubs)
  const toggleAlert = useASNEStore(s => s.toggleAlert)
  const tier = useASNEStore(s => s.settings.tier)
  const tierConfig = TIER_CONFIG[tier]

  return (
    <div className="space-y-3">
      <LiquidGlassCard className="p-4">
        <h3 className="text-sm font-semibold">Alert Categories</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Toggle which types of alerts you receive. {tierConfig.label} tier unlocks {tierConfig.categories.length} categories.</p>
      </LiquidGlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alertSubs.map(sub => {
          const Icon = CATEGORY_ICONS[sub.category]
          const isAllowed = tierConfig.categories.includes(sub.category)
          const label = CATEGORY_LABELS[sub.category]
          return (
            <LiquidGlassCard key={sub.category} className={cn('p-4 transition-all', sub.enabled && isAllowed && 'border-[oklch(0.82_0.15_85/20%)]')}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                    sub.enabled && isAllowed ? 'bg-[oklch(0.82_0.15_85/12%)] border border-[oklch(0.82_0.15_85/25%)]' : 'bg-white/[4%]',
                  )}>
                    <Icon className={cn('w-4 h-4', sub.enabled && isAllowed ? 'text-[oklch(0.92_0.13_85)]' : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{label}</span>
                      {!isAllowed && <PremiumBadge variant="neutral" size="xs">LOCKED</PremiumBadge>}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Min: {sub.minPriority} · Cooldown: {sub.cooldownMinutes}m
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => isAllowed && toggleAlert(sub.category)}
                  disabled={!isAllowed}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-all shrink-0',
                    sub.enabled && isAllowed ? 'bg-[oklch(0.82_0.15_85/30%)]' : 'bg-white/10',
                    !isAllowed && 'opacity-40 cursor-not-allowed',
                  )}
                  aria-label={`Toggle ${label}`}
                >
                  <motion.div
                    animate={{ x: sub.enabled && isAllowed ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={cn(
                      'absolute top-0.5 w-5 h-5 rounded-full',
                      sub.enabled && isAllowed ? 'bg-[oklch(0.95_0.10_85)]' : 'bg-muted-foreground',
                    )}
                  />
                </button>
              </div>
            </LiquidGlassCard>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// LEVELS TAB — Price level subscriptions
// ============================================================

function LevelsTab() {
  const priceLevels = useASNEStore(s => s.priceLevels)
  const addPriceLevel = useASNEStore(s => s.addPriceLevel)
  const removePriceLevel = useASNEStore(s => s.removePriceLevel)
  const tier = useASNEStore(s => s.settings.tier)
  const tierConfig = TIER_CONFIG[tier]
  const price = useMarketStore(s => s.price)
  const [newPrice, setNewPrice] = React.useState('')
  const [newLabel, setNewLabel] = React.useState('')
  const [newType, setNewType] = React.useState<PriceLevelSubscription['type']>('KEY_LEVEL')

  const handleAdd = () => {
    const p = parseFloat(newPrice)
    if (!p || !newLabel.trim()) return
    addPriceLevel(p, newLabel, newType)
    setNewPrice('')
    setNewLabel('')
  }

  const typeOptions: { value: PriceLevelSubscription['type']; label: string }[] = [
    { value: 'KEY_LEVEL', label: 'Key Level' },
    { value: 'SUPPORT', label: 'Support' },
    { value: 'RESISTANCE', label: 'Resistance' },
    { value: 'DAILY_HIGH', label: 'Daily High' },
    { value: 'DAILY_LOW', label: 'Daily Low' },
    { value: 'PDH', label: 'Prev Day High' },
    { value: 'PDL', label: 'Prev Day Low' },
    { value: 'ASIAN_HIGH', label: 'Asian High' },
    { value: 'ASIAN_LOW', label: 'Asian Low' },
    { value: 'LONDON_HIGH', label: 'London High' },
    { value: 'LONDON_LOW', label: 'London Low' },
    { value: 'NY_HIGH', label: 'NY High' },
    { value: 'NY_LOW', label: 'NY Low' },
  ]

  return (
    <div className="space-y-4">
      <LiquidGlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Price Level Alerts</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{priceLevels.length}/{tierConfig.maxPriceLevels} levels · {tierConfig.label} tier</p>
          </div>
          {price && <PremiumBadge variant="info">Live: ${formatNumber(price.last, 2)}</PremiumBadge>}
        </div>
        {/* Add new level */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            type="number"
            placeholder="Price"
            value={newPrice}
            onChange={e => setNewPrice(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/[4%] border border-white/[8%] text-sm font-mono focus:outline-none focus:border-[oklch(0.82_0.15_85/40%)]"
          />
          <input
            type="text"
            placeholder="Label"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/[4%] border border-white/[8%] text-sm focus:outline-none focus:border-[oklch(0.82_0.15_85/40%)]"
          />
          <select
            value={newType}
            onChange={e => setNewType(e.target.value as PriceLevelSubscription['type'])}
            className="px-3 py-2 rounded-lg bg-white/[4%] border border-white/[8%] text-sm focus:outline-none focus:border-[oklch(0.82_0.15_85/40%)]"
          >
            {typeOptions.map(o => <option key={o.value} value={o.value} className="bg-[oklch(0.14_0.022_265)]">{o.label}</option>)}
          </select>
          <GlowButton variant="gold" size="md" onClick={handleAdd} disabled={priceLevels.length >= tierConfig.maxPriceLevels}>
            <Plus className="w-3.5 h-3.5" /> Add Level
          </GlowButton>
        </div>
      </LiquidGlassCard>

      {/* Existing levels */}
      {priceLevels.length === 0 ? (
        <LiquidGlassCard className="p-8 text-center">
          <Target className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">No price levels subscribed. Add one above to get notified when price reaches it.</p>
        </LiquidGlassCard>
      ) : (
        <div className="space-y-2">
          {priceLevels.map(level => {
            const distance = price ? Math.abs(price.last - level.price) : 0
            const distancePct = price ? (distance / price.last) * 100 : 0
            return (
              <LiquidGlassCard key={level.id} className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[oklch(0.82_0.15_85/12%)] flex items-center justify-center">
                  <Target className="w-4 h-4 text-[oklch(0.92_0.13_85)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{level.label}</span>
                    <StatusBadge variant="info">{level.type.replace('_', ' ')}</StatusBadge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    ${formatNumber(level.price, 2)}
                    {price && <span className="ml-2">· {distancePct.toFixed(2)}% away</span>}
                  </div>
                </div>
                <button
                  onClick={() => removePriceLevel(level.id)}
                  className="p-2 rounded-lg hover:bg-[oklch(0.66_0.24_25/10%)] text-muted-foreground hover:text-[oklch(0.85_0.15_25)]"
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </LiquidGlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}

type PriceLevelSubscriptionType = PriceLevelSubscription['type']

// ============================================================
// SETTINGS TAB
// ============================================================

function SettingsTab() {
  const settings = useASNEStore(s => s.settings)
  const setTier = useASNEStore(s => s.setTier)
  const setConfidenceThreshold = useASNEStore(s => s.setConfidenceThreshold)
  const setAssetFilter = useASNEStore(s => s.setAssetFilter)
  const setSignalFilter = useASNEStore(s => s.setSignalFilter)

  const tiers: SubscriptionTier[] = ['FREE', 'PRO', 'PREMIUM', 'VIP', 'INSTITUTIONAL']

  return (
    <div className="space-y-4">
      {/* Subscription tier */}
      <LiquidGlassCard className="p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Crown className="w-4 h-4 text-[oklch(0.92_0.13_85)]" /> Subscription Tier
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {tiers.map(t => {
            const cfg = TIER_CONFIG[t]
            const isActive = settings.tier === t
            return (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all',
                  isActive ? 'border-[oklch(0.82_0.15_85/40%)] bg-[oklch(0.82_0.15_85/8%)]' : 'border-white/[8%] bg-white/[3%] hover:border-white/[15%]',
                )}
              >
                <div className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.label}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{cfg.maxChannels} ch · {cfg.maxPriceLevels} levels</div>
                <div className="text-[10px] text-muted-foreground">{cfg.categories.length} categories</div>
              </button>
            )
          })}
        </div>
      </LiquidGlassCard>

      {/* Confidence threshold */}
      <LiquidGlassCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Award className="w-4 h-4 text-[oklch(0.92_0.13_85)]" /> AI Confidence Threshold
          </h3>
          <span className="text-lg font-mono font-bold text-[oklch(0.92_0.13_85)]">{settings.confidenceThreshold}%</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Only receive trade notifications when confidence exceeds this threshold. Higher = fewer but more reliable alerts.</p>
        <input
          type="range"
          min="50"
          max="95"
          step="5"
          value={settings.confidenceThreshold}
          onChange={e => setConfidenceThreshold(parseInt(e.target.value))}
          className="w-full accent-[oklch(0.82_0.15_85)]"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
          <span>50% (more alerts)</span>
          <span>95% (elite only)</span>
        </div>
      </LiquidGlassCard>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <LiquidGlassCard className="p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[oklch(0.78_0.18_220)]" /> Asset Filter
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(['ALL', 'GOLD', 'XAUUSD', 'FOREX', 'EURUSD', 'GBPUSD', 'CRYPTO'] as const).map(f => (
              <button
                key={f}
                onClick={() => setAssetFilter(f)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-all',
                  settings.assetFilter === f
                    ? 'bg-[oklch(0.78_0.18_220/15%)] text-[oklch(0.85_0.13_220)] border-[oklch(0.78_0.18_220/30%)]'
                    : 'border-border/30 text-muted-foreground hover:text-foreground',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard className="p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[oklch(0.78_0.19_152)]" /> Signal Filter
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(['ALL', 'BUY_ONLY', 'SELL_ONLY', 'NEWS_ONLY', 'SESSIONS_ONLY', 'HIGH_CONFIDENCE_ONLY'] as const).map(f => (
              <button
                key={f}
                onClick={() => setSignalFilter(f)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-all',
                  settings.signalFilter === f
                    ? 'bg-[oklch(0.78_0.19_152/15%)] text-[oklch(0.85_0.15_145)] border-[oklch(0.78_0.19_152/30%)]'
                    : 'border-border/30 text-muted-foreground hover:text-foreground',
                )}
              >
                {f.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </LiquidGlassCard>
      </div>

      {/* Anti-spam info */}
      <LiquidGlassCard variant="gold" className="p-5">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[oklch(0.92_0.13_85)]" /> Anti-Spam Protection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[oklch(0.78_0.19_152)]" /> No duplicate notifications</div>
          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[oklch(0.78_0.19_152)]" /> Intelligent cooldown periods</div>
          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[oklch(0.78_0.19_152)]" /> Similar events merged</div>
          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[oklch(0.78_0.19_152)]" /> Quality over quantity</div>
        </div>
        <p className="text-[11px] text-muted-foreground/70 mt-3 italic">
          ASNE never spams. The objective is fewer—but significantly more valuable—notifications.
        </p>
      </LiquidGlassCard>
    </div>
  )
}
