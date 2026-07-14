'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Brain, TrendingUp, TrendingDown, Minus, Target,
  Shield, Award, Clock, AlertOctagon, CheckCircle2, XCircle,
} from 'lucide-react'
import { GlassCard, SectionHeading, StatusBadge, ProgressBar } from '../primitives'
import { Button } from '@/components/ui/button'
import { useMarketStore } from '@/lib/hisab/market-store'
import { runMultiTimeframeAnalysis, generateTradeSetup } from '@/lib/hisab/mtf-analysis'
import { analyzeSMC } from '@/lib/hisab/smc-engine'
import { generateCoachExplanation } from '@/lib/hisab/ai-coach'
import { formatNumber } from '@/lib/hisab/risk-manager'
import type { TradeSetup, MTFAnalysis, SMCAnalysis } from '@/lib/types/hisab'
import { cn } from '@/lib/utils'

export function DecisionEngine() {
  // Do NOT subscribe to live candles/price — causes re-renders every tick.
  // Read from store snapshot only when analyzing.
  const [setup, setSetup] = React.useState<TradeSetup | null>(null)
  const [mtf, setMtf] = React.useState<MTFAnalysis | null>(null)
  const [smc, setSmc] = React.useState<SMCAnalysis | null>(null)
  const [coachText, setCoachText] = React.useState<string>('')
  const [generating, setGenerating] = React.useState(false)
  const hasInitialized = React.useRef(false)

  const analyze = React.useCallback(() => {
    setGenerating(true)
    setTimeout(() => {
      // Snapshot — don't track live updates
      const candlesSnapshot = useMarketStore.getState().candles
      const priceSnapshot = useMarketStore.getState().price?.last ?? 2650
      const mtfResult = runMultiTimeframeAnalysis(candlesSnapshot)
      const smcResult = analyzeSMC(candlesSnapshot['15M'], '15M')
      const setupResult = generateTradeSetup(smcResult, mtfResult, priceSnapshot)
      const coach = generateCoachExplanation(smcResult, setupResult, mtfResult)
      setMtf(mtfResult)
      setSmc(smcResult)
      setSetup(setupResult)
      setCoachText(coach)
      setGenerating(false)
    }, 600)
  }, []) // Empty deps — never auto-regenerates

  // Run once on mount only
  React.useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      analyze()
    }
  }, [analyze])

  if (!setup || !mtf) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#F5C542] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const biasColor = setup.bias === 'BUY' ? 'text-[#00E676]' : setup.bias === 'SELL' ? 'text-[#FF7252]' : 'text-[#F5C542]'
  const biasBg = setup.bias === 'BUY' ? 'from-[rgba(0, 230, 118, 0.15)] to-transparent' : setup.bias === 'SELL' ? 'from-[rgba(255, 82, 82, 0.15)] to-transparent' : 'from-[rgba(245, 197, 66, 0.1)] to-transparent'
  const biasIcon = setup.bias === 'BUY' ? <TrendingUp className="w-7 h-7" /> : setup.bias === 'SELL' ? <TrendingDown className="w-7 h-7" /> : <Minus className="w-7 h-7" />

  return (
    <div className="space-y-5">
      {/* Main decision card */}
      <GlassCard variant="strong" className={cn('p-6 bg-gradient-to-br', biasBg)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className={cn('w-14 h-14 rounded-xl glass flex items-center justify-center', biasColor)}>
              {biasIcon}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Market Bias</div>
              <div className={cn('text-3xl font-bold font-display', biasColor)}>{setup.bias}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Confidence</div>
              <div className="text-3xl font-mono font-bold text-[#FFC83D]">{setup.confidence}%</div>
            </div>
            <div className="w-px h-12 bg-border/40" />
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">R:R</div>
              <div className="text-3xl font-mono font-bold text-foreground">1:{setup.riskReward}</div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Probability Score</span>
            <span className="text-xs font-mono">{setup.confidence}/100</span>
          </div>
          <ProgressBar
            value={setup.confidence}
            color={setup.confidence > 70 ? 'bull' : setup.confidence < 40 ? 'bear' : 'gold'}
            height={10}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg p-3 bg-white/5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">
              <Clock className="w-3 h-3" /> Session
            </div>
            <div className="text-sm font-mono font-semibold mt-1">{setup.expectedSession.replace('_', ' ')}</div>
          </div>
          <div className="rounded-lg p-3 bg-white/5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">
              <Target className="w-3 h-3" /> Entry Optimal
            </div>
            <div className="text-sm font-mono font-semibold mt-1 text-[#FFC83D]">${formatNumber(setup.entryZone.optimal, 2)}</div>
          </div>
          <div className="rounded-lg p-3 bg-white/5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">
              <Shield className="w-3 h-3" /> Stop Loss
            </div>
            <div className="text-sm font-mono font-semibold mt-1 text-[#FF7252]">${formatNumber(setup.stopLoss, 2)}</div>
          </div>
          <div className="rounded-lg p-3 bg-white/5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">
              <Award className="w-3 h-3" /> TP1 / TP3
            </div>
            <div className="text-sm font-mono font-semibold mt-1 text-[#00E676]">
              ${formatNumber(setup.takeProfit1, 2)} · ${formatNumber(setup.takeProfit3, 2)}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Levels table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold font-display flex items-center gap-2">
              <Target className="w-4 h-4 text-[#FFC83D]" /> Trade Levels
            </h3>
            <StatusBadge variant="gold">XAUUSD · 15M</StatusBadge>
          </div>
          <div className="space-y-2">
            <LevelRow label="Entry Zone" value={`$${formatNumber(setup.entryZone.low, 2)} — $${formatNumber(setup.entryZone.high, 2)}`} variant="gold" />
            <LevelRow label="Optimal Entry" value={`$${formatNumber(setup.entryZone.optimal, 2)}`} variant="gold" />
            <LevelRow label="Stop Loss" value={`$${formatNumber(setup.stopLoss, 2)}`} variant="bear" />
            <LevelRow label="Take Profit 1" value={`$${formatNumber(setup.takeProfit1, 2)}`} variant="bull" sub="1R" />
            <LevelRow label="Take Profit 2" value={`$${formatNumber(setup.takeProfit2, 2)}`} variant="bull" sub="2R" />
            <LevelRow label="Take Profit 3" value={`$${formatNumber(setup.takeProfit3, 2)}`} variant="bull" sub="3R" />
          </div>
          <div className="mt-4 pt-3 border-t border-border/30 grid grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Risk Distance</div>
              <div className="text-sm font-mono font-semibold">${formatNumber(Math.abs(setup.entryZone.optimal - setup.stopLoss), 2)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Reward (TP1)</div>
              <div className="text-sm font-mono font-semibold text-[#00E676]">${formatNumber(Math.abs(setup.takeProfit1 - setup.entryZone.optimal), 2)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Risk:Reward</div>
              <div className="text-sm font-mono font-semibold text-[#FFC83D]">1:{setup.riskReward}</div>
            </div>
          </div>
        </GlassCard>

        {/* Invalidation */}
        <GlassCard variant="gold" className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold font-display flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-[#FF5252]" /> Trade Invalidation
            </h3>
            <StatusBadge variant="danger">CRITICAL</StatusBadge>
          </div>
          <div className="p-3 rounded-lg bg-[rgba(255, 82, 82, 0.08)] border border-[rgba(255, 82, 82, 0.25)]">
            <p className="text-sm leading-relaxed">{setup.invalidation}</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Invalidation Levels</div>
            {setup.invalidationLevels.map((lvl, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-md bg-white/5">
                <span className="text-xs text-muted-foreground">Level {i + 1}</span>
                <span className="font-mono font-medium text-[#FF7252]">${formatNumber(lvl, 2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-2.5 rounded-md bg-[rgba(255, 82, 82, 0.05)] border border-[rgba(255, 82, 82, 0.15)]">
            <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <XCircle className="w-3.5 h-3.5 text-[#FF5252] mt-0.5 shrink-0" />
              <span>Never move stop loss against the trade. Invalidation = exit immediately.</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Reasons */}
      <GlassCard className="p-5">
        <h3 className="text-base font-semibold font-display flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-[#FFC83D]" /> Why This Setup?
        </h3>
        <div className="space-y-2">
          {setup.reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2.5 p-2.5 rounded-md bg-white/5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#00E676] mt-0.5 shrink-0" />
              <span className="text-sm">{reason}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* MTF summary */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold font-display flex items-center gap-2">
            <Target className="w-4 h-4 text-[#FFC83D]" /> Multi-Timeframe Alignment
          </h3>
          <StatusBadge variant={mtf.overallBias === 'BUY' ? 'bull' : mtf.overallBias === 'SELL' ? 'bear' : 'neutral'}>
            {mtf.overallBias} · {mtf.alignment}%
          </StatusBadge>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {[mtf.monthly, mtf.weekly, mtf.daily, mtf.h4, mtf.h1, mtf.m15, mtf.m5, mtf.m1].map((tf, i) => (
            <div key={i} className="rounded-lg p-2 bg-white/5 text-center">
              <div className="text-[10px] uppercase text-muted-foreground font-mono">{tf.timeframe}</div>
              <div className={cn('text-sm font-semibold mt-1', tf.bias === 'BUY' ? 'text-[#00E676]' : tf.bias === 'SELL' ? 'text-[#FF7252]' : 'text-muted-foreground')}>
                {tf.bias === 'BUY' ? '↑' : tf.bias === 'SELL' ? '↓' : '—'}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Coach */}
      <GlassCard variant="gold" className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFC83D] to-[#F5C542] flex items-center justify-center">
            <Brain className="w-4 h-4 text-[#1A1A1A]" />
          </div>
          <div>
            <h3 className="text-base font-semibold font-display">AI Coach Explanation</h3>
            <p className="text-xs text-muted-foreground">Mentor-style breakdown of the setup</p>
          </div>
        </div>
        <div className="prose prose-sm max-w-none">
          {coachText.split('. ').map((sentence, i, arr) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="text-sm leading-relaxed text-foreground/90 mb-2"
            >
              {sentence}{i < arr.length - 1 ? '.' : ''}
            </motion.p>
          ))}
        </div>
      </GlassCard>

      <div className="text-[11px] text-muted-foreground italic text-center">
        ⚠ This is a probability-based educational analysis. Not financial advice. Never risk more than you can afford to lose.
      </div>
    </div>
  )
}

function LevelRow({ label, value, variant, sub }: {
  label: string
  value: string
  variant: 'bull' | 'bear' | 'gold' | 'neutral'
  sub?: string
}) {
  const colors = {
    bull: 'text-[#00E676] border-[rgba(0, 230, 118, 0.20)] bg-[rgba(0, 200, 83, 0.05)]',
    bear: 'text-[#FF7252] border-[rgba(255, 82, 82, 0.20)] bg-[rgba(255, 82, 82, 0.05)]',
    gold: 'text-[#FFC83D] border-[rgba(245, 197, 66, 0.20)] bg-[rgba(245, 197, 66, 0.05)]',
    neutral: 'text-foreground border-border/30 bg-white/5',
  }
  return (
    <div className={cn('flex items-center justify-between gap-2 p-2.5 rounded-md border', colors[variant])}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-semibold text-sm">{value}</span>
        {sub && <StatusBadge variant="neutral">{sub}</StatusBadge>}
      </div>
    </div>
  )
}
