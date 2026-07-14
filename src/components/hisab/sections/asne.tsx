'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, BellRing, Settings, Trash2, Check, X, Plus, Filter,
  TrendingUp, TrendingDown, Activity, Waves, Newspaper, Clock,
  AlertTriangle, Zap, Crown, Brain, Cpu, Send, Shield,
  Globe, DollarSign, Flame, Eye, Target, ChevronRight, Sparkles,
  Gauge, BarChart3, Radio, FileText, ArrowUpRight,
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
  PriorityLevel,
} from '@/lib/types/asne'
import { cn } from '@/lib/utils'

type Tab = 'feed' | 'dashboard' | 'rules' | 'news' | 'channels'

export function ASNEEngine({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const [tab, setTab] = React.useState<Tab>('dashboard')

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Intelligence Dashboard', icon: Gauge },
    { id: 'feed', label: 'AI Feed', icon: BellRing },
    { id: 'rules', label: 'Custom Rules', icon: Filter },
    { id: 'news', label: 'News Intelligence', icon: Newspaper },
    { id: 'channels', label: 'Delivery', icon: Send },
  ]

  return (
    <div className="space-y-5">
      {/* Header banner */}
      <LiquidGlassCard variant="gold" glow className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}>
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold">AI Market Intelligence Center™</h3>
                <p className="text-xs text-muted-foreground">Your personal institutional market analyst, working 24/7.</p>
              </div>
            </div>
          </div>
          <PremiumBadge variant="bull" size="sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" /> ACTIVE
          </PremiumBadge>
        </div>
      </LiquidGlassCard>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map(t => {
          const Icon = t.icon
          const isActive = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all',
                isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground/80',
              )}
              style={isActive ? {
                background: 'linear-gradient(135deg, rgba(0,122,255,0.15), rgba(175,82,222,0.1))',
                border: '1px solid rgba(0,122,255,0.25)',
              } : {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#FF3B30] text-white">{t.badge}</span>
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'dashboard' && <IntelligenceDashboard onNavigate={onNavigate} />}
          {tab === 'feed' && <IntelligenceFeed onNavigate={onNavigate} />}
          {tab === 'rules' && <CustomRules />}
          {tab === 'news' && <NewsIntelligence />}
          {tab === 'channels' && <DeliveryChannels />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ============================================
   INTELLIGENCE DASHBOARD — Premium widgets
   ============================================ */

function IntelligenceDashboard({ onNavigate }: { onNavigate?: (s: string) => void }) {
  return (
    <div className="space-y-4">
      {/* Row 1: Market Pulse + Fear & Greed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <MarketPulseWidget />
        <FearGreedWidget />
        <CurrencyStrengthWidget />
        <AIConfidenceMeter />
      </div>

      {/* Row 2: Gold Strength + Institutional Liquidity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <GoldStrengthWidget />
        <InstitutionalLiquidityWidget />
      </div>

      {/* Row 3: Economic Calendar + Volatility Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <EconomicCalendarWidget />
        <VolatilityMonitorWidget />
      </div>

      {/* Row 4: Trending Assets + Daily Briefing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TrendingAssetsWidget />
        <DailyBriefingWidget onNavigate={onNavigate} />
      </div>
    </div>
  )
}

function WidgetCard({ title, icon, action, children, className }: {
  title: string
  icon: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <LiquidGlassCard className={cn('p-4', className)} hover>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,122,255,0.1)', border: '1px solid rgba(0,122,255,0.15)' }}>
            {icon}
          </div>
          <span className="text-xs font-semibold tracking-tight">{title}</span>
        </div>
        {action}
      </div>
      {children}
    </LiquidGlassCard>
  )
}

function MarketPulseWidget() {
  const [riskLevel, setRiskLevel] = React.useState('Moderate')
  const [sentiment, setSentiment] = React.useState('Risk-On')
  const [activeAsset, setActiveAsset] = React.useState('Gold')
  const [topConfidence, setTopConfidence] = React.useState('EUR/USD Buy Setup')

  React.useEffect(() => {
    const interval = setInterval(() => {
      const risks = ['Low', 'Moderate', 'Elevated', 'High']
      const sentiments = ['Risk-On', 'Risk-Off', 'Neutral', 'Risk-On']
      const assets = ['Gold', 'EUR/USD', 'BTC', 'NASDAQ']
      const setups = ['EUR/USD Buy Setup', 'XAUUSD Sell Setup', 'GBP/USD Buy Setup', 'BTC Breakout']
      setRiskLevel(risks[Math.floor(Math.random() * risks.length)])
      setSentiment(sentiments[Math.floor(Math.random() * sentiments.length)])
      setActiveAsset(assets[Math.floor(Math.random() * assets.length)])
      setTopConfidence(setups[Math.floor(Math.random() * setups.length)])
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const riskColor = riskLevel === 'High' ? '#FF3B30' : riskLevel === 'Elevated' ? '#FF9500' : riskLevel === 'Moderate' ? '#FFD60A' : '#34C759'

  return (
    <WidgetCard title="Global Market Pulse" icon={<Globe className="w-3.5 h-3.5 text-[#007AFF]" />}>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Risk Level</span>
          <span className="font-mono font-semibold" style={{ color: riskColor }}>{riskLevel}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Sentiment</span>
          <span className="font-mono font-medium" style={{ color: sentiment === 'Risk-On' ? '#34C759' : sentiment === 'Risk-Off' ? '#FF3B30' : '#FFD60A' }}>{sentiment}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Most Active</span>
          <span className="font-mono font-medium text-foreground">{activeAsset}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Top AI Confidence</span>
          <span className="font-mono font-medium text-[#007AFF] truncate ml-2 max-w-[120px]">{topConfidence}</span>
        </div>
      </div>
    </WidgetCard>
  )
}

function FearGreedWidget() {
  const [value, setValue] = React.useState(62)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue(v => Math.max(10, Math.min(90, v + Math.floor(Math.random() * 11) - 5)))
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const label = value >= 75 ? 'Extreme Greed' : value >= 55 ? 'Greed' : value >= 45 ? 'Neutral' : value >= 25 ? 'Fear' : 'Extreme Fear'
  const color = value >= 75 ? '#34C759' : value >= 55 ? '#34C759' : value >= 45 ? '#FFD60A' : value >= 25 ? '#FF9500' : '#FF3B30'

  return (
    <WidgetCard title="Fear & Greed Index" icon={<Flame className="w-3.5 h-3.5 text-[#FF9500]" />}>
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <motion.circle
              cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
              strokeDasharray="163"
              animate={{ strokeDashoffset: 163 - (value / 100) * 163 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-mono font-bold" style={{ color }}>{value}</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color }}>{label}</div>
          <div className="text-[10px] text-muted-foreground/70 mt-0.5">Market emotion index</div>
        </div>
      </div>
    </WidgetCard>
  )
}

function CurrencyStrengthWidget() {
  const currencies = [
    { name: 'USD', strength: 72, trend: 'up' },
    { name: 'EUR', strength: 58, trend: 'down' },
    { name: 'GBP', strength: 65, trend: 'up' },
    { name: 'JPY', strength: 41, trend: 'down' },
    { name: 'XAU', strength: 87, trend: 'up' },
    { name: 'BTC', strength: 53, trend: 'neutral' },
  ]

  return (
    <WidgetCard title="Currency Strength Meter" icon={<DollarSign className="w-3.5 h-3.5 text-[#34C759]" />}>
      <div className="space-y-1.5">
        {currencies.map(c => (
          <div key={c.name} className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold w-8 text-muted-foreground">{c.name}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${c.strength}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="h-full rounded-full"
                style={{ background: c.strength > 70 ? '#34C759' : c.strength > 50 ? '#FFD60A' : c.strength > 30 ? '#FF9500' : '#FF3B30' }}
              />
            </div>
            <span className="text-[9px] font-mono w-6 text-right" style={{ color: c.strength > 70 ? '#34C759' : c.strength > 50 ? '#FFD60A' : '#FF9500' }}>{c.strength}</span>
            {c.trend === 'up' && <TrendingUp className="w-2.5 h-2.5 text-[#34C759]" />}
            {c.trend === 'down' && <TrendingDown className="w-2.5 h-2.5 text-[#FF3B30]" />}
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

function AIConfidenceMeter() {
  const [confidence, setConfidence] = React.useState(0)
  const targetRef = React.useRef(89)

  React.useEffect(() => {
    const interval = setInterval(() => {
      targetRef.current = Math.floor(Math.random() * 30) + 65
      setConfidence(0)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    if (confidence < targetRef.current) {
      const t = setTimeout(() => setConfidence(c => Math.min(targetRef.current, c + 3)), 30)
      return () => clearTimeout(t)
    }
  }, [confidence])

  return (
    <WidgetCard title="AI Confidence Meter" icon={<Cpu className="w-3.5 h-3.5 text-[#AF52DE]" />}>
      <div className="text-center py-1">
        <div className="text-3xl font-mono font-bold" style={{ color: confidence > 80 ? '#34C759' : confidence > 60 ? '#FFD60A' : '#FF9500' }}>
          {confidence}%
        </div>
        <div className="text-[10px] text-muted-foreground/70 mt-1">Current market conviction</div>
        <div className="mt-2">
          <PremiumProgress value={confidence} color={confidence > 80 ? 'bull' : 'gold'} height={5} />
        </div>
        <div className="text-[9px] text-[#007AFF] mt-1.5 font-medium">Multi-AI Engine Active</div>
      </div>
    </WidgetCard>
  )
}

function GoldStrengthWidget() {
  const price = useMarketStore(s => s.price)
  const score = 87
  return (
    <WidgetCard title="Gold Strength Index" icon={<Crown className="w-3.5 h-3.5 text-[#FFD60A]" />}>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <motion.circle
              cx="40" cy="40" r="32" fill="none" stroke="#FFD60A" strokeWidth="6" strokeLinecap="round"
              strokeDasharray="201"
              initial={{ strokeDashoffset: 201 }}
              animate={{ strokeDashoffset: 201 - (score / 100) * 201 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 6px rgba(255,214,10,0.4))' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-mono font-bold text-[#FFD60A]">{score}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground mb-1">XAUUSD Strength</div>
          <div className="text-sm font-semibold text-[#34C759] mb-1.5">Institutional Accumulation</div>
          {price && <div className="text-lg font-mono font-bold">${formatNumber(price.last, 2)}</div>}
          <p className="text-[10px] text-muted-foreground/70 mt-1">DXY weakening, yields stabilizing</p>
        </div>
      </div>
    </WidgetCard>
  )
}

function InstitutionalLiquidityWidget() {
  return (
    <WidgetCard title="Institutional Liquidity Tracker" icon={<Radio className="w-3.5 h-3.5 text-[#007AFF]" />}>
      <div className="space-y-2">
        <LiquidityRow label="Smart Money Activity" value="ACCUMULATING" color="#34C759" pct={78} />
        <LiquidityRow label="Liquidity Zones" value="3 ACTIVE" color="#FFD60A" pct={65} />
        <LiquidityRow label="Institutional Flow" value="BULLISH" color="#34C759" pct={71} />
        <LiquidityRow label="Market Sentiment" value="RISK-ON" color="#34C759" pct={58} />
      </div>
    </WidgetCard>
  )
}

function LiquidityRow({ label, value, color, pct }: { label: string; value: string; color: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium" style={{ color }}>{value}</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 100, damping: 15 }} className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  )
}

function EconomicCalendarWidget() {
  const [seconds, setSeconds] = React.useState(18 * 60)
  React.useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 600), 1000)
    return () => clearInterval(interval)
  }, [])
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <WidgetCard title="Economic Calendar Intelligence" icon={<AlertTriangle className="w-3.5 h-3.5 text-[#FF3B30]" />} action={<PremiumBadge variant="danger" size="xs">HIGH IMPACT</PremiumBadge>}>
      <div className="space-y-2.5">
        <div>
          <div className="text-xs text-muted-foreground mb-1">US CPI Release</div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#FF9500]" />
            <span className="text-2xl font-mono font-bold tabular text-[#FF9500]">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
          </div>
        </div>
        <div className="p-2 rounded-md" style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.15)' }}>
          <div className="text-[9px] uppercase tracking-wider text-[#FF3B30] mb-0.5">AI Assessment</div>
          <p className="text-[11px] text-foreground/70">Elevated volatility likely across USD pairs and Gold. Reduce exposure.</p>
        </div>
      </div>
    </WidgetCard>
  )
}

function VolatilityMonitorWidget() {
  const [atr, setAtr] = React.useState(12.5)
  React.useEffect(() => {
    const interval = setInterval(() => setAtr(a => Math.max(5, a + (Math.random() - 0.5) * 2)), 5000)
    return () => clearInterval(interval)
  }, [])
  const level = atr > 15 ? 'High' : atr > 10 ? 'Moderate' : 'Low'
  const color = atr > 15 ? '#FF3B30' : atr > 10 ? '#FF9500' : '#34C759'

  return (
    <WidgetCard title="Volatility Monitor" icon={<Activity className="w-3.5 h-3.5 text-[#AF52DE]" />}>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">ATR (14)</span>
          <span className="text-lg font-mono font-bold" style={{ color }}>${atr.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Volatility Level</span>
          <span className="text-sm font-semibold" style={{ color }}>{level}</span>
        </div>
        <PremiumProgress value={Math.min(100, (atr / 20) * 100)} color={atr > 15 ? 'bear' : 'gold'} height={5} />
        <div className="flex justify-between text-[9px] text-foreground/30">
          <span>Low</span><span>Moderate</span><span>High</span>
        </div>
      </div>
    </WidgetCard>
  )
}

function TrendingAssetsWidget() {
  const assets = [
    { name: 'XAUUSD', change: 0.84, vol: 'High' },
    { name: 'EURUSD', change: 0.14, vol: 'Medium' },
    { name: 'BTCUSD', change: -2.93, vol: 'High' },
    { name: 'NASDAQ', change: 0.45, vol: 'Medium' },
    { name: 'DXY', change: 0.15, vol: 'Low' },
    { name: 'GBPUSD', change: -0.06, vol: 'Low' },
  ]

  return (
    <WidgetCard title="Trending Assets" icon={<TrendingUp className="w-3.5 h-3.5 text-[#34C759]" />}>
      <div className="grid grid-cols-2 gap-1.5">
        {assets.map(a => (
          <div key={a.name} className="flex items-center justify-between p-1.5 rounded-md" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div>
              <div className="text-[10px] font-mono font-bold">{a.name}</div>
              <div className="text-[8px] text-foreground/30">{a.vol} vol</div>
            </div>
            <span className="text-[10px] font-mono font-semibold" style={{ color: a.change >= 0 ? '#34C759' : '#FF3B30' }}>
              {a.change >= 0 ? '+' : ''}{a.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}

function DailyBriefingWidget({ onNavigate }: { onNavigate?: (s: string) => void }) {
  return (
    <WidgetCard title="AI Daily Briefing" icon={<Sparkles className="w-3.5 h-3.5 text-[#FFD60A]" />} action={
      <button onClick={() => onNavigate?.('coach')} className="text-[10px] text-[#007AFF] hover:underline">Full Report</button>
    }>
      <div className="space-y-2 text-xs">
        <p className="text-foreground/70 leading-relaxed">
          <span className="font-semibold text-foreground">Good morning.</span> Gold is approaching a significant institutional demand zone. DXY showing weakness.
        </p>
        <div className="flex items-start gap-2 p-2 rounded-md" style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.15)' }}>
          <AlertTriangle className="w-3 h-3 text-[#FF9500] mt-0.5 shrink-0" />
          <span className="text-[11px] text-foreground/70">High-impact USD news in 18 minutes. Consider reducing exposure.</span>
        </div>
        <p className="text-muted-foreground text-[11px] italic">
          No high-probability setups identified today. Remaining patient is the best strategy.
        </p>
      </div>
    </WidgetCard>
  )
}

/* ============================================
   AI INTELLIGENCE FEED
   ============================================ */

function IntelligenceFeed({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const notifications = useASNEStore(s => s.notifications)
  const markRead = useASNEStore(s => s.markRead)
  const markAllRead = useASNEStore(s => s.markAllRead)
  const dismiss = useASNEStore(s => s.dismiss)
  const clearAll = useASNEStore(s => s.clearAll)
  const [filter, setFilter] = React.useState<PriorityLevel | 'ALL'>('ALL')
  const filtered = filter === 'ALL' ? notifications : notifications.filter(n => n.priority === filter)

  // Generate sample intelligence items if feed is empty
  const sampleItems = React.useMemo(() => generateSampleIntelligence(), [])

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
                className={cn('px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-all', filter === p ? 'text-foreground border-current' : 'text-muted-foreground/70 border-border')}
                style={filter === p && p !== 'ALL' ? { color: PRIORITY_CONFIG[p].color, borderColor: `${PRIORITY_CONFIG[p].color}60` } : {}}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <GlowButton variant="ghost" size="sm" onClick={markAllRead}><Check className="w-3.5 h-3.5" /> Read All</GlowButton>
            <GlowButton variant="ghost" size="sm" onClick={clearAll}><Trash2 className="w-3.5 h-3.5" /> Clear</GlowButton>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="space-y-2">
          {/* Sample intelligence cards */}
          {sampleItems.map((item, i) => (
            <IntelligenceCard key={item.id} item={item} onNavigate={onNavigate} delay={i * 0.04} sample />
          ))}
          <p className="text-center text-[10px] text-foreground/30 mt-4 italic">
            AI Market Intelligence Center is monitoring global markets 24/7. Live alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
          <AnimatePresence>
            {filtered.map((notif, i) => (
              <IntelligenceCard key={notif.id} item={notif} onRead={() => markRead(notif.id)} onDismiss={() => dismiss(notif.id)} onNavigate={onNavigate} delay={i * 0.03} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function IntelligenceCard({ item, onRead, onDismiss, onNavigate, delay, sample }: {
  item: ASBENotification
  onRead?: () => void
  onDismiss?: () => void
  onNavigate?: (s: string) => void
  delay: number
  sample?: boolean
}) {
  const priorityCfg = PRIORITY_CONFIG[item.priority]
  const isOpportunity = item.type === 'TRADE_SETUP'
  const isRisk = item.type === 'RISK' || item.type === 'ECONOMIC_NEWS'

  const icon = isOpportunity ? TrendingUp : isRisk ? AlertTriangle : item.type === 'VOLATILITY' ? Zap : item.type === 'SESSION' ? Clock : Brain
  const Icon = icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay }}
      onClick={onRead}
      className="group relative rounded-xl p-4 cursor-pointer transition-all"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid rgba(255,255,255,0.06)`,
        borderLeft: `3px solid ${priorityCfg.color}`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${priorityCfg.color}20`, border: `1px solid ${priorityCfg.color}40` }}>
          <Icon className="w-4 h-4" style={{ color: priorityCfg.color }} />
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isOpportunity && <span className="text-[10px] font-bold text-[#34C759]">🚀 INSTITUTIONAL OPPORTUNITY</span>}
              {isRisk && <span className="text-[10px] font-bold text-[#FF3B30]">⚠️ MARKET RISK</span>}
              {!isOpportunity && !isRisk && <StatusBadge variant={item.priority === 'CRITICAL' ? 'danger' : item.priority === 'HIGH' ? 'gold' : 'info'}>{item.priority}</StatusBadge>}
              <span className="text-sm font-semibold">{item.title}</span>
              {!item.read && !sample && <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />}
            </div>
            {onDismiss && (
              <button onClick={(e) => { e.stopPropagation(); onDismiss() }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10">
                <X className="w-3.5 h-3.5 text-muted-foreground/70" />
              </button>
            )}
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed mb-2">{item.summary}</p>
          {item.reason && <p className="text-[11px] text-muted-foreground/70 leading-relaxed mb-2">{item.reason}</p>}
          {/* Trade setup details */}
          {isOpportunity && item.entryZone && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Detail label="Entry" value={`$${formatNumber(item.entryZone.low, 2)}-$${formatNumber(item.entryZone.high, 2)}`} />
              <Detail label="SL" value={`$${formatNumber(item.stopLoss ?? 0, 2)}`} color="#FF3B30" />
              <Detail label="TP1-3" value={`$${formatNumber(item.takeProfit1 ?? 0, 0)} / $${formatNumber(item.takeProfit3 ?? 0, 0)}`} color="#34C759" />
              <Detail label="R:R" value={`1:${formatNumber(item.riskReward ?? 0, 1)}`} color="#007AFF" />
            </div>
          )}
          {item.confidence && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-muted-foreground/70">AI Confidence</span>
                <span className="font-mono">{item.confidence}%</span>
              </div>
              <PremiumProgress value={item.confidence} color={item.confidence >= 90 ? 'gold' : item.confidence >= 75 ? 'bull' : 'neutral'} height={4} />
            </div>
          )}
          {/* Footer */}
          <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2 text-[10px] text-foreground/30 font-mono">
              <span>{item.asset}</span>
              {item.timeframe && <span>· {item.timeframe}</span>}
              <span>· {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {item.actionLabel && item.actionSection && onNavigate && (
              <button onClick={(e) => { e.stopPropagation(); onNavigate(item.actionSection!) }} className="text-[11px] font-medium text-[#007AFF] hover:underline flex items-center gap-0.5">
                {item.actionLabel} <ChevronRight className="w-3 h-3" />
              </button>
            )}
            {item.actionLabel && !item.actionSection && (
              <p className="text-[11px] text-[#007AFF] italic">{item.actionLabel}</p>
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
      <div className="text-[9px] uppercase text-foreground/30">{label}</div>
      <div className="text-[11px] font-mono font-semibold" style={{ color: color ?? '#FFFFFF' }}>{value}</div>
    </div>
  )
}

/* ============================================
   CUSTOM AI INTELLIGENCE RULES
   ============================================ */

interface IntelligenceRule {
  id: string
  condition: string
  asset: string
  threshold: string
  action: string
  enabled: boolean
  type: 'price' | 'confidence' | 'event' | 'technical'
}

function CustomRules() {
  const [rules, setRules] = React.useState<IntelligenceRule[]>([
    { id: '1', condition: 'Gold trades above', asset: 'XAUUSD', threshold: '3450', action: 'Notify immediately', enabled: true, type: 'price' },
    { id: '2', condition: 'AI confidence exceeds', asset: 'XAUUSD', threshold: '90%', action: 'Send full analysis', enabled: true, type: 'confidence' },
    { id: '3', condition: 'Liquidity sweep detected on', asset: 'XAUUSD', threshold: '15M', action: 'Alert + chart link', enabled: true, type: 'technical' },
    { id: '4', condition: 'Before high-impact', asset: 'USD', threshold: '15 min', action: 'Reduce exposure reminder', enabled: true, type: 'event' },
    { id: '5', condition: 'EUR/USD breaks', asset: 'EURUSD', threshold: 'resistance', action: 'Notify with analysis', enabled: false, type: 'technical' },
  ])

  const [showForm, setShowForm] = React.useState(false)
  const [newCondition, setNewCondition] = React.useState('')
  const [newAsset, setNewAsset] = React.useState('XAUUSD')
  const [newThreshold, setNewThreshold] = React.useState('')

  const addRule = () => {
    if (!newCondition || !newThreshold) return
    setRules(prev => [...prev, {
      id: `rule-${Date.now()}`,
      condition: newCondition,
      asset: newAsset,
      threshold: newThreshold,
      action: 'Notify immediately',
      enabled: true,
      type: 'price',
    }])
    setNewCondition('')
    setNewThreshold('')
    setShowForm(false)
  }

  const toggleRule = (id: string) => setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  const removeRule = (id: string) => setRules(prev => prev.filter(r => r.id !== id))

  const typeColors: Record<string, string> = {
    price: '#FFD60A',
    confidence: '#007AFF',
    event: '#FF3B30',
    technical: '#AF52DE',
  }

  return (
    <div className="space-y-3">
      <LiquidGlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Custom AI Intelligence Rules</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Create advanced rules with multiple conditions, recurring alerts, and combined logic.</p>
          </div>
          <GlowButton variant="gold" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-3.5 h-3.5" /> New Rule
          </GlowButton>
        </div>

        {/* Add new rule form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="p-3 rounded-xl mb-3 space-y-2" style={{ background: 'rgba(0,122,255,0.05)', border: '1px solid rgba(0,122,255,0.15)' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input type="text" placeholder="Condition (e.g., trades above)" value={newCondition} onChange={e => setNewCondition(e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }} />
                  <select value={newAsset} onChange={e => setNewAsset(e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}>
                    {['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD', 'DXY', 'NASDAQ'].map(a => <option key={a} value={a} style={{ background: '#0a0a0c' }}>{a}</option>)}
                  </select>
                  <input type="text" placeholder="Threshold (e.g., 3450)" value={newThreshold} onChange={e => setNewThreshold(e.target.value)} className="px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }} />
                </div>
                <div className="flex gap-2">
                  <GlowButton variant="gold" size="sm" onClick={addRule}><Check className="w-3.5 h-3.5" /> Create Rule</GlowButton>
                  <GlowButton variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</GlowButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rules list */}
        <div className="space-y-2">
          {rules.map(rule => (
            <motion.div key={rule.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${typeColors[rule.type]}15`, border: `1px solid ${typeColors[rule.type]}30` }}>
                <Filter className="w-3.5 h-3.5" style={{ color: typeColors[rule.type] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="text-foreground/70">{rule.condition} </span>
                  <span className="font-mono font-bold text-foreground">{rule.asset} </span>
                  <span className="font-mono text-[#007AFF]">{rule.threshold}</span>
                </div>
                <div className="text-[10px] text-foreground/30">→ {rule.action}</div>
              </div>
              <button onClick={() => toggleRule(rule.id)} className="relative w-10 h-6 rounded-full transition-all shrink-0" style={{ background: rule.enabled ? 'rgba(0,122,255,0.3)' : 'rgba(255,255,255,0.1)' }}>
                <motion.div animate={{ x: rule.enabled ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-0.5 w-5 h-5 rounded-full" style={{ background: rule.enabled ? '#0A84FF' : 'rgba(235,235,245,0.3)' }} />
              </button>
              <button onClick={() => removeRule(rule.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-foreground/30 hover:text-[#FF3B30]"><Trash2 className="w-3.5 h-3.5" /></button>
            </motion.div>
          ))}
        </div>
      </LiquidGlassCard>
    </div>
  )
}

/* ============================================
   AI NEWS INTELLIGENCE
   ============================================ */

function NewsIntelligence() {
  const newsItems = [
    {
      id: '1',
      title: 'Federal Reserve maintains interest rates',
      source: 'Forex Factory',
      time: '2h ago',
      impact: 'HIGH',
      aiSummary: 'The Fed held rates steady, signaling potential cuts in coming quarters. USD likely to weaken, supporting gold.',
      affected: [{ asset: 'USD', direction: 'Bearish', color: '#FF3B30' }, { asset: 'Gold', direction: 'Bullish', color: '#34C759' }, { asset: 'Equities', direction: 'Volatility', color: '#FF9500' }],
      confidence: 88,
      action: 'Consider long gold positions. Monitor DXY for confirmation.',
    },
    {
      id: '2',
      title: 'US CPI comes in below expectations',
      source: 'Trading Economics',
      time: '5h ago',
      impact: 'HIGH',
      aiSummary: 'Cooler inflation data reduces pressure on the Fed to maintain hawkish stance. Risk assets may rally.',
      affected: [{ asset: 'USD', direction: 'Bearish', color: '#FF3B30' }, { asset: 'Gold', direction: 'Bullish', color: '#34C759' }, { asset: 'BTC', direction: 'Bullish', color: '#34C759' }],
      confidence: 92,
      action: 'Risk-on environment. Gold and crypto may benefit.',
    },
    {
      id: '3',
      title: 'ECB signals dovish pivot',
      source: 'Investing.com',
      time: '8h ago',
      impact: 'MEDIUM',
      aiSummary: 'European Central Bank hints at rate cuts. EUR may weaken against USD and gold.',
      affected: [{ asset: 'EUR', direction: 'Bearish', color: '#FF3B30' }, { asset: 'EURUSD', direction: 'Down', color: '#FF3B30' }],
      confidence: 79,
      action: 'Watch for EURUSD short opportunities on rallies.',
    },
    {
      id: '4',
      title: 'Bitcoin breaks key resistance level',
      source: 'Market Intelligence',
      time: '12h ago',
      impact: 'MEDIUM',
      aiSummary: 'BTC broke above $62K with strong volume. Momentum suggests further upside if hold is maintained.',
      affected: [{ asset: 'BTC', direction: 'Bullish', color: '#34C759' }, { asset: 'Crypto', direction: 'Risk-On', color: '#34C759' }],
      confidence: 81,
      action: 'Monitor for follow-through. Watch $65K as next target.',
    },
  ]

  return (
    <div className="space-y-3">
      {newsItems.map((news, i) => (
        <motion.div key={news.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <LiquidGlassCard className="p-4" hover>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <PremiumBadge variant={news.impact === 'HIGH' ? 'danger' : 'gold'} size="xs">{news.impact} IMPACT</PremiumBadge>
                <span className="text-sm font-semibold">{news.title}</span>
              </div>
              <span className="text-[10px] text-foreground/30 font-mono shrink-0">{news.time}</span>
            </div>
            <div className="text-[10px] text-foreground/30 mb-2">Source: {news.source}</div>

            {/* AI Summary */}
            <div className="p-2.5 rounded-lg mb-2" style={{ background: 'rgba(0,122,255,0.06)', border: '1px solid rgba(0,122,255,0.12)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Brain className="w-3 h-3 text-[#007AFF]" />
                <span className="text-[10px] font-semibold text-[#007AFF] uppercase tracking-wider">AI Summary</span>
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed">{news.aiSummary}</p>
            </div>

            {/* Affected Assets */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {news.affected.map(a => (
                <span key={a.asset} className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium" style={{ background: `${a.color}15`, color: a.color, border: `1px solid ${a.color}25` }}>
                  {a.asset}: {a.direction}
                </span>
              ))}
            </div>

            {/* Confidence + Action */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/70">AI Confidence:</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: news.confidence > 85 ? '#34C759' : '#FFD60A' }}>{news.confidence}%</span>
              </div>
              <span className="text-[10px] text-[#007AFF] italic">{news.action}</span>
            </div>
          </LiquidGlassCard>
        </motion.div>
      ))}
    </div>
  )
}

/* ============================================
   DELIVERY CHANNELS
   ============================================ */

function DeliveryChannels() {
  const channels = useASNEStore(s => s.channels)
  const toggleChannel = useASNEStore(s => s.toggleChannel)
  const tier = useASNEStore(s => s.settings.tier)
  const tierConfig = TIER_CONFIG[tier]
  const enabledCount = channels.filter(c => c.enabled).length

  const channelIcons: Record<NotificationChannel, React.ComponentType<{ className?: string }>> = {
    BROWSER_PUSH: Globe,
    MOBILE_PUSH: Zap,
    EMAIL: FileText,
    SMS: Send,
    TELEGRAM: Send,
    WHATSAPP: Send,
    DISCORD: Globe,
    IN_APP: Bell,
  }

  return (
    <div className="space-y-3">
      <LiquidGlassCard className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold">Delivery Channels</h3>
          <PremiumBadge variant="gold" size="sm">{enabledCount}/{tierConfig.maxChannels} Active</PremiumBadge>
        </div>
        <p className="text-xs text-muted-foreground">{tierConfig.label} tier — intelligence delivered across {enabledCount} channels.</p>
      </LiquidGlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {channels.map(ch => {
          const Icon = channelIcons[ch.channel] || Bell
          const isLocked = !ch.enabled && enabledCount >= tierConfig.maxChannels
          return (
            <LiquidGlassCard key={ch.channel} className={cn('p-4 transition-all', ch.enabled && 'border-[#007AFF]/25')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ch.enabled ? 'rgba(0,122,255,0.12)' : 'rgba(255,255,255,0.04)', border: ch.enabled ? '1px solid rgba(0,122,255,0.25)' : '1px solid rgba(255,255,255,0.06)' }}>
                    <Icon className={cn('w-5 h-5', ch.enabled ? 'text-[#0A84FF]' : 'text-foreground/30')} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{CHANNEL_LABELS[ch.channel]}</div>
                    <div className="text-[10px] text-muted-foreground/70">{ch.enabled ? 'Active' : isLocked ? 'Locked — upgrade tier' : 'Disabled'}</div>
                  </div>
                </div>
                <button onClick={() => toggleChannel(ch.channel)} disabled={isLocked} className={cn('relative w-11 h-6 rounded-full transition-all shrink-0', ch.enabled ? 'bg-[#007AFF]/30' : 'bg-white/10', isLocked && 'opacity-40 cursor-not-allowed')} aria-label={`Toggle ${CHANNEL_LABELS[ch.channel]}`}>
                  <motion.div animate={{ x: ch.enabled ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={cn('absolute top-0.5 w-5 h-5 rounded-full', ch.enabled ? 'bg-[#0A84FF] shadow-[0_0_8px_rgba(0,122,255,0.5)]' : 'bg-[#FFFFFF]/30')} />
                </button>
              </div>
            </LiquidGlassCard>
          )
        })}
      </div>

      {/* Anti-spam info */}
      <LiquidGlassCard variant="gold" className="p-4">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-[#FFD60A]" /> Anti-Spam Protection</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34C759]" /> No duplicate notifications</div>
          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34C759]" /> Intelligent cooldown periods</div>
          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34C759]" /> Similar events merged</div>
          <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34C759]" /> Quality over quantity</div>
        </div>
        <p className="text-[11px] text-muted-foreground/70 mt-3 italic">The objective is fewer—but significantly more valuable—intelligence notifications.</p>
      </LiquidGlassCard>
    </div>
  )
}

/* ============================================
   SAMPLE INTELLIGENCE DATA
   ============================================ */

function generateSampleIntelligence(): ASBENotification[] {
  const now = Date.now()
  return [
    {
      id: 'sample-1',
      type: 'TRADE_SETUP',
      priority: 'CRITICAL',
      title: 'Institutional Opportunity Detected',
      summary: 'Institutional buying pressure detected after a liquidity sweep and bullish market structure shift on XAUUSD.',
      asset: 'XAUUSD',
      timeframe: '15M',
      confidence: 96,
      reason: 'Buy-side liquidity swept at $4,038.20, followed by bullish CHoCH and order block reaction at $4,039.00. Multi-timeframe alignment confirms institutional accumulation.',
      currentPrice: 4041.50,
      entryZone: { low: 4038.20, high: 4039.00 },
      stopLoss: 4035.80,
      takeProfit1: 4044.00,
      takeProfit2: 4048.50,
      takeProfit3: 4055.00,
      riskReward: 2.1,
      timestamp: now - 120000,
      read: false,
      dismissed: false,
      channels: ['IN_APP', 'BROWSER_PUSH'],
      actionLabel: 'Review the full AI analysis before making any trading decision.',
      actionSection: 'chart-analysis',
    },
    {
      id: 'sample-2',
      type: 'ECONOMIC_NEWS',
      priority: 'CRITICAL',
      title: 'High-Impact News Imminent',
      summary: 'US CPI releases in 18 minutes. Elevated volatility expected across USD pairs and Gold.',
      asset: 'USD',
      reason: 'CPI is a tier-1 economic event. Historically causes 30-80 pip moves on XAUUSD within 5 minutes of release.',
      timestamp: now - 60000,
      read: false,
      dismissed: false,
      channels: ['IN_APP', 'BROWSER_PUSH'],
      actionLabel: 'Reduce exposure before volatility event. Avoid opening new positions.',
    },
    {
      id: 'sample-3',
      type: 'RISK',
      priority: 'HIGH',
      title: 'Risk Warning: News Overlaps Active Setup',
      summary: 'High-impact CPI news in 18m coincides with London kill zone. Extreme volatility risk on any open XAUUSD positions.',
      asset: 'XAUUSD',
      reason: 'News + kill zone overlap creates unpredictable volatility. Historical data shows 40% of stop-losses get triggered during this combination.',
      timestamp: now - 30000,
      read: false,
      dismissed: false,
      channels: ['IN_APP', 'BROWSER_PUSH'],
      actionLabel: 'Close or hedge open positions immediately.',
    },
    {
      id: 'sample-4',
      type: 'SMART_MONEY',
      priority: 'HIGH',
      title: 'Liquidity Sweep Detected',
      summary: 'Sell-side liquidity at $4,035.80 has been swept. Smart money accumulating longs.',
      asset: 'XAUUSD',
      timeframe: '15M',
      confidence: 89,
      reason: 'Equal lows at $4,035.80 formed a sell-side liquidity pool. Price swept below and reversed — classic institutional accumulation pattern.',
      currentPrice: 4041.50,
      timestamp: now - 180000,
      read: true,
      dismissed: false,
      channels: ['IN_APP'],
      actionLabel: 'View Liquidity Analysis',
      actionSection: 'chart-analysis',
    },
  ]
}
