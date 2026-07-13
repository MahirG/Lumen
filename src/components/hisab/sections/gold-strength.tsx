'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Gauge, DollarSign, Percent, TrendingUp, TrendingDown, Activity, Shield } from 'lucide-react'
import { GlassCard, SectionHeading, StatusBadge, ProgressBar } from '../primitives'
import { computeGoldStrength, getRawInputs, getStrengthLabel, getStrengthColor } from '@/lib/hisab/gold-strength'
import { formatNumber } from '@/lib/hisab/risk-manager'
import { cn } from '@/lib/utils'

export function GoldStrengthMeter() {
  const [strength, setStrength] = React.useState(() => computeGoldStrength(getRawInputs()))
  const [realDxy, setRealDxy] = React.useState<number | null>(null)
  const [dxySource, setDxySource] = React.useState<string>('demo')

  // Fetch real DXY from our /api/price endpoint (computed from forex rates)
  const fetchRealDxy = React.useCallback(async () => {
    try {
      const res = await fetch('/api/price', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (data.forex?.dxy && typeof data.forex.dxy === 'number') {
        setRealDxy(data.forex.dxy)
        setDxySource('live')
      }
    } catch (err) {
      console.warn('Failed to fetch real DXY:', err)
    }
  }, [])

  React.useEffect(() => {
    fetchRealDxy()
    const interval = setInterval(fetchRealDxy, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [fetchRealDxy])

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStrength(computeGoldStrength(getRawInputs(Date.now(), realDxy ?? undefined)))
    }, 5000)
    return () => clearInterval(interval)
  }, [realDxy])

  const scoreColor = getStrengthColor(strength.score)

  return (
    <div className="space-y-5">
      {/* Main strength meter */}
      <GlassCard variant="strong" className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-56 h-56">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                {/* Background arc */}
                <circle
                  cx="100" cy="100" r="85"
                  fill="none"
                  stroke="oklch(1 0 0 / 5%)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="400 600"
                />
                {/* Value arc */}
                <motion.circle
                  cx="100" cy="100" r="85"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="400 600"
                  initial={{ strokeDashoffset: 400 }}
                  animate={{ strokeDashoffset: 400 - (strength.score / 100) * 400 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ filter: `drop-shadow(0 0 12px ${scoreColor}80)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Strength</div>
                <div className="text-5xl font-bold font-mono" style={{ color: scoreColor }}>
                  {Math.round(strength.score)}
                </div>
                <div className="text-xs font-medium mt-1" style={{ color: scoreColor }}>
                  {getStrengthLabel(strength.label)}
                </div>
              </div>
            </div>
            <StatusBadge
              variant={strength.direction === 'BULLISH' ? 'bull' : strength.direction === 'BEARISH' ? 'bear' : 'neutral'}
            >
              {strength.direction === 'BULLISH' && <TrendingUp className="w-3 h-3" />}
              {strength.direction === 'BEARISH' && <TrendingDown className="w-3 h-3" />}
              {strength.direction}
            </StatusBadge>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold font-display flex items-center gap-2 mb-3">
              <Gauge className="w-5 h-5 text-[oklch(0.92_0.14_85)]" /> Gold Strength Analysis
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed mb-4">{strength.summary}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5 border border-border/30">
                <div className="text-[10px] uppercase text-muted-foreground">Direction</div>
                <div className="text-sm font-semibold mt-1" style={{ color: scoreColor }}>{strength.direction}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-border/30">
                <div className="text-[10px] uppercase text-muted-foreground">Label</div>
                <div className="text-sm font-semibold mt-1" style={{ color: scoreColor }}>{getStrengthLabel(strength.label)}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-border/30">
                <div className="text-[10px] uppercase text-muted-foreground">Score</div>
                <div className="text-sm font-mono font-semibold mt-1" style={{ color: scoreColor }}>{Math.round(strength.score)}/100</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-border/30">
                <div className="text-[10px] uppercase text-muted-foreground">Bias impact</div>
                <div className="text-sm font-semibold mt-1">
                  {strength.direction === 'BULLISH' ? 'Favors longs' : strength.direction === 'BEARISH' ? 'Favors shorts' : 'Neutral'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Component breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ComponentCard
          icon={<DollarSign className="w-4 h-4" />}
          title={`DXY (US Dollar Index)${dxySource === 'live' ? ' · LIVE' : ''}`}
          value={formatNumber(strength.components.dxy.value, 2)}
          change={strength.components.dxy.change}
          impact={strength.components.dxy.impact}
          note={dxySource === 'live' ? 'Real DXY computed from live forex rates' : 'Inverse correlation with gold'}
          delay={0}
        />
        <ComponentCard
          icon={<Percent className="w-4 h-4" />}
          title="US 10Y Treasury Yield"
          value={`${formatNumber(strength.components.us10y.value, 2)}%`}
          change={strength.components.us10y.change}
          impact={strength.components.us10y.impact}
          note="Opportunity cost for non-yielding gold"
          delay={0.1}
        />
        <ComponentCard
          icon={<Activity className="w-4 h-4" />}
          title="Interest Rate Outlook"
          value={strength.components.interestRates.trend}
          impact={strength.components.interestRates.impact}
          note={`10Y yield ${formatNumber(strength.components.interestRates.value, 2)}%`}
          delay={0.2}
        />
        <ComponentCard
          icon={<TrendingUp className="w-4 h-4" />}
          title="Volatility (VIX)"
          value={formatNumber(strength.components.volatility.value, 1)}
          impact={strength.components.volatility.impact}
          note={`${Math.round(strength.components.volatility.percentile)}th percentile`}
          delay={0.3}
        />
        <ComponentCard
          icon={<Shield className="w-4 h-4" />}
          title="Safe Haven Demand"
          value={`${Math.round(strength.components.safeHaven.value)}/100`}
          impact={strength.components.safeHaven.impact}
          note="Geopolitical & risk sentiment"
          delay={0.4}
        />
        <GlassCard variant="gold" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4 text-[oklch(0.92_0.14_85)]" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Overall Score</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-2" style={{ color: scoreColor }}>
            {Math.round(strength.score)}/100
          </div>
          <ProgressBar value={strength.score} color={strength.direction === 'BULLISH' ? 'bull' : strength.direction === 'BEARISH' ? 'bear' : 'gold'} height={8} />
          <div className="mt-2 text-[11px] text-muted-foreground">{getStrengthLabel(strength.label)}</div>
        </GlassCard>
      </div>
    </div>
  )
}

interface ComponentCardProps {
  icon: React.ReactNode
  title: string
  value: string
  change?: number
  impact: number
  note: string
  delay: number
}

function ComponentCard({ icon, title, value, change, impact, note, delay }: ComponentCardProps) {
  const impactColor = impact > 5 ? 'oklch(0.72 0.18 145)' : impact < -5 ? 'oklch(0.66 0.22 25)' : 'oklch(0.75 0.02 60)'
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <GlassCard className="p-4" hover>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <span className="text-xs uppercase tracking-wider font-medium">{title}</span>
          </div>
          <StatusBadge variant={impact > 5 ? 'bull' : impact < -5 ? 'bear' : 'neutral'}>
            {impact > 0 ? '+' : ''}{impact.toFixed(0)}
          </StatusBadge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-mono font-bold" style={{ color: impactColor }}>{value}</span>
          {change !== undefined && (
            <span className={cn('text-xs font-mono', change >= 0 ? 'text-[oklch(0.72_0.18_145)]' : 'text-[oklch(0.66_0.22_25)]')}>
              {change >= 0 ? '+' : ''}{formatNumber(change, 2)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">{note}</p>
      </GlassCard>
    </motion.div>
  )
}
