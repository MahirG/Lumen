'use client'

import * as React from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Crown, Zap, TrendingUp, TrendingDown, Shield, Brain, Eye, Activity,
  ChevronRight, Sparkles, Clock, Newspaper, Calculator, Bell,
  GraduationCap, Star, ArrowRight, Check, Plus, Minus,
  Globe, Lock, Award, BarChart3, Gauge, BookOpen, Atom,
  Layers, Cpu, Send, ArrowUpRight, Wifi, Building2, DollarSign,
  CircleDollarSign, Coins, LineChart, Radar, Target, AlertTriangle,
} from 'lucide-react'
import { LiquidGlassCard, GlowButton, AnimatedCounter, PremiumBadge, PremiumProgress, SectionHeading, StatCard } from '../primitives'
import { useMarketStore } from '@/lib/hisab/market-store'
import { formatNumber } from '@/lib/hisab/risk-manager'
import { cn } from '@/lib/utils'
import type { MarketSymbol } from '@/lib/hisab/multi-symbol'

interface LandingProps {
  onNavigate: (section: string) => void
}

export function Landing({ onNavigate }: LandingProps) {
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0.95])

  return (
    <div className="space-y-0 overflow-x-hidden">
      <HeroSection onNavigate={onNavigate} heroOpacity={heroOpacity} />
      <MarketTickerSection />
      <AICommandCenterSection onNavigate={onNavigate} />
      <AITerminalPreviewSection onNavigate={onNavigate} />
      <AIAssistantDemoSection />
      <WhyChooseSection onNavigate={onNavigate} />
      <PricingSection />
      <FAQSection />
      <CTASection onNavigate={onNavigate} />
    </div>
  )
}

/* ============================================
   HERO — Cinematic AI Operating System
   Layered structure (NO person image):
   Layer 1: Animated gradient + grid background
   Layer 2: Enhanced particle field (multi-color, multi-direction)
   Layer 3: Rising trading candles (ALL screens) + price line graph
   Layer 4: 3D financial globe (desktop)
   Layer 5: Hero content (heading, CTAs, stats)
   ============================================ */

function HeroSection({ onNavigate, heroOpacity }: any) {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-background">
      {/* ====== LAYER 1: Minimal dark background (almost no light) ====== */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Very subtle radial glow — barely visible */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 15% 30%, rgba(245, 197, 66, 0.03), transparent 60%),
              radial-gradient(ellipse 50% 40% at 85% 70%, rgba(245, 197, 66, 0.02), transparent 60%)
            `,
          }}
        />
        {/* Faint moving glow blobs — barely visible */}
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, -30, 0], opacity: [0.05, 0.08, 0.05] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245, 197, 66, 0.04), transparent 70%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245, 197, 66, 0.03), transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>

      {/* Grid background — almost invisible */}
      <div className="absolute inset-0 z-[1] grid-bg-fine opacity-[0.03] pointer-events-none" />

      {/* ====== LAYER 2: Enhanced particle field ====== */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <ParticleField />
      </div>

      {/* ====== LAYER 3: 3D financial globe (desktop only) ====== */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <FinancialGlobe />
      </div>

      {/* Subtle gradient overlays for depth — minimal */}
      <div className="absolute inset-0 z-[3] bg-gradient-to-b from-background/40 via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 z-[3] bg-gradient-to-r from-background/60 via-transparent to-transparent pointer-events-none" />

      {/* ====== LAYER 5: Hero content ====== */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 py-20 w-full"
      >
        <div className="max-w-4xl">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight leading-[1.05] mb-6"
          >
            <span className="text-foreground">The AI Operating System</span>
            <br />
            <span className="bg-gradient-to-r from-[#F5C542] via-[#FFC83D] to-[#00E676] bg-clip-text text-transparent">for Professional Traders</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-foreground/80 max-w-2xl leading-relaxed mb-8"
          >
            Institutional-grade market intelligence, powered by advanced artificial intelligence
            and designed for traders who demand precision.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
            <GlowButton size="xl" variant="gold" glow onClick={() => onNavigate('dashboard')}>
              <Cpu className="w-4 h-4" /> Launch AI Intelligence Workspace
            </GlowButton>
            <GlowButton size="xl" variant="outline" onClick={() => onNavigate('aile')}>
              <Atom className="w-4 h-4" /> AILE Engine
              <span className="ml-1 text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-[#F5C542]/15 text-[#F5C542] border border-[#F5C542]/30 uppercase">PRO</span>
            </GlowButton>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-foreground/75"
          >
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00E676]" /> AI Market Intelligence</span>
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00E676]" /> Priority Intelligence</span>
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00E676]" /> Multi-Timeframe Intelligence</span>
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00E676]" /> Institutional Trading Tools</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-foreground/50"
      >
        <ChevronRight className="w-5 h-5 rotate-90" />
      </motion.div>
    </section>
  )
}

/* ============================================
   PARTICLE FIELD — Enhanced multi-layer particle system
   3 types: floating dust, rising sparks, drifting embers
   ============================================ */

function ParticleField() {
  // Layer 1: Floating dust particles (slow, ambient)
  const dust = React.useMemo(() =>
    Array.from({ length: 25 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 25 + 15,
      delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 40,
    })), []
  )

  // Layer 2: Rising sparks (fast, bright, multi-color)
  const sparks = React.useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      x: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 6,
      riseHeight: 200 + Math.random() * 400,
      color: i % 4 === 0 ? '#F5C542' : i % 4 === 1 ? '#00E676' : i % 4 === 2 ? '#F5C542' : '#F5C542',
    })), []
  )

  // Layer 3: Drifting embers (medium, horizontal movement)
  const embers = React.useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * 100,
      y: 20 + Math.random() * 60,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 12,
      delay: Math.random() * 5,
      direction: Math.random() > 0.5 ? 1 : -1,
      color: i % 3 === 0 ? 'rgba(245, 197, 66, 0.4)' : i % 3 === 1 ? 'rgba(0, 230, 118, 0.35)' : 'rgba(245, 197, 66, 0.3)',
    })), []
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1: Floating dust */}
      {dust.map((p, i) => (
        <motion.div
          key={`dust-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: 'rgba(180, 200, 230, 0.4)',
            boxShadow: `0 0 ${p.size * 2}px rgba(180, 200, 230, 0.2)`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, p.drift, 0],
            opacity: [0, 0.7, 0],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Layer 2: Rising sparks (bright, colored) */}
      {sparks.map((p, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: '0%',
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}, 0 0 ${p.size * 8}px ${p.color}40`,
          }}
          animate={{
            y: [0, -p.riseHeight],
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Layer 3: Drifting embers (horizontal) */}
      {embers.map((p, i) => (
        <motion.div
          key={`ember-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            x: [0, p.direction * 120, 0],
            y: [0, -30, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ============================================
   FINANCIAL GLOBE — 3D rotating with market zones
   ============================================ */

function FinancialGlobe() {
  const markets = [
    { name: 'New York', lat: 40.7, lon: -74, color: '#00E676' },
    { name: 'London', lat: 51.5, lon: -0.1, color: '#F5C542' },
    { name: 'Tokyo', lat: 35.7, lon: 139.7, color: '#F5C542' },
    { name: 'Frankfurt', lat: 50.1, lon: 8.7, color: '#FFC83D' },
    { name: 'Sydney', lat: -33.9, lon: 151.2, color: '#A78BFA' },
    { name: 'Singapore', lat: 1.3, lon: 103.8, color: '#F472B6' },
  ]

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] hidden lg:block pointer-events-none">
      {/* Glow behind globe */}
      <div className="absolute inset-0 rounded-full bg-[#F5C542]/10 blur-3xl" />
      {/* Globe */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-12 rounded-full border border-[#F5C542]/20"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(37,99,235,0.15), transparent 60%), radial-gradient(circle at 70% 70%, rgba(16,185,129,0.1), transparent 60%)',
        }}
      >
        {/* Latitude lines */}
        {[30, 60, 90, 120, 150].map((r) => (
          <div key={r} className="absolute border border-[#F5C542]/10 rounded-full" style={{
            width: `${r * 2}%`, height: `${r * 2}%`,
            left: `${50 - r}%`, top: `${50 - r}%`,
          }} />
        ))}
        {/* Longitude lines (ellipses) */}
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <div key={deg} className="absolute border border-[#F5C542]/10 rounded-full" style={{
            width: '100%', height: '100%',
            transform: `rotateY(${deg}deg)`,
          }} />
        ))}
        {/* Market dots */}
        {markets.map((m, i) => {
          const angle = (m.lon + 180) * (Math.PI / 180)
          const x = 50 + Math.cos(angle) * 45
          const y = 50 - (m.lat / 90) * 45
          return (
            <motion.div
              key={m.name}
              className="absolute"
              style={{ left: `${x}%`, top: `${y}%` }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: m.color, boxShadow: `0 0 12px ${m.color}` }} />
            </motion.div>
          )
        })}
      </motion.div>
      {/* Orbit ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0"
      >
        <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-[#F5C542] shadow-[0_0_8px_#F5C542]" />
      </motion.div>
    </div>
  )
}

/* ============================================
   MARKET TICKER — Live animated tickers
   ============================================ */

function MarketTickerSection() {
  const [symbols, setSymbols] = React.useState<MarketSymbol[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await fetch('/api/markets', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setSymbols(data.symbols || [])
        }
      } catch (err) {
        console.warn('Market fetch failed', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMarkets()
    const interval = setInterval(fetchMarkets, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-10 relative border-y border-border/50 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-[#00E676] animate-ping opacity-75" />
              <span className="relative w-2 h-2 rounded-full bg-[#00E676]" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/60">Live Market Intelligence</span>
          </div>
          <span className="text-[10px] text-foreground/40 font-mono">Real-time · 30s refresh</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-foreground/[4%] animate-pulse" />
            ))
          ) : (
            symbols.map((sym, i) => <TickerCard key={sym.symbol} sym={sym} delay={i * 0.05} />)
          )}
        </div>
      </div>
    </section>
  )
}

function TickerCard({ sym, delay }: { sym: MarketSymbol; delay: number }) {
  const isUp = sym.change >= 0
  const color = isUp ? '#00E676' : '#FF5252'
  const categoryColor = sym.category === 'METAL' ? '#F5C542' : sym.category === 'CRYPTO' ? '#F7930A' : sym.category === 'DXY' ? '#FFC83D' : sym.category === 'INDEX' ? '#A78BFA' : '#00E676'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative p-4 rounded-xl liquid-glass hover:border-white/[15%] transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: categoryColor }} />
            <span className="text-xs font-mono font-bold tracking-tight">{sym.symbol}</span>
          </div>
          <div className="text-[10px] text-foreground/50 mt-0.5 truncate">{sym.name}</div>
        </div>
        {isUp ? <TrendingUp className="w-3.5 h-3.5" style={{ color }} /> : <TrendingDown className="w-3.5 h-3.5" style={{ color }} />}
      </div>
      <div className="text-lg font-mono font-bold tabular">
        {sym.price > 1000 ? `$${formatNumber(sym.price, 0)}` : sym.price > 10 ? `$${formatNumber(sym.price, 2)}` : formatNumber(sym.price, 4)}
      </div>
      <div className="text-xs font-mono tabular mt-0.5" style={{ color }}>
        {isUp ? '+' : ''}{sym.changePct.toFixed(2)}%
      </div>
      {/* Source indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className={cn('w-1 h-1 rounded-full', sym.source === 'live' ? 'bg-[#00E676]' : 'bg-[#F5C542]')} title={sym.source} />
      </div>
    </motion.div>
  )
}

/* ============================================
   AI COMMAND CENTER — Glass panels
   ============================================ */

function AICommandCenterSection({ onNavigate }: { onNavigate: (s: string) => void }) {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 mesh-bg opacity-50 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <PremiumBadge variant="info" size="md" className="mb-3 px-3 py-1">
            <Cpu className="w-3 h-3" /> AI Command Center
          </PremiumBadge>
          <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
            <span className="text-foreground">Institutional Intelligence,</span>{' '}
            <span className="bg-gradient-to-r from-[#F5C542] to-[#00E676] bg-clip-text text-transparent">Real-Time</span>
          </h2>
          <p className="text-base text-foreground/60">
            Six AI-powered panels monitoring every aspect of the market — from liquidity to news, from structure to sentiment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MarketBiasPanel />
          <MarketHeatmapPanel />
          <EconomicCalendarPanel />
          <LiquidityTrackerPanel />
          <GoldStrengthPanel />
          <NotificationFeedPanel onNavigate={onNavigate} />
        </div>
      </div>
    </section>
  )
}

function MarketBiasPanel() {
  return (
    <LiquidGlassCard className="p-5 hover-lift" hover>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" /> AI Market Bias
        </h3>
        <PremiumBadge variant="danger" size="xs">BEARISH</PremiumBadge>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-foreground/60">Gold Market · XAUUSD</span>
            <span className="font-mono font-bold text-[#F5C542]">92%</span>
          </div>
          <PremiumProgress value={92} color="gold" height={6} />
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-foreground/70"><Check className="w-3 h-3 text-[#00E676]" /> Liquidity sweep detected</div>
          <div className="flex items-center gap-2 text-foreground/70"><Check className="w-3 h-3 text-[#00E676]" /> Market structure changed</div>
          <div className="flex items-center gap-2 text-foreground/70"><Check className="w-3 h-3 text-[#00E676]" /> Order block confirmed</div>
        </div>
      </div>
    </LiquidGlassCard>
  )
}

function MarketHeatmapPanel() {
  const assets = [
    { name: 'EURUSD', change: 0.14, cat: 'Forex' },
    { name: 'GBPUSD', change: -0.06, cat: 'Forex' },
    { name: 'USDJPY', change: 0.22, cat: 'Forex' },
    { name: 'BTCUSD', change: -2.93, cat: 'Crypto' },
    { name: 'ETHUSD', change: -1.8, cat: 'Crypto' },
    { name: 'XAUUSD', change: 0.84, cat: 'Metal' },
    { name: 'XAGUSD', change: 1.2, cat: 'Metal' },
    { name: 'NASDAQ', change: 0.45, cat: 'Index' },
    { name: 'SP500', change: 0.32, cat: 'Index' },
    { name: 'DXY', change: 0.15, cat: 'DXY' },
    { name: 'US10Y', change: -0.08, cat: 'Bond' },
    { name: 'WTI', change: -0.9, cat: 'Commodity' },
  ]
  return (
    <LiquidGlassCard className="p-5 hover-lift" hover>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#00E676]" /> Market Heatmap
        </h3>
        <span className="text-[10px] text-foreground/50 font-mono">12 assets</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {assets.map(a => {
          const intensity = Math.min(1, Math.abs(a.change) / 3)
          const bg = a.change >= 0 ? `rgba(16,185,129,${0.1 + intensity * 0.3})` : `rgba(239,68,68,${0.1 + intensity * 0.3})`
          return (
            <div key={a.name} className="p-2 rounded-md text-center" style={{ background: bg }}>
              <div className="text-[10px] font-mono font-bold">{a.name}</div>
              <div className="text-[10px] font-mono tabular" style={{ color: a.change >= 0 ? '#00E676' : '#FF5252' }}>
                {a.change >= 0 ? '+' : ''}{a.change.toFixed(2)}%
              </div>
            </div>
          )
        })}
      </div>
    </LiquidGlassCard>
  )
}

function EconomicCalendarPanel() {
  const [secondsLeft, setSecondsLeft] = React.useState(298)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(s => s > 0 ? s - 1 : 600)
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  return (
    <LiquidGlassCard variant="gold" className="p-5 hover-lift" hover>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF5252]" /> Economic Calendar
        </h3>
        <PremiumBadge variant="danger" size="xs">HIGH IMPACT</PremiumBadge>
      </div>
      <div className="space-y-3">
        <div>
          <div className="text-xs text-foreground/60 mb-1">USD CPI Release</div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#F5C542]" />
            <span className="text-2xl font-mono font-bold tabular text-[#F5C542]">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="p-2.5 rounded-md bg-[#FF5252]/8 border border-[#FF5252]/20">
          <div className="text-[10px] uppercase tracking-wider text-[#FF5252] mb-1">AI Recommendation</div>
          <p className="text-xs text-foreground/80">Reduce exposure before volatility event.</p>
        </div>
      </div>
    </LiquidGlassCard>
  )
}

function LiquidityTrackerPanel() {
  return (
    <LiquidGlassCard className="p-5 hover-lift" hover>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Radar className="w-4 h-4 text-primary" /> Institutional Liquidity
        </h3>
        <PremiumBadge variant="info" size="xs">SMART MONEY</PremiumBadge>
      </div>
      <div className="space-y-2.5">
        <LiquidityRow label="Smart Money Activity" value="ACCUMULATING" color="#00E676" pct={78} />
        <LiquidityRow label="Liquidity Zones" value="3 ACTIVE" color="#F5C542" pct={65} />
        <LiquidityRow label="Institutional Flow" value="BEARISH" color="#FF5252" pct={71} />
        <LiquidityRow label="Market Sentiment" value="FEAR" color="#FF5252" pct={58} />
      </div>
    </LiquidGlassCard>
  )
}

function LiquidityRow({ label, value, color, pct }: { label: string; value: string; color: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-foreground/60">{label}</span>
        <span className="font-mono font-medium" style={{ color }}>{value}</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function GoldStrengthPanel() {
  return (
    <LiquidGlassCard className="p-5 hover-lift" hover>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Gauge className="w-4 h-4 text-[#F5C542]" /> Gold Strength Index
        </h3>
        <PremiumBadge variant="gold" size="xs">XAU</PremiumBadge>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <motion.circle
              cx="40" cy="40" r="32" fill="none" stroke="#F5C542" strokeWidth="6" strokeLinecap="round"
              strokeDasharray="201"
              initial={{ strokeDashoffset: 201 }}
              whileInView={{ strokeDashoffset: 201 - (87 / 100) * 201 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-mono font-bold text-[#F5C542]">87</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-xs text-foreground/60 mb-1">XAU Strength</div>
          <div className="text-sm font-semibold text-[#00E676] mb-1.5">Institutional Accumulation</div>
          <p className="text-[11px] text-foreground/50 leading-relaxed">Gold showing institutional accumulation. DXY weakening, yields stabilizing.</p>
        </div>
      </div>
    </LiquidGlassCard>
  )
}

function NotificationFeedPanel({ onNavigate }: { onNavigate: (s: string) => void }) {
  return (
    <LiquidGlassCard className="p-5 hover-lift" hover>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BellRing className="w-4 h-4 text-[#00E676]" /> Smart Notifications
        </h3>
        <button onClick={() => onNavigate('asne')} className="text-[10px] text-primary hover:underline">View All</button>
      </div>
      <div className="space-y-2">
        {/* SELL alert */}
        <div className="p-2.5 rounded-md bg-[#FF5252]/8 border border-l-2 border-l-[#FF5252]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#FF5252]">🔴 SELL CONFIRMED</span>
            <span className="text-[10px] font-mono text-foreground/50">XAUUSD</span>
          </div>
          <div className="text-[10px] text-foreground/60">Confidence: <span className="font-mono font-bold text-[#FF5252]">94%</span></div>
          <div className="flex gap-2 mt-1 text-[9px] text-foreground/50">
            <span>✓ Liq Sweep</span><span>✓ CHOCH</span><span>✓ OB</span>
          </div>
        </div>
        {/* BUY alert */}
        <div className="p-2.5 rounded-md bg-[#00E676]/8 border border-l-2 border-l-[#00E676]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#00E676]">🟢 BUY OPPORTUNITY</span>
            <span className="text-[10px] font-mono text-foreground/50">EURUSD</span>
          </div>
          <div className="text-[10px] text-foreground/60">Confidence: <span className="font-mono font-bold text-[#00E676]">89%</span></div>
          <div className="text-[9px] text-foreground/50 mt-1">Multi-Timeframe Confirmation Complete</div>
        </div>
      </div>
    </LiquidGlassCard>
  )
}

function BellRing({ className }: { className?: string }) {
  return <Bell className={className} />
}

/* ============================================
   AI TERMINAL PREVIEW — Product showcase
   ============================================ */

function AITerminalPreviewSection({ onNavigate }: { onNavigate: (s: string) => void }) {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <PremiumBadge variant="gold" size="md" className="mb-3 px-3 py-1">
            <Crown className="w-3 h-3" /> AI Terminal
          </PremiumBadge>
          <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
            <span className="text-foreground">Your Mission Control for</span>{' '}
            <span className="bg-gradient-to-r from-[#F5C542] to-[#00E676] bg-clip-text text-transparent">Markets</span>
          </h2>
          <p className="text-base text-foreground/60">
            A professional-grade trading dashboard that feels like the future.
          </p>
        </motion.div>

        {/* Terminal mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <LiquidGlassCard variant="strong" className="p-0 overflow-hidden shadow-premium-lg">
            {/* Terminal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-white/[2%]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5252]/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F5C542]/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00E676]/60" />
                </div>
                <span className="text-xs font-mono text-foreground/50 ml-2">apexeapro — terminal</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-foreground/40 font-mono">
                <Wifi className="w-3 h-3 text-[#00E676]" /> Connected
              </div>
            </div>

            {/* Terminal body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* AI Assistant (left) */}
              <div className="lg:col-span-3 p-4 border-r border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F5C542] to-[#00E676] flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold">AI Assistant</span>
                </div>
                <div className="space-y-2">
                  <TerminalMessage text="Monitoring 2,500+ markets..." />
                  <TerminalMessage text="High probability Gold setup detected." highlight />
                  <TerminalMessage text="USD news event in 5 minutes." />
                </div>
              </div>

              {/* Chart area (center) */}
              <div className="lg:col-span-6 p-4 border-r border-border/50 min-h-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono">XAUUSD</span>
                    <PremiumBadge variant="gold" size="xs">15M</PremiumBadge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="text-[#00E676]">H 4,018</span>
                    <span className="text-[#FF5252]">L 3,998</span>
                    <span className="text-foreground/60">$4,011</span>
                  </div>
                </div>
                <MiniChart />
                <div className="flex items-center justify-between mt-2 text-[10px] text-foreground/40 font-mono">
                  <span>Bias: <span className="text-[#FF5252]">SELL</span></span>
                  <span>Confidence: <span className="text-[#F5C542]">92%</span></span>
                </div>
              </div>

              {/* Right panel */}
              <div className="lg:col-span-3 p-4 space-y-3">
                <TerminalPanel title="Watchlist" items={['XAUUSD 4,011', 'EURUSD 1.087', 'BTCUSD 62,255', 'DXY 104.2']} />
                <TerminalPanel title="AI Signals" items={['SELL XAU 92%', 'BUY EUR 89%']} highlight />
                <TerminalPanel title="Risk Mgmt" items={['Risk: 1%', 'R:R 1:2.5']} />
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-white/[2%] text-[10px] font-mono text-foreground/40">
              <span>Live Market Intelligence</span>
              <span>Session: <span className="text-[#F5C542]">LONDON KZ</span></span>
            </div>
          </LiquidGlassCard>

          {/* Glow under terminal */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#F5C542]/10 via-[#F5C542]/5 to-[#00E676]/10 blur-2xl -z-10" />
        </motion.div>

        <div className="text-center mt-8">
          <GlowButton size="lg" variant="gold" glow onClick={() => onNavigate('dashboard')}>
            <Zap className="w-4 h-4" /> Open Intelligence Workspace
          </GlowButton>
        </div>
      </div>
    </section>
  )
}

function TerminalMessage({ text, highlight }: { text: string; highlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={cn(
        'text-[11px] p-2 rounded-md',
        highlight ? 'bg-[#00E676]/8 border border-[#00E676]/20 text-[#00E676]' : 'text-foreground/60',
      )}
    >
      {text}
    </motion.div>
  )
}

function MiniChart() {
  const candles = React.useMemo(() => {
    let price = 4011
    return Array.from({ length: 40 }, (_, i) => {
      const open = price
      const close = open + (Math.random() - 0.52) * 4
      const high = Math.max(open, close) + Math.random() * 2
      const low = Math.min(open, close) - Math.random() * 2
      price = close
      return { open, close, high, low, isUp: close >= open }
    })
  }, [])
  const allHigh = Math.max(...candles.map(c => c.high))
  const allLow = Math.min(...candles.map(c => c.low))
  const range = allHigh - allLow

  return (
    <div className="relative h-48 flex items-end gap-0.5">
      {candles.map((c, i) => {
        const h = ((c.high - c.low) / range) * 100
        const bodyH = Math.abs(c.close - c.open) / range * 100
        const top = ((allHigh - c.high) / range) * 100
        return (
          <div key={i} className="flex-1 relative" style={{ height: '100%' }}>
            <div
              className="absolute w-full"
              style={{ top: `${top}%`, height: `${h}%` }}
            >
              <div className={cn('w-full h-full', c.isUp ? 'bg-[#00E676]/30' : 'bg-[#FF5252]/30')} />
              <div
                className={cn('absolute left-1/2 -translate-x-1/2 w-3/4', c.isUp ? 'bg-[#00E676]' : 'bg-[#FF5252]')}
                style={{
                  top: `${((c.high - Math.max(c.open, c.close)) / (c.high - c.low)) * 100}%`,
                  height: `${bodyH / h * 100}%`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TerminalPanel({ title, items, highlight }: { title: string; items: string[]; highlight?: boolean }) {
  return (
    <div>
      <div className={cn('text-[10px] uppercase tracking-wider font-semibold mb-1.5', highlight ? 'text-[#00E676]' : 'text-foreground/50')}>{title}</div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="text-[10px] font-mono text-foreground/60 flex items-center justify-between">
            <span>{item.split(' ')[0]}</span>
            <span className={highlight ? 'text-[#00E676]' : ''}>{item.split(' ').slice(1).join(' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================
   AI ASSISTANT DEMO — Interactive conversation
   ============================================ */

function AIAssistantDemoSection() {
  const [step, setStep] = React.useState(0)
  const steps = [
    { role: 'user', text: 'Analyze Gold.' },
    { role: 'ai', text: 'Analyzing XAUUSD...', typing: true },
    { role: 'ai', text: 'Market Bias: Bearish\nConfidence: 92%\n\nReasons:\n✓ Liquidity taken\n✓ Structure break confirmed\n✓ Order block identified\n✓ USD strength increasing\n\nUpcoming: High impact news in 35 minutes', final: true },
  ]
  const [displayed, setDisplayed] = React.useState<typeof steps>([])

  React.useEffect(() => {
    if (step >= steps.length) return
    const timer = setTimeout(() => {
      setDisplayed(steps.slice(0, step + 1))
      setStep(s => s + 1)
    }, step === 0 ? 800 : step === 1 ? 1200 : 600)
    return () => clearTimeout(timer)
  }, [step])

  const reset = () => {
    setStep(0)
    setDisplayed([])
  }

  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <PremiumBadge variant="info" size="md" className="mb-3 px-3 py-1">
            <Brain className="w-3 h-3" /> AI Assistant
          </PremiumBadge>
          <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
            <span className="text-foreground">Talk to Your</span>{' '}
            <span className="bg-gradient-to-r from-[#F5C542] to-[#FFC83D] bg-clip-text text-transparent">AI Analyst</span>
          </h2>
          <p className="text-base text-foreground/60">Ask any question. Get institutional-grade answers in seconds.</p>
        </motion.div>

        <LiquidGlassCard variant="strong" className="p-6 min-h-[360px]">
          <div className="space-y-4">
            <AnimatePresence>
              {displayed.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-3', msg.role === 'user' && 'justify-end')}
                >
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5C542] to-[#00E676] flex items-center justify-center shrink-0">
                      <Cpu className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[80%] p-3 rounded-2xl text-sm',
                    msg.role === 'user'
                      ? 'bg-[#F5C542]/15 border border-[#F5C542]/30 text-foreground'
                      : 'liquid-glass text-foreground/80',
                  )}>
                    {msg.final ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#FF5252]">Market Bias: Bearish</span>
                          <span className="text-xs text-foreground/50">·</span>
                          <span className="text-xs font-bold text-[#F5C542]">Confidence: 92%</span>
                        </div>
                        <div className="text-xs text-foreground/60">Reasons:</div>
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00E676]" /> Liquidity taken</div>
                          <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00E676]" /> Structure break confirmed</div>
                          <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00E676]" /> Order block identified</div>
                          <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#00E676]" /> USD strength increasing</div>
                        </div>
                        <div className="text-xs text-[#F5C542] mt-2 pt-2 border-t border-border">⚠ Upcoming: High impact news in 35 minutes</div>
                      </div>
                    ) : msg.typing ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{msg.text}</span>
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="text-xs">●</motion.span>
                      </div>
                    ) : (
                      <span className="text-xs">{msg.text}</span>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-[#F5C542]/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#FFC83D]">U</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {step >= steps.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 pt-4 border-t border-border/50 flex justify-center"
            >
              <GlowButton variant="ghost" size="sm" onClick={reset}>
                <RotateCwIcon /> Replay Demo
              </GlowButton>
            </motion.div>
          )}
        </LiquidGlassCard>
      </div>
    </section>
  )
}

function RotateCwIcon() {
  return <ChevronRight className="w-3.5 h-3.5 rotate-90" />
}

/* ============================================
   WHY CHOOSE — Premium interactive cards
   ============================================ */

function WhyChooseSection({ onNavigate }: { onNavigate: (s: string) => void }) {
  const cards = [
    { icon: Radar, title: 'Institutional Liquidity Analysis', desc: 'Understand where professional money is moving.', detail: 'Track smart money activity, liquidity zones, and institutional flow in real-time.', color: '#F5C542', section: 'chart-analysis' },
    { icon: Shield, title: 'AI Trade Validation', desc: 'Confirm setups before taking action.', detail: '8-condition entry checklist ensures only A+ setups trigger alerts.', color: '#00E676', section: 'aile' },
    { icon: Layers, title: 'Multi-Timeframe Intelligence', desc: 'Combine multiple market perspectives.', detail: '8-timeframe bias matrix from Monthly to 1M with weighted alignment.', color: '#F5C542', section: 'mtf' },
    { icon: Bell, title: 'Smart Notifications', desc: 'Never miss important market conditions.', detail: '8 alert categories, anti-spam, priority-based delivery across 8 channels.', color: '#A78BFA', section: 'asne' },
    { icon: AlertTriangle, title: 'Economic Event Protection', desc: 'Avoid unnecessary exposure during volatility.', detail: '60/30/15/5/1 minute countdowns for high-impact news events.', color: '#FF5252', section: 'news' },
    { icon: GraduationCap, title: 'AI Trading Coach', desc: 'Learn and improve with personalized insights.', detail: 'Mentor-style explanations break down every setup step-by-step.', color: '#FFC83D', section: 'coach' },
  ]

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <PremiumBadge variant="gold" size="md" className="mb-3 px-3 py-1">
            <Award className="w-3 h-3" /> Why ApexEAPro
          </PremiumBadge>
          <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
            <span className="text-foreground">Built for</span>{' '}
            <span className="bg-gradient-to-r from-[#F5C542] to-[#00E676] bg-clip-text text-transparent">Professional Traders</span>
          </h2>
          <p className="text-base text-foreground/60">Six institutional-grade systems in one platform.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <LiquidGlassCard
                  hover
                  className="p-6 h-full cursor-pointer group relative overflow-hidden"
                >
                  <div
                    className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${card.color}15, transparent 70%)` }}
                  />
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                    <h3 className="text-base font-semibold mb-2">{card.title}</h3>
                    <p className="text-sm text-foreground/60 mb-3">{card.desc}</p>
                    <p className="text-xs text-foreground/40 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity max-h-0 group-hover:max-h-20 overflow-hidden">
                      {card.detail}
                    </p>
                    <div
                      className="flex items-center gap-1 text-xs font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: card.color }}
                      onClick={() => onNavigate(card.section)}
                    >
                      Explore <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </LiquidGlassCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ============================================
   PRICING — Luxury tiers
   ============================================ */

function PricingSection() {
  const [annual, setAnnual] = React.useState(true)
  const plans = [
    {
      name: 'Professional',
      desc: 'For active retail traders',
      monthly: 79, annual: 63,
      features: ['AI Market Analysis', '8-timeframe matrix', 'Smart notifications (4 channels)', 'Trade journal', 'AI Coach', 'Risk manager'],
      color: '#F5C542',
      popular: false,
    },
    {
      name: 'Premium',
      desc: 'For serious professionals',
      monthly: 199, annual: 159,
      features: ['Everything in Professional', 'AILE Engine v1.0', 'Unlimited AI Vision', '6 notification channels', 'Price level alerts (30)', 'Priority support'],
      color: '#F5C542',
      popular: true,
    },
    {
      name: 'Institutional',
      desc: 'For funds and prop firms',
      monthly: 499, annual: 399,
      features: ['Everything in Premium', '8 notification channels', 'Unlimited price levels', 'Custom AI training', 'API access', 'Dedicated account manager'],
      color: '#00E676',
      popular: false,
    },
  ]

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <PremiumBadge variant="gold" size="md" className="mb-3 px-3 py-1">
            <Crown className="w-3 h-3" /> Premium Access
          </PremiumBadge>
          <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
            <span className="text-foreground">Choose Your</span>{' '}
            <span className="bg-gradient-to-r from-[#F5C542] to-[#00E676] bg-clip-text text-transparent">Trading Edge</span>
          </h2>
          <p className="text-base text-foreground/60 mb-6">Cancel anytime. 14-day money-back guarantee.</p>
          <div className="inline-flex items-center gap-3 p-1 rounded-xl liquid-glass">
            <button onClick={() => setAnnual(false)} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all', !annual ? 'bg-white/10 text-foreground' : 'text-foreground/50')}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2', annual ? 'bg-white/10 text-foreground' : 'text-foreground/50')}>
              Annual <PremiumBadge variant="bull" size="xs">SAVE 20%</PremiumBadge>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <PremiumBadge variant="gold" size="md" glow className="px-3 py-1.5">
                    <Sparkles className="w-3 h-3" /> MOST POPULAR
                  </PremiumBadge>
                </div>
              )}
              <LiquidGlassCard
                variant={plan.popular ? 'gold' : 'default'}
                glow={plan.popular}
                className={cn('p-6 h-full flex flex-col', plan.popular && 'border-[#F5C542]/35')}
              >
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: plan.color }} />
                    <h3 className="text-lg font-semibold font-display">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-foreground/50">{plan.desc}</p>
                </div>
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-mono font-bold tabular">${annual ? plan.annual : plan.monthly}</span>
                    <span className="text-sm text-foreground/50">/month</span>
                  </div>
                  {annual && <div className="text-xs text-foreground/40 mt-1 line-through">${plan.monthly}/month billed monthly</div>}
                </div>
                <GlowButton
                  variant={plan.popular ? 'gold' : 'outline'}
                  size="md"
                  className="w-full mb-5"
                >
                  Start {plan.name}
                </GlowButton>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map(feat => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: plan.color }} />
                      <span className="text-foreground/80">{feat}</span>
                    </li>
                  ))}
                </ul>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================
   FAQ
   ============================================ */

function FAQSection() {
  const [open, setOpen] = React.useState<number | null>(0)
  const faqs = [
    { q: 'Is ApexEAPro suitable for beginners?', a: 'Absolutely. The AI Coach explains every setup in plain English. The interface is intuitive for beginners while powerful enough for institutional traders.' },
    { q: 'Does the AI guarantee profits?', a: 'No. ApexEAPro NEVER guarantees profits. All analysis is probability-based and explicitly educational. Trading involves substantial risk of loss.' },
    { q: 'How real-time is the data?', a: 'Gold prices from gold-api.com (30s), BTC from CoinGecko (60s), forex from open.er-api.com (30min). All sources are free, trusted, and require no API keys.' },
    { q: 'What is the AILE Engine?', a: 'AILE v1.0 is our 12-phase institutional liquidity analysis engine. It outputs WAIT when any of 8 entry conditions are missing — patience is edge.' },
    { q: 'Can I use it on mobile?', a: 'Yes. Fully responsive PWA. Works flawlessly on mobile, tablet, laptop, desktop, and ultrawide. Install to home screen for native-app experience.' },
  ]
  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight mb-4">
            <span className="text-foreground">Frequently Asked</span>{' '}
            <span className="bg-gradient-to-r from-[#F5C542] to-[#00E676] bg-clip-text text-transparent">Questions</span>
          </h2>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <LiquidGlassCard className="overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-semibold">{faq.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }}>
                    <ChevronRight className="w-4 h-4 rotate-90 text-foreground/50" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm text-foreground/60 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================
   CTA
   ============================================ */

function CTASection({ onNavigate }: { onNavigate: (s: string) => void }) {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-60" />
      <div className="relative max-w-4xl mx-auto px-4 lg:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <PremiumBadge variant="gold" size="md" glow className="mb-4 px-3 py-1.5">
            <Crown className="w-3 h-3" /> Start Trading Smarter
          </PremiumBadge>
          <h2 className="text-4xl lg:text-6xl font-bold font-display tracking-tight mb-4">
            <span className="text-foreground">Trade Less.</span>{' '}
            <span className="bg-gradient-to-r from-[#F5C542] to-[#00E676] bg-clip-text text-transparent">Trade Smarter.</span>
          </h2>
          <p className="text-base lg:text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
            Join thousands of professional traders using ApexEAPro. The AI Operating System for serious market participants.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <GlowButton size="xl" variant="gold" glow onClick={() => onNavigate('dashboard')}>
              <Zap className="w-4 h-4" /> Launch AI Intelligence Workspace
            </GlowButton>
            <GlowButton size="xl" variant="outline" onClick={() => onNavigate('aile')}>
              <Atom className="w-4 h-4" /> Try AILE Engine
            </GlowButton>
          </div>
          <p className="text-xs text-foreground/40 mt-6 italic">
            Educational tool only — not financial advice. Trading involves substantial risk.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================
   AILE BUTTON — Compact award-winning
   ============================================ */

interface AILEButtonProps {
  onClick: () => void
}

function AILEEngineButton({ onClick }: AILEButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick()
  }
  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="group relative inline-flex items-center justify-center h-14 px-5 rounded-2xl font-semibold overflow-hidden cursor-pointer shrink-0"
      aria-label="Launch AILE Engine"
    >
      <div className="absolute -inset-[1.5px] rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity" style={{
        background: 'conic-gradient(from 0deg, #FFC83D, #F5C542, #00E676, #FFC83D)',
        animation: 'aile-rotate 4s linear infinite',
      }} />
      <div className="relative flex items-center gap-2 h-full px-5 rounded-[14px] bg-gradient-to-br from-[#1A1A1A] to-[rgba(11, 15, 25, 0.95)] backdrop-blur-xl">
        <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-[#F5C542]/50 blur-[3px]" />
          <div className="relative w-4 h-4 rounded-[5px] bg-gradient-to-br from-[#F5C542] to-[#D97706] flex items-center justify-center">
            <Atom className="w-2.5 h-2.5 text-background" strokeWidth={2.5} />
          </div>
        </div>
        <span className="text-base font-bold font-display tracking-tight bg-gradient-to-r from-[#F5C542] to-[#F5C542] bg-clip-text text-transparent whitespace-nowrap">AILE Engine</span>
        <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-[#F5C542]/15 text-[#F5C542] border border-[#F5C542]/30 uppercase tracking-wider shrink-0">PRO</span>
      </div>
    </motion.button>
  )
}
