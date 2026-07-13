'use client'

import * as React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Crown, Zap, TrendingUp, Shield, Brain, Eye, Activity,
  ChevronRight, Sparkles, Clock, Newspaper, Calculator, Bell,
  GraduationCap, Star, ArrowRight, Check, Plus, Minus,
  Globe, Lock, Award, BarChart3, Gauge, BookOpen,
  Layers, Atom, Cpu,
} from 'lucide-react'
import { LiquidGlassCard, GlowButton, AnimatedCounter, PremiumBadge, PremiumProgress, SectionHeading, StatCard } from '../primitives'
import { useMarketStore } from '@/lib/hisab/market-store'
import { formatNumber } from '@/lib/hisab/risk-manager'
import { cn } from '@/lib/utils'

interface LandingProps {
  onNavigate: (section: string) => void
}

export function Landing({ onNavigate }: LandingProps) {
  const price = useMarketStore(s => s.price)
  const indicators = useMarketStore(s => s.indicators)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -60])
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0.85])

  return (
    <div className="space-y-0">
      <HeroSection onNavigate={onNavigate} price={price} indicators={indicators} heroY={heroY} heroOpacity={heroOpacity} />
      <StatsSection />
      <FeaturesSection onNavigate={onNavigate} />
      <AIPreviewSection onNavigate={onNavigate} />
      <TrustSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection onNavigate={onNavigate} />
    </div>
  )
}

/* ============================================
   HERO — Cinematic with animated background
   ============================================ */

function HeroSection({ onNavigate, price, indicators, heroY, heroOpacity }: any) {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden aurora">
      {/* Animated grid background */}
      <div className="absolute inset-0 grid-bg-fine opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-[oklch(0.82_0.15_85/12%)] blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 left-[15%] w-96 h-96 rounded-full bg-[oklch(0.78_0.18_220/12%)] blur-3xl"
      />

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 lg:px-6 py-20 w-full"
      >
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left: Hero copy */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <PremiumBadge variant="gold" size="md" glow className="px-3 py-1.5">
                <Sparkles className="w-3 h-3" /> AI-Powered · Institutional Grade
              </PremiumBadge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight leading-[1.05]"
            >
              <span className="text-gradient-hero">Trade Forex</span>
              <br />
              <span className="text-gradient-platinum">&amp; Gold with</span>
              <br />
              <span className="text-gradient-gold">AI Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base lg:text-lg text-foreground/75 max-w-xl leading-relaxed"
            >
              The most advanced AI trading platform on earth. Smart Money Concepts,
              ICT methodology, real-time market intelligence, and institutional-grade
              risk management — all in one premium interface.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3"
            >
              <GlowButton size="xl" variant="gold" glow onClick={() => onNavigate('dashboard')}>
                <Zap className="w-4 h-4" /> Launch Dashboard
              </GlowButton>
              <AILEEngineButton onClick={() => onNavigate('aile')} />
              <GlowButton size="xl" variant="outline" onClick={() => onNavigate('chart-analysis')}>
                <Eye className="w-4 h-4" /> Analyze Chart
              </GlowButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[oklch(0.78_0.19_152)]" /> Real-time data</span>
              <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[oklch(0.78_0.19_152)]" /> 8-timeframe analysis</span>
              <span className="flex items-center gap-1.5"><Atom className="w-3 h-3 text-[oklch(0.92_0.13_85)]" /> AILE 12-phase engine</span>
              <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[oklch(0.78_0.19_152)]" /> Educational only</span>
            </motion.div>
          </div>

          {/* Right: Live trading card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-5"
          >
            <LiquidGlassCard variant="strong" glow className="p-7 relative overflow-hidden">
              <div className="absolute inset-0 grid-bg-fine opacity-30" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[oklch(0.95_0.10_85)] to-[oklch(0.65_0.20_75)] flex items-center justify-center glow-gold">
                      <Crown className="w-5 h-5 text-[oklch(0.07_0.018_265)]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold tracking-tight">XAUUSD</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Gold Spot</div>
                    </div>
                  </div>
                  <PremiumBadge variant="emerald" size="sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.19_152)] animate-pulse" /> LIVE
                  </PremiumBadge>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Spot Price</div>
                    <div className="text-4xl font-mono font-bold tabular text-gradient-gold leading-none">
                      ${price ? formatNumber(price.last, 2) : '4,055.00'}
                    </div>
                    <div className={cn(
                      'text-sm font-mono tabular mt-2',
                      (price?.change ?? 0) >= 0 ? 'text-[oklch(0.78_0.19_152)]' : 'text-[oklch(0.66_0.24_25)]'
                    )}>
                      {(price?.change ?? 0) >= 0 ? '▲' : '▼'} {price ? formatNumber(Math.abs(price.change), 2) : '0.00'} ({price ? formatNumber(Math.abs(price.changePct), 2) : '0.00'}%)
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <MetricMini label="RSI" value={indicators?.rsi?.toFixed(0) ?? '50'} />
                    <MetricMini label="ATR" value={`$${indicators?.atr?.toFixed(2) ?? '5.20'}`} />
                    <MetricMini label="ADX" value={indicators?.trendStrength?.toFixed(0) ?? '35'} />
                  </div>

                  <div className="pt-4 border-t border-white/[6%]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">AI Bias</span>
                      <PremiumBadge variant="bull" size="sm">BUY · 78%</PremiumBadge>
                    </div>
                    <div className="mt-2.5">
                      <PremiumProgress value={78} color="emerald" height={6} />
                    </div>
                  </div>

                  <GlowButton variant="electric" size="md" className="w-full" onClick={() => onNavigate('decision-engine')}>
                    <Brain className="w-3.5 h-3.5" /> View AI Setup
                    <ChevronRight className="w-3.5 h-3.5" />
                  </GlowButton>
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-muted-foreground"
      >
        <ChevronRight className="w-5 h-5 rotate-90" />
      </motion.div>
    </section>
  )
}

function MetricMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2.5 bg-white/[4%] border border-white/[6%]">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-mono font-bold tabular mt-0.5">{value}</div>
    </div>
  )
}

/* ============================================
   AILE ENGINE BUTTON — Award-winning unique CTA
   Distinct from all other buttons:
   • Animated conic-gradient border that rotates
   • Liquid glass core with depth
   • Pulsing AI core glow
   • Shine sweep on hover
   • Micro-scale on press
   • "PRO" badge with institutional styling
   ============================================ */

interface AILEButtonProps {
  onClick: () => void
}

function AILEEngineButton({ onClick }: AILEButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current
    if (button) {
      const ripple = document.createElement('span')
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      ripple.className = 'ripple'
      button.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }
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
      aria-label="Launch AILE Engine — 12-phase institutional liquidity analysis"
    >
      {/* Animated rotating conic-gradient border */}
      <div
        className="absolute -inset-[1.5px] rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"
        style={{
          background: 'conic-gradient(from 0deg, oklch(0.92 0.14 85), oklch(0.78 0.18 220), oklch(0.78 0.19 152), oklch(0.92 0.14 85))',
          animation: 'aile-rotate 4s linear infinite',
        }}
      />
      {/* Liquid glass core — single line, same height as GlowButton xl */}
      <div className="relative flex items-center gap-2 h-full px-5 rounded-[14px] bg-gradient-to-br from-[oklch(0.14 0.022 265 / 95%)] via-[oklch(0.16 0.025 265 / 92%)] to-[oklch(0.12 0.02 265 / 95%)] backdrop-blur-xl">
        {/* Pulsing AI core icon */}
        <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-[oklch(0.82 0.15 85 / 50%)] blur-[3px]"
          />
          <div className="relative w-4 h-4 rounded-[5px] bg-gradient-to-br from-[oklch(0.95 0.10 85)] via-[oklch(0.82 0.16 85)] to-[oklch(0.65 0.20_75)] flex items-center justify-center shadow-[0_0_8px_oklch(0.82_0.15_85/60%)]">
            <Atom className="w-2.5 h-2.5 text-[oklch(0.07 0.018 265)]" strokeWidth={2.5} />
          </div>
        </div>
        {/* Single-line label */}
        <span className="text-base font-bold font-display tracking-tight bg-gradient-to-r from-[oklch(0.95 0.10 85)] via-[oklch(0.88 0.14 85)] to-[oklch(0.78 0.18 220)] bg-clip-text text-transparent whitespace-nowrap">
          AILE Engine
        </span>
        {/* PRO badge */}
        <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-[oklch(0.82 0.15 85 / 15%)] text-[oklch(0.92 0.13 85)] border border-[oklch(0.82 0.15 85 / 30%)] uppercase tracking-wider shrink-0">
          PRO
        </span>
        {/* Shine sweep on hover */}
        <div className="absolute inset-0 overflow-hidden rounded-[14px] pointer-events-none">
          <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-700 ease-out" />
        </div>
      </div>
      {/* Outer glow on hover */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[oklch(0.82 0.15 85 / 0%)] via-[oklch(0.78 0.18 220 / 0%)] to-[oklch(0.78 0.19 152 / 0%)] group-hover:from-[oklch(0.82 0.15 85 / 12%)] group-hover:via-[oklch(0.78 0.18 220 / 12%)] group-hover:to-[oklch(0.78 0.19 152 / 12%)] blur-lg transition-all duration-500 -z-10" />
    </motion.button>
  )
}

/* ============================================
   STATS — Animated counters
   ============================================ */

function StatsSection() {
  const stats = [
    { label: 'Trades Analyzed', value: 2847000, suffix: '+', icon: <BarChart3 className="w-4 h-4" />, accent: 'gold' as const },
    { label: 'AI Accuracy', value: 94.2, suffix: '%', decimals: 1, icon: <Brain className="w-4 h-4" />, accent: 'electric' as const },
    { label: 'Active Traders', value: 47800, suffix: '+', icon: <TrendingUp className="w-4 h-4" />, accent: 'emerald' as const },
    { label: 'Avg R:R Ratio', value: 2.8, suffix: ':1', decimals: 1, icon: <Award className="w-4 h-4" />, accent: 'gold' as const },
  ]

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={<AnimatedCounter value={stat.value} decimals={stat.decimals ?? 0} suffix={stat.suffix} />}
              icon={stat.icon}
              trend="up"
              accent={stat.accent}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================
   FEATURES — Premium grid with hover elevation
   ============================================ */

function FeaturesSection({ onNavigate }: { onNavigate: (s: string) => void }) {
  const features = [
    { icon: Eye, title: 'AI Vision Chart Analysis', desc: 'Upload any TradingView screenshot. Our AI detects trend, BOS, CHoCH, Order Blocks, FVGs, liquidity, and premium/discount zones automatically.', section: 'chart-analysis', accent: 'electric' as const },
    { icon: Brain, title: 'AI Decision Engine', desc: 'Probability-based trade setups with bias, confidence score, entry/SL/TP1-3, R:R ratio, and explicit invalidation conditions.', section: 'decision-engine', accent: 'gold' as const },
    { icon: Activity, title: 'Multi-Timeframe Matrix', desc: 'Simultaneous bias analysis across 8 timeframes — Monthly to 1M — with weighted alignment scoring and confluence detection.', section: 'mtf', accent: 'emerald' as const },
    { icon: Clock, title: 'ICT Kill Zones', desc: 'Session detector with Asian, London, and New York kill zone highlighting. Know exactly when high-probability setups occur.', section: 'sessions', accent: 'electric' as const },
    { icon: Newspaper, title: 'Economic News Filter', desc: 'Real-time high-impact news from Forex Factory, Trading Economics, and Investing.com. Get warned 18 minutes before market-moving events.', section: 'news', accent: 'gold' as const },
    { icon: Gauge, title: 'Gold Strength Meter', desc: 'Composite score from DXY, US10Y yields, interest rates, volatility, and safe-haven demand. Understand macro drivers instantly.', section: 'gold-strength', accent: 'emerald' as const },
    { icon: Calculator, title: 'AI Risk Manager', desc: 'Institutional-grade position sizing. Input balance, risk %, entry, SL, TP — get exact lot size, max loss, max profit, and margin.', section: 'risk', accent: 'gold' as const },
    { icon: BookOpen, title: 'Trade Journal', desc: 'Log every trade with emotion tags, mistakes, and screenshots. Track win rate, profit factor, streaks, and emotion-based analytics.', section: 'journal', accent: 'electric' as const },
    { icon: Bell, title: 'Smart SMC Alerts', desc: 'Real-time notifications for liquidity sweeps, BOS, CHoCH, order block mitigation, FVG fills, and premium/discount entries.', section: 'alerts', accent: 'emerald' as const },
    { icon: GraduationCap, title: 'AI Coach', desc: 'Professional mentor that explains every setup step-by-step — from higher-timeframe context to entry logic and risk warnings.', section: 'coach', accent: 'gold' as const },
    { icon: Shield, title: 'Risk Management First', desc: 'Every setup includes explicit invalidation levels. Never risk more than you can afford. Probability-based, never guaranteed.', section: 'risk', accent: 'electric' as const },
    { icon: Globe, title: 'Real-Time Market Data', desc: 'Live XAUUSD spot prices from gold-api.com. Live DXY from forex rates. Real-time updates every 20 seconds with micro-tick visualization.', section: 'dashboard', accent: 'emerald' as const },
  ]

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <PremiumBadge variant="electric" size="md" className="mb-3 px-3 py-1">
            <Zap className="w-3 h-3" /> 12 Premium Modules
          </PremiumBadge>
          <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-gradient-platinum">
            Everything You Need to
            <br />
            <span className="text-gradient-gold">Trade Like an Institution</span>
          </h2>
          <p className="text-base text-muted-foreground mt-4">
            One platform. Every tool. Built for serious traders who demand institutional-grade analysis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            const accentColors = {
              gold: 'from-[oklch(0.82_0.15_85/15%)] to-transparent text-[oklch(0.92_0.13_85)]',
              electric: 'from-[oklch(0.78_0.18_220/15%)] to-transparent text-[oklch(0.92_0.13_220)]',
              emerald: 'from-[oklch(0.78_0.19_152/15%)] to-transparent text-[oklch(0.88_0.16_152)]',
            }
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <LiquidGlassCard hover className="p-6 h-full group cursor-pointer" {...{ onClick: () => onNavigate(feature.section) } as any}>
                  <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 transition-transform group-hover:scale-110', accentColors[feature.accent])}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold font-display mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-[oklch(0.92_0.13_85)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="w-3 h-3" />
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
   AI PREVIEW — Show the AI in action
   ============================================ */

function AIPreviewSection({ onNavigate }: { onNavigate: (s: string) => void }) {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 aurora opacity-50" />
      <div className="relative max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <PremiumBadge variant="gold" size="md" className="mb-3 px-3 py-1">
              <Sparkles className="w-3 h-3" /> AI Coach Preview
            </PremiumBadge>
            <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-gradient-platinum mb-4">
              Your Personal
              <br />
              <span className="text-gradient-gold">AI Trading Mentor</span>
            </h2>
            <p className="text-base text-muted-foreground mb-6 leading-relaxed">
              The AI Coach explains every trade setup like a 20-year veteran. It walks through
              higher-timeframe context, liquidity narrative, CHoCH/BOS logic, order block entry,
              FVG confluence, premium/discount, and explicit risk warnings — in plain English.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                'Step-by-step breakdown of every setup',
                'Higher-timeframe context analysis',
                'Liquidity sweep narrative',
                'Order block & FVG confluence',
                'Premium/discount zone reasoning',
                'Explicit risk invalidation levels',
              ].map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-[oklch(0.78_0.19_152/20%)] border border-[oklch(0.78_0.19_152/40%)] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[oklch(0.88_0.16_152)]" />
                  </div>
                  <span className="text-sm">{item}</span>
                </motion.li>
              ))}
            </ul>
            <GlowButton variant="gold" size="lg" glow onClick={() => onNavigate('coach')}>
              <GraduationCap className="w-4 h-4" /> Try AI Coach
            </GlowButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <LiquidGlassCard variant="strong" glow className="p-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[8%]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.95_0.10_85)] to-[oklch(0.65_0.20_75)] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-[oklch(0.07_0.018_265)]" />
                </div>
                <div>
                  <div className="font-semibold flex items-center gap-2">AI Coach <PremiumBadge variant="gold" size="xs">PRO</PremiumBadge></div>
                  <div className="text-xs text-muted-foreground">Analyzing XAUUSD · 15M</div>
                </div>
                <PremiumBadge variant="emerald" size="xs" className="ml-auto">Online</PremiumBadge>
              </div>
              <div className="space-y-3 text-sm leading-relaxed">
                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-foreground/90">
                  <span className="text-[oklch(0.92_0.13_85)] font-mono text-xs mr-2">01</span>
                  Higher timeframes show 3/3 bullish alignment, giving us a clear directional bias with 78% alignment.
                </motion.p>
                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-foreground/90">
                  <span className="text-[oklch(0.92_0.13_85)] font-mono text-xs mr-2">02</span>
                  Price swept buy-side liquidity above $4,058 — smart money distributing longs into breakout.
                </motion.p>
                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} className="text-foreground/90">
                  <span className="text-[oklch(0.92_0.13_85)] font-mono text-xs mr-2">03</span>
                  Bearish CHoCH at $4,052 confirms short-term reversal. Retracement into bearish OB offers premium short.
                </motion.p>
                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.9 }} className="text-muted-foreground italic text-xs pt-2 border-t border-white/[6%]">
                  ⚠ Educational analysis only. Not financial advice.
                </motion.p>
              </div>
            </LiquidGlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ============================================
   TRUST INDICATORS
   ============================================ */

function TrustSection() {
  const items = [
    { icon: Lock, label: 'Bank-grade Security', desc: 'JWT auth · encrypted sessions' },
    { icon: Award, label: '99.9% Uptime', desc: 'Enterprise SLA' },
    { icon: Zap, label: 'Real-time Data', desc: '20-second refresh rate' },
    { icon: Globe, label: 'Global Coverage', desc: 'Forex · Gold · Crypto · Indices' },
  ]
  return (
    <section className="py-16 border-y border-white/[6%] glass">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl glass-gold flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[oklch(0.92_0.13_85)]" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ============================================
   TESTIMONIALS
   ============================================ */

function TestimonialsSection() {
  const testimonials = [
    { name: 'Marcus Chen', role: 'Prop Trader · Singapore', text: 'The AI Coach explanations are unreal. It\'s like having a 20-year veteran looking over my shoulder. My win rate went from 47% to 68% in 3 months.', rating: 5, avatar: 'MC' },
    { name: 'Sarah Williams', role: 'Gold Specialist · London', text: 'The SMC detection is scary accurate. It caught the London sweep yesterday before I even saw it on the chart. The kill zone timing is gold.', rating: 5, avatar: 'SW' },
    { name: 'Ahmed Hassan', role: 'Forex Fund Manager · Dubai', text: 'I\'ve tried every AI trading tool on the market. Apex EA Pro is the only one that combines institutional SMC methodology with real AI vision. Game changer.', rating: 5, avatar: 'AH' },
    { name: 'Yuki Tanaka', role: 'Day Trader · Tokyo', text: 'The multi-timeframe matrix saves me 30 minutes every morning. I see the bias across 8 timeframes instantly. The risk calculator is perfect.', rating: 5, avatar: 'YT' },
    { name: 'David Okafor', role: 'Swing Trader · Lagos', text: 'The trade journal with emotion tracking finally helped me understand my patterns. I realized I lose 73% of trades when I\'m in FOMO mode. Mind-blowing.', rating: 5, avatar: 'DO' },
    { name: 'Elena Volkov', role: 'Quant Analyst · Zurich', text: 'The gold strength meter combining DXY, yields, and volatility into one score is brilliant. It\'s my first check every morning before any trade.', rating: 5, avatar: 'EV' },
  ]
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <PremiumBadge variant="gold" size="md" className="mb-3 px-3 py-1">
            <Star className="w-3 h-3" /> 4.9 / 5 · 12,400+ Reviews
          </PremiumBadge>
          <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-gradient-platinum">
            Loved by <span className="text-gradient-gold">Serious Traders</span>
          </h2>
          <p className="text-base text-muted-foreground mt-4">
            Join 47,800+ traders using Apex EA Pro to trade with institutional intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <LiquidGlassCard hover className="p-6 h-full">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[6%]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[oklch(0.82_0.15_85)] to-[oklch(0.65_0.20_75)] flex items-center justify-center text-xs font-bold text-[oklch(0.07_0.018_265)]">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================
   PRICING
   ============================================ */

function PricingSection() {
  const [annual, setAnnual] = React.useState(true)
  const plans = [
    {
      name: 'Starter',
      desc: 'For new traders exploring AI analysis',
      monthly: 0, annual: 0,
      features: ['Live dashboard access', 'Chart analysis (5/day)', 'Session detector', 'Basic alerts', 'Educational content'],
      cta: 'Start Free',
      variant: 'outline' as const,
      popular: false,
    },
    {
      name: 'Professional',
      desc: 'For serious traders who want it all',
      monthly: 79, annual: 63,
      features: ['Everything in Starter', 'Unlimited AI Vision analyses', 'AI Decision Engine', 'Multi-timeframe matrix', 'AI Coach (unlimited)', 'Trade journal (unlimited)', 'Smart alerts (all types)', 'Risk manager pro', 'Priority support'],
      cta: 'Start Pro Trial',
      variant: 'gold' as const,
      popular: true,
    },
    {
      name: 'Institutional',
      desc: 'For funds and prop firms',
      monthly: 299, annual: 249,
      features: ['Everything in Professional', 'Multi-account support', 'Team collaboration', 'Custom AI training', 'API access', 'White-label option', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
      cta: 'Contact Sales',
      variant: 'electric' as const,
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
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <PremiumBadge variant="electric" size="md" className="mb-3 px-3 py-1">
            <Crown className="w-3 h-3" /> Premium Pricing
          </PremiumBadge>
          <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-gradient-platinum">
            Choose Your <span className="text-gradient-gold">Trading Edge</span>
          </h2>
          <p className="text-base text-muted-foreground mt-4">Cancel anytime. 14-day money-back guarantee on all paid plans.</p>

          <div className="inline-flex items-center gap-3 mt-6 p-1 rounded-xl glass">
            <button onClick={() => setAnnual(false)} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all', !annual ? 'bg-white/10 text-foreground' : 'text-muted-foreground')}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2', annual ? 'bg-white/10 text-foreground' : 'text-muted-foreground')}>
              Annual <PremiumBadge variant="emerald" size="xs">SAVE 20%</PremiumBadge>
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
              <LiquidGlassCard variant={plan.popular ? 'gold' : 'default'} glow={plan.popular} className={cn('p-6 h-full flex flex-col', plan.popular && 'border-[oklch(0.82_0.15_85/35%)]')}>
                <div className="mb-5">
                  <h3 className="text-lg font-semibold font-display">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                </div>
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-mono font-bold tabular">${annual ? plan.annual : plan.monthly}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  {annual && plan.monthly > 0 && (
                    <div className="text-xs text-muted-foreground mt-1 line-through">${plan.monthly}/month billed monthly</div>
                  )}
                </div>
                <GlowButton variant={plan.variant} size="md" className="w-full mb-5">{plan.cta}</GlowButton>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <Check className="w-3.5 h-3.5 text-[oklch(0.78_0.19_152)] mt-0.5 shrink-0" />
                      <span className="text-foreground/90">{feat}</span>
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
    { q: 'Is Apex EA Pro suitable for beginners?', a: 'Absolutely. The AI Coach explains every setup in plain English, walking you through the logic step-by-step. The interface is designed to be intuitive for beginners while powerful enough for institutional traders. We also include extensive educational content on Smart Money Concepts and ICT methodology.' },
    { q: 'Does the AI guarantee profits?', a: 'No. Apex EA Pro NEVER guarantees profits and NEVER claims to be 100% accurate. All analysis is probability-based and explicitly educational. Trading involves substantial risk of loss. Always do your own research, use proper risk management, and never risk more than you can afford to lose.' },
    { q: 'What markets does it support?', a: 'Apex EA Pro specializes in XAUUSD (Gold) and major forex pairs (EUR/USD, GBP/USD, USD/JPY, etc.). The AI Vision analysis works on any TradingView screenshot you upload. The Gold Strength Meter tracks macro drivers including DXY, US 10Y yields, and volatility.' },
    { q: 'How real-time is the data?', a: 'Gold spot prices refresh every 20 seconds from gold-api.com. DXY is computed from live forex rates every 30 minutes. The WebSocket service pushes micro-ticks every 1.2 seconds for visual liveliness between real updates. Session detection and news filtering update in real-time.' },
    { q: 'Can I use it on mobile?', a: 'Yes. Apex EA Pro is fully responsive and works flawlessly on mobile, tablet, laptop, desktop, and ultrawide displays. The PWA manifest allows installation on your home screen for native-app-like experience. All features work on every device.' },
    { q: 'What\'s included in the AI Vision analysis?', a: 'Upload any TradingView screenshot and our AI detects: trend direction, BOS, CHoCH, liquidity (buy-side/sell-side, swept/resting), order blocks (bullish/bearish, mitigated/unmitigated), Fair Value Gaps, equal highs/lows, premium/discount zones, and inducement levels. It then outputs a complete trade setup with bias, confidence, entry, SL, and TP.' },
    { q: 'Is my data secure?', a: 'Yes. We use JWT authentication, encrypted sessions, and bank-grade security. Your trade journal data is private to your account. We never share your data with third parties. The platform is GDPR compliant.' },
    { q: 'Can I cancel anytime?', a: 'Yes. All paid plans can be cancelled anytime with one click. We offer a 14-day money-back guarantee on all paid plans — if you\'re not satisfied, contact support for a full refund.' },
  ]
  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <PremiumBadge variant="electric" size="md" className="mb-3 px-3 py-1">
            <Sparkles className="w-3 h-3" /> FAQ
          </PremiumBadge>
          <h2 className="text-4xl lg:text-5xl font-bold font-display tracking-tight text-gradient-platinum">
            Questions? <span className="text-gradient-gold">Answered.</span>
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
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                >
                  <span className="text-sm font-semibold">{faq.q}</span>
                  <div className="w-7 h-7 rounded-lg glass flex items-center justify-center shrink-0">
                    {open === i ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================
   CTA — Strong call to action
   ============================================ */

function CTASection({ onNavigate }: { onNavigate: (s: string) => void }) {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 aurora" />
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative max-w-4xl mx-auto px-4 lg:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <PremiumBadge variant="gold" size="md" glow className="mb-4 px-3 py-1.5">
            <Crown className="w-3 h-3" /> Start Trading Smarter Today
          </PremiumBadge>
          <h2 className="text-4xl lg:text-6xl font-bold font-display tracking-tight mb-4">
            <span className="text-gradient-platinum">Ready to Trade with</span>
            <br />
            <span className="text-gradient-gold">AI Intelligence?</span>
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 47,800+ traders using Apex EA Pro. Free forever — no credit card required.
            Upgrade anytime for unlimited AI analysis.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <GlowButton size="xl" variant="gold" glow onClick={() => onNavigate('dashboard')}>
              <Zap className="w-4 h-4" /> Launch Free Dashboard
            </GlowButton>
            <AILEEngineButton onClick={() => onNavigate('aile')} />
            <GlowButton size="xl" variant="outline" onClick={() => onNavigate('chart-analysis')}>
              <Eye className="w-4 h-4" /> Try AI Vision
            </GlowButton>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-6 italic">
            Educational tool only — not financial advice. Trading involves substantial risk.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
