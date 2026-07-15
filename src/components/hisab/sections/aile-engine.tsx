'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, TrendingUp, TrendingDown, Minus, Target, Shield, Award,
  Clock, AlertOctagon, CheckCircle2, XCircle, Activity, Layers,
  Waves, Sparkles, Zap, Crown, RefreshCw, AlertTriangle,
  ArrowUpCircle, ArrowDownCircle, DollarSign, BarChart3,
} from 'lucide-react'
import { LiquidGlassCard, GlowButton, PremiumBadge, PremiumProgress, SectionHeading, StatusBadge } from '../primitives'
import { useMarketStore } from '@/lib/hisab/market-store'
import { runAILEAnalysis } from '@/lib/hisab/aile-engine'
import { formatNumber } from '@/lib/hisab/risk-manager'
import type { AILEAnalysis, AILEOutput } from '@/lib/types/aile'
import { SmartChartVisualization, generateSampleSmartChartData } from '../smart-chart'
import { cn } from '@/lib/utils'

export function AILEEngine() {
  // Do NOT subscribe to live candles/price — causes re-renders every tick.
  // Read from store snapshot only when running analysis.
  const [analysis, setAnalysis] = React.useState<AILEAnalysis | null>(null)
  const [generating, setGenerating] = React.useState(false)
  const hasInitialized = React.useRef(false)

  const runAnalysis = React.useCallback(() => {
    setGenerating(true)
    setTimeout(() => {
      // Snapshot — don't track live updates
      const candlesSnapshot = useMarketStore.getState().candles
      const priceSnapshot = useMarketStore.getState().price?.last
      const result = runAILEAnalysis(candlesSnapshot, priceSnapshot)
      setAnalysis(result)
      setGenerating(false)
    }, 500)
  }, []) // Empty deps — never auto-regenerates

  // Run once on mount only
  React.useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      runAnalysis()
    }
  }, [runAnalysis])

  if (!analysis) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#F5C542] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-muted-foreground">Running 12-phase institutional analysis...</span>
      </div>
    )
  }

  const output = analysis.phase12
  const isWait = output.marketBias === 'WAIT'

  return (
    <div className="space-y-5">
      {/* Master Output Card — Phase 12 */}
      <AILEOutputCard output={output} analysis={analysis} onRefresh={runAnalysis} generating={generating} />

      {/* Smart Chart Visualization — AI institutional analysis chart */}
      <LiquidGlassCard className="p-4 lg:p-5">
        <SmartChartVisualization
          data={generateSampleSmartChartData(analysis.currentPrice ?? 4000)}
          symbol="XAUUSD"
          timeframe="H1"
        />
      </LiquidGlassCard>

      {/* Entry Conditions Checklist — Phase 7 */}
      <EntryConditionsCard phase7={analysis.phase7} />

      {/* Trade Levels — Phases 8 & 9 */}
      {!isWait && analysis.phase8to9 && (
        <TradeLevelsCard rm={analysis.phase8to9} output={output} />
      )}

      {/* 12-Phase Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Phase1Card htf={analysis.phase1} />
        <Phase2Card phase2={analysis.phase2} currentPrice={analysis.currentPrice} />
        <Phase3Card fib={analysis.phase3} currentPrice={analysis.currentPrice} />
        <Phase4Card liq={analysis.phase4} />
        <Phase5Card structure={analysis.phase5} />
        <Phase6Card obDetection={analysis.phase6} />
        <Phase10Card management={analysis.phase10} isWait={isWait} />
        <Phase11Card confidence={analysis.phase11} />
      </div>

      {/* Narrative */}
      <LiquidGlassCard variant="gold" className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFC83D] to-[#F5C542] flex items-center justify-center">
            <Brain className="w-4 h-4 text-[#0B0F19]" />
          </div>
          <div>
            <h3 className="text-base font-semibold font-display">Institutional Narrative</h3>
            <p className="text-xs text-muted-foreground">Full 12-phase analysis explanation</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{output.narrative}</p>
      </LiquidGlassCard>

      {/* Educational Disclaimer */}
      <div className="text-[11px] text-muted-foreground italic text-center px-4">
        {output.educationalNote}
      </div>
    </div>
  )
}

// ============================================================
// MASTER OUTPUT CARD (Phase 12)
// ============================================================

function AILEOutputCard({ output, analysis, onRefresh, generating }: {
  output: AILEOutput
  analysis: AILEAnalysis
  onRefresh: () => void
  generating: boolean
}) {
  const isWait = output.marketBias === 'WAIT'
  const biasColor = output.marketBias === 'BUY'
    ? 'text-[#00E676]'
    : output.marketBias === 'SELL'
    ? 'text-[#FF7252]'
    : 'text-[#F5C542]'
  const biasBg = output.marketBias === 'BUY'
    ? 'from-[rgba(0, 230, 118, 0.15)] to-transparent'
    : output.marketBias === 'SELL'
    ? 'from-[rgba(255, 82, 82, 0.15)] to-transparent'
    : 'from-[rgba(245, 197, 66, 0.1)] to-transparent'
  const biasIcon = output.marketBias === 'BUY'
    ? <TrendingUp className="w-7 h-7 md:w-8 md:h-8" />
    : output.marketBias === 'SELL'
    ? <TrendingDown className="w-7 h-7 md:w-8 md:h-8" />
    : <Minus className="w-7 h-7 md:w-8 md:h-8" />

  return (
    <LiquidGlassCard variant="strong" glow className={cn('p-5 md:p-6 bg-gradient-to-br', biasBg)}>
      {/* Prominent signal banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'mb-5 p-4 rounded-xl border-2 text-center',
          isWait
            ? 'bg-[rgba(245, 197, 66, 0.08)] border-[rgba(245, 197, 66, 0.3)]'
            : output.marketBias === 'BUY'
            ? 'bg-[rgba(0, 200, 83, 0.1)] border-[rgba(0, 200, 83, 0.35)]'
            : 'bg-[rgba(255, 82, 82, 0.10)] border-[rgba(255, 82, 82, 0.35)]',
        )}
      >
        <div className="flex flex-col sm:flex-row items-center sm:justify-center gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('w-12 h-12 rounded-xl liquid-glass flex items-center justify-center shrink-0', biasColor)}>
              {biasIcon}
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">AILE v1.0 Signal</div>
              <div className={cn('text-4xl sm:text-5xl md:text-6xl font-bold font-display leading-none', biasColor)}>
                {output.marketBias}
              </div>
            </div>
          </div>
          <div className="sm:ml-auto text-center sm:text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</div>
            <div className={cn('text-2xl sm:text-3xl md:text-4xl font-mono font-bold', isWait ? 'text-muted-foreground' : 'text-[#FFC83D]')}>
              {output.confidence}%
            </div>
            <PremiumBadge variant={output.confidenceLabel === 'A_PLUS' ? 'gold' : output.confidenceLabel === 'A' ? 'bull' : output.confidenceLabel === 'B' ? 'info' : 'neutral'} size="sm" className="mt-1">
              {output.confidenceLabel === 'A_PLUS' && <Crown className="w-2.5 h-2.5" />}
              {output.confidenceLabel === 'A' && <Award className="w-2.5 h-2.5" />}
              {output.confidenceLabel === 'WAIT' && <Clock className="w-2.5 h-2.5" />}
              {output.confidenceLabel}
            </PremiumBadge>
          </div>
        </div>
        {isWait && (
          <div className="mt-3 pt-3 border-t border-white/[6%] flex items-center justify-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-[#F5C542] animate-pulse" />
            <span className="font-semibold text-[#F5C542]">WAIT — {8 - analysis.phase7.missing.length}/8 conditions met. Patience is edge.</span>
          </div>
        )}
      </motion.div>

      {/* Secondary info row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono font-semibold text-foreground">{analysis.symbol}</span>
          <span>·</span>
          <span className="font-mono">${formatNumber(analysis.currentPrice, 2)}</span>
          <span>·</span>
          <span>{analysis.phase1.primaryTrend}</span>
          <span>·</span>
          <span className="text-[#F5C542]">{analysis.phase1.institutionalBias}</span>
        </div>
        <GlowButton variant="outline" size="sm" onClick={onRefresh} disabled={generating}>
          <RefreshCw className={cn('w-3.5 h-3.5', generating && 'animate-spin')} />
          Re-run Analysis
        </GlowButton>
      </div>

      {/* Output grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <OutputStat label="Trend" value={output.trend} icon={<Activity className="w-3 h-3" />} />
        <OutputStat label="Liquidity Type" value={output.liquidityType} icon={<Waves className="w-3 h-3" />} small />
        <OutputStat label="Structure" value={output.structure} icon={<Layers className="w-3 h-3" />} small />
        <OutputStat label="Expected Session" value={output.expectedSession.replace('_', ' ')} icon={<Clock className="w-3 h-3" />} />
        <OutputStat label="Key Level" value={output.keyLevel ? `$${formatNumber(output.keyLevel.price, 2)}` : '—'} icon={<Target className="w-3 h-3" />} />
        <OutputStat label="Order Block" value={output.orderBlock ? `${output.orderBlock.rank} (${output.orderBlock.type})` : '—'} icon={<BarChart3 className="w-3 h-3" />} small />
        <OutputStat label="Fibonacci Zone" value={output.fibonacciZone} icon={<Target className="w-3 h-3" />} small />
        <OutputStat label="Risk:Reward" value={output.riskReward ? `1:${formatNumber(output.riskReward, 2)}` : '—'} icon={<Shield className="w-3 h-3" />} />
      </div>
    </LiquidGlassCard>
  )
}

function OutputStat({ label, value, icon, small }: { label: string; value: string; icon: React.ReactNode; small?: boolean }) {
  return (
    <div className="p-3 rounded-lg bg-white/[4%] border border-white/[6%]">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {icon}{label}
      </div>
      <div className={cn('font-mono font-semibold', small ? 'text-[11px]' : 'text-sm')}>{value}</div>
    </div>
  )
}

// ============================================================
// ENTRY CONDITIONS CHECKLIST (Phase 7)
// ============================================================

function EntryConditionsCard({ phase7 }: { phase7: AILEAnalysis['phase7'] }) {
  const conditions = [
    { label: 'HTF Bias Alignment', met: phase7.htfBias, icon: TrendingUp },
    { label: 'Key Level Confluence', met: phase7.keyLevel, icon: Target },
    { label: 'Liquidity Sweep', met: phase7.liquiditySweep, icon: Waves },
    { label: 'BOS / CHoCH', met: phase7.bosOrChoch, icon: Layers },
    { label: 'Institutional OB (A+/A)', met: phase7.institutionalOB, icon: BarChart3 },
    { label: 'Fibonacci Confluence (OTE)', met: phase7.fibConfluence, icon: Sparkles },
    { label: 'Premium/Discount Alignment', met: phase7.premiumDiscountAlignment, icon: DollarSign },
    { label: 'Clean R:R (≥ 1:2)', met: phase7.cleanRR, icon: Shield },
  ]
  const metCount = conditions.filter(c => c.met).length

  return (
    <LiquidGlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold font-display flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#F5C542]" /> Phase 7 — Entry Conditions
        </h3>
        <PremiumBadge variant={phase7.allMet ? 'bull' : 'neutral'}>
          {metCount}/8 {phase7.allMet ? '✓ ALL MET' : 'MET'}
        </PremiumBadge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {conditions.map((cond, i) => {
          const Icon = cond.icon
          return (
            <motion.div
              key={cond.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'flex items-center gap-2.5 p-2.5 rounded-lg border transition-all',
                cond.met
                  ? 'bg-[rgba(0, 200, 83, 0.08)] border-[rgba(0, 230, 118, 0.20)]'
                  : 'bg-white/[3%] border-white/[6%]',
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
                cond.met ? 'bg-[rgba(0, 230, 118, 0.15)]' : 'bg-white/[5%]',
              )}>
                {cond.met
                  ? <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
                  : <XCircle className="w-4 h-4 text-muted-foreground" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  {cond.label}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      {!phase7.allMet && phase7.missing.length > 0 && (
        <div className="mt-3 p-2.5 rounded-md bg-[rgba(245, 197, 66, 0.05)] border border-[rgba(245, 197, 66, 0.15)]">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Missing Conditions</div>
          <p className="text-xs text-foreground/80">{phase7.missing.join(' · ')}</p>
        </div>
      )}
    </LiquidGlassCard>
  )
}

// ============================================================
// TRADE LEVELS (Phases 8 & 9)
// ============================================================

function TradeLevelsCard({ rm, output }: { rm: NonNullable<AILEAnalysis['phase8to9']>; output: AILEOutput }) {
  return (
    <LiquidGlassCard variant="gold" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold font-display flex items-center gap-2">
          <Target className="w-4 h-4 text-[#FFC83D]" /> Trade Execution Levels
        </h3>
        <PremiumBadge variant="gold">{output.marketBias} · 1:{formatNumber(rm.rr1, 2)}</PremiumBadge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <LevelBox label="Entry" value={`$${formatNumber(rm.entry, 2)}`} variant="gold" />
        <LevelBox label="Stop Loss" value={`$${formatNumber(rm.stopLoss, 2)}`} variant="bear" sub="below/above sweep" />
        <LevelBox label="TP1 (Internal Liq)" value={`$${formatNum(rm.tp1)}`} variant="bull" sub={`1:${formatNumber(rm.rr1, 2)} → BE`} />
        <LevelBox label="TP2 (Opposing Liq)" value={`$${formatNum(rm.tp2)}`} variant="bull" sub={`1:${formatNumber(rm.rr2, 2)} → partial`} />
        <LevelBox label="TP3 (HTF Target)" value={`$${formatNum(rm.tp3)}`} variant="bull" sub={`1:${formatNumber(rm.rr3, 2)} → runner`} />
        <LevelBox label="Risk Distance" value={`$${formatNumber(rm.riskDistance, 2)}`} variant="neutral" />
      </div>
      <div className="mt-3 p-2.5 rounded-md bg-[rgba(255, 82, 82, 0.08)] border border-[rgba(255, 82, 82, 0.20)]">
        <div className="flex items-start gap-2 text-xs">
          <AlertOctagon className="w-3.5 h-3.5 text-[#FF7252] mt-0.5 shrink-0" />
          <span className="text-foreground/90">{output.invalidation}</span>
        </div>
      </div>
    </LiquidGlassCard>
  )
}

function LevelBox({ label, value, variant, sub }: { label: string; value: string; variant: 'bull' | 'bear' | 'gold' | 'neutral'; sub?: string }) {
  const colors = {
    bull: 'text-[#00E676] border-[rgba(0, 230, 118, 0.20)] bg-[rgba(0, 200, 83, 0.05)]',
    bear: 'text-[#FF7252] border-[rgba(255, 82, 82, 0.20)] bg-[rgba(255, 82, 82, 0.05)]',
    gold: 'text-[#FFC83D] border-[rgba(245, 197, 66, 0.20)] bg-[rgba(245, 197, 66, 0.05)]',
    neutral: 'text-foreground border-white/[10%] bg-white/[3%]',
  }
  return (
    <div className={cn('p-2.5 rounded-lg border', colors[variant])}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-mono font-semibold mt-0.5">{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  )
}

// ============================================================
// PHASE 1 — HTF CONTEXT
// ============================================================

function Phase1Card({ htf }: { htf: AILEAnalysis['phase1'] }) {
  const tfs = [htf.monthly, htf.weekly, htf.daily, htf.h4, htf.h1]
  return (
    <LiquidGlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[rgba(245, 197, 66, 0.15)] text-[#FFC83D] text-[10px] font-mono font-bold flex items-center justify-center">1</span>
          Higher Timeframe Context
        </h4>
        <PremiumBadge variant={htf.aligned ? 'bull' : 'neutral'} size="sm">
          {htf.aligned ? 'ALIGNED' : 'MIXED'}
        </PremiumBadge>
      </div>
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {tfs.map(tf => (
          <div key={tf.timeframe} className="text-center p-2 rounded-md bg-white/[4%]">
            <div className="text-[10px] uppercase text-muted-foreground font-mono">{tf.timeframe}</div>
            <div className={cn('text-xs font-bold mt-1',
              tf.bias === 'BULLISH' ? 'text-[#00E676]' :
              tf.bias === 'BEARISH' ? 'text-[#FF7252]' :
              'text-muted-foreground'
            )}>
              {tf.bias === 'BULLISH' ? '↑' : tf.bias === 'BEARISH' ? '↓' : '—'}
            </div>
            <div className="text-[9px] text-muted-foreground mt-0.5">{tf.premiumDiscount[0]}</div>
          </div>
        ))}
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Primary Trend</span><span className="font-mono font-medium">{htf.primaryTrend}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Institutional Bias</span><span className="font-mono font-medium">{htf.institutionalBias}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">P/D Zone</span><span className="font-mono font-medium">{htf.premiumDiscount}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Swing H/L</span><span className="font-mono font-medium">${formatNumber(htf.majorSwingHigh, 0)} / ${formatNumber(htf.majorSwingLow, 0)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Key Levels</span><span className="font-mono font-medium">{htf.keyLevels.length}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Inst. OBs</span><span className="font-mono font-medium">{htf.institutionalOrderBlocks.filter(o => o.rank !== 'REJECT').length}</span></div>
      </div>
    </LiquidGlassCard>
  )
}

// ============================================================
// PHASE 2 — KEY LEVEL VALIDATION
// ============================================================

function Phase2Card({ phase2, currentPrice }: { phase2: AILEAnalysis['phase2']; currentPrice: number }) {
  return (
    <LiquidGlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[rgba(245, 197, 66, 0.15)] text-[#FFC83D] text-[10px] font-mono font-bold flex items-center justify-center">2</span>
          Key Level Validation
        </h4>
        <PremiumBadge variant={phase2.atKeyLevel ? 'bull' : 'neutral'} size="sm">
          {phase2.atKeyLevel ? 'AT LEVEL' : 'NOT AT LEVEL'}
        </PremiumBadge>
      </div>
      {phase2.level ? (
        <div className="space-y-2">
          <div className="p-2.5 rounded-md bg-white/[4%] border border-white/[6%]">
            <div className="text-[10px] uppercase text-muted-foreground">{phase2.level.type.replace('_', ' ')}</div>
            <div className="text-sm font-mono font-semibold mt-0.5">${formatNumber(phase2.level.price, 2)}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{phase2.level.description}</div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Confluence</span>
            <span className="font-mono font-medium">{phase2.confluence} overlap(s)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Current Price</span>
            <span className="font-mono font-medium">${formatNumber(currentPrice, 2)}</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">No key levels identified.</p>
      )}
      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{phase2.description}</p>
    </LiquidGlassCard>
  )
}

// ============================================================
// PHASE 3 — FIBONACCI FRAMEWORK
// ============================================================

function Phase3Card({ fib, currentPrice }: { fib: AILEAnalysis['phase3']; currentPrice: number }) {
  return (
    <LiquidGlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[rgba(245, 197, 66, 0.15)] text-[#FFC83D] text-[10px] font-mono font-bold flex items-center justify-center">3</span>
          Fibonacci Framework
        </h4>
        <PremiumBadge variant={fib.inOTE ? 'gold' : fib.inDiscount ? 'bull' : fib.inPremium ? 'bear' : 'neutral'} size="sm">
          {fib.inOTE ? 'IN OTE' : fib.inDiscount ? 'DISCOUNT' : fib.inPremium ? 'PREMIUM' : 'EQUILIBRIUM'}
        </PremiumBadge>
      </div>
      <div className="space-y-1.5">
        {fib.levels.map(level => {
          const isCurrent = Math.abs(level.price - currentPrice) < (fib.swingHigh - fib.swingLow) * 0.03
          return (
            <div key={level.label} className={cn(
              'flex items-center justify-between p-1.5 rounded-md text-xs transition-all',
              level.zone === 'OTE' ? 'bg-[rgba(245, 197, 66, 0.08)] border border-[rgba(245, 197, 66, 0.20)]' : 'bg-white/[3%]',
              isCurrent && 'ring-1 ring-[rgba(245, 197, 66, 0.40)]',
            )}>
              <span className="font-mono font-medium text-muted-foreground">{level.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">${formatNumber(level.price, 2)}</span>
                {level.zone === 'OTE' && <PremiumBadge variant="gold" size="xs">OTE</PremiumBadge>}
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#FFC83D] animate-pulse" />}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 pt-2 border-t border-white/[6%] text-[10px] text-muted-foreground">
        OTE Zone (0.618-0.79): ${formatNumber(fib.oteZone.low, 2)} - ${formatNumber(fib.oteZone.high, 2)}
      </div>
    </LiquidGlassCard>
  )
}

// ============================================================
// PHASE 4 — LIQUIDITY CONFIRMATION
// ============================================================

function Phase4Card({ liq }: { liq: AILEAnalysis['phase4'] }) {
  return (
    <LiquidGlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[rgba(245, 197, 66, 0.15)] text-[#FFC83D] text-[10px] font-mono font-bold flex items-center justify-center">4</span>
          Liquidity Confirmation
        </h4>
        <PremiumBadge variant={liq.liquidityEngineered ? 'bull' : 'neutral'} size="sm">
          {liq.liquidityEngineered ? 'ENGINEERED' : 'WAITING'}
        </PremiumBadge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div className="p-2 rounded-md bg-white/[4%]">
          <div className="text-[10px] uppercase text-muted-foreground">Buy-Side Liq</div>
          <div className="font-mono font-semibold mt-0.5">{liq.buySideLiquidity.length}</div>
        </div>
        <div className="p-2 rounded-md bg-white/[4%]">
          <div className="text-[10px] uppercase text-muted-foreground">Sell-Side Liq</div>
          <div className="font-mono font-semibold mt-0.5">{liq.sellSideLiquidity.length}</div>
        </div>
        <div className="p-2 rounded-md bg-white/[4%]">
          <div className="text-[10px] uppercase text-muted-foreground">Sweeps</div>
          <div className="font-mono font-semibold mt-0.5 text-[#FFC83D]">{liq.liquiditySweeps.length}</div>
        </div>
        <div className="p-2 rounded-md bg-white/[4%]">
          <div className="text-[10px] uppercase text-muted-foreground">Stop Hunts</div>
          <div className="font-mono font-semibold mt-0.5 text-[#FF7252]">{liq.stopHunts.length}</div>
        </div>
      </div>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-muted-foreground">Sweep Direction</span>
        <span className={cn('font-mono font-medium',
          liq.sweepDirection === 'BULLISH' ? 'text-[#00E676]' :
          liq.sweepDirection === 'BEARISH' ? 'text-[#FF7252]' :
          'text-muted-foreground'
        )}>{liq.sweepDirection}</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{liq.description}</p>
    </LiquidGlassCard>
  )
}

// ============================================================
// PHASE 5 — STRUCTURE CONFIRMATION
// ============================================================

function Phase5Card({ structure }: { structure: AILEAnalysis['phase5'] }) {
  return (
    <LiquidGlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[rgba(245, 197, 66, 0.15)] text-[#FFC83D] text-[10px] font-mono font-bold flex items-center justify-center">5</span>
          Structure Confirmation
        </h4>
        <PremiumBadge variant={structure.confirmed ? 'bull' : 'neutral'} size="sm">
          {structure.confirmed ? 'CONFIRMED' : 'NOT CONFIRMED'}
        </PremiumBadge>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Event Type</span><span className="font-mono font-medium">{structure.eventType}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Direction</span><span className={cn('font-mono font-medium',
          structure.direction === 'BULLISH' ? 'text-[#00E676]' :
          structure.direction === 'BEARISH' ? 'text-[#FF7252]' :
          'text-muted-foreground'
        )}>{structure.direction}</span></div>
        {structure.price > 0 && (
          <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-mono font-medium">${formatNumber(structure.price, 2)}</span></div>
        )}
        <div className="flex justify-between"><span className="text-muted-foreground">Strong</span><span className="font-mono font-medium">{structure.strong ? 'YES' : 'NO'}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Candle Close</span><span className="font-mono font-medium">{structure.candleClose ? 'YES' : 'NO'}</span></div>
      </div>
      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{structure.description}</p>
    </LiquidGlassCard>
  )
}

// ============================================================
// PHASE 6 — ORDER BLOCK DETECTION
// ============================================================

function Phase6Card({ obDetection }: { obDetection: AILEAnalysis['phase6'] }) {
  return (
    <LiquidGlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[rgba(245, 197, 66, 0.15)] text-[#FFC83D] text-[10px] font-mono font-bold flex items-center justify-center">6</span>
          Order Block Detection
        </h4>
        <PremiumBadge variant={obDetection.bestOB?.rank === 'A_PLUS' ? 'gold' : obDetection.bestOB?.rank === 'A' ? 'bull' : 'neutral'} size="sm">
          {obDetection.bestOB ? `BEST: ${obDetection.bestOB.rank}` : 'NO QUALIFYING OB'}
        </PremiumBadge>
      </div>
      {obDetection.bestOB ? (
        <div className="space-y-2">
          <div className="p-2.5 rounded-md bg-white/[4%] border border-white/[6%]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">{obDetection.bestOB.type} OB · {obDetection.bestOB.timeframe}</span>
              <PremiumBadge variant={obDetection.bestOB.rank === 'A_PLUS' ? 'gold' : 'bull'} size="xs">{obDetection.bestOB.rank}</PremiumBadge>
            </div>
            <div className="text-sm font-mono font-semibold">${formatNumber(obDetection.bestOB.low, 2)} - ${formatNumber(obDetection.bestOB.high, 2)}</div>
            <div className="grid grid-cols-3 gap-1 mt-2 text-[10px]">
              <span className={cn('px-1.5 py-0.5 rounded text-center', obDetection.bestOB.fresh ? 'bg-[rgba(0, 230, 118, 0.15)] text-[#00E676]' : 'bg-white/[5%] text-muted-foreground')}>
                {obDetection.bestOB.fresh ? '✓ Fresh' : '✗ Used'}
              </span>
              <span className={cn('px-1.5 py-0.5 rounded text-center', obDetection.bestOB.highVolume ? 'bg-[rgba(0, 230, 118, 0.15)] text-[#00E676]' : 'bg-white/[5%] text-muted-foreground')}>
                {obDetection.bestOB.highVolume ? '✓ Vol' : '✗ Vol'}
              </span>
              <span className={cn('px-1.5 py-0.5 rounded text-center', obDetection.bestOB.fvgConfluence ? 'bg-[rgba(0, 230, 118, 0.15)] text-[#00E676]' : 'bg-white/[5%] text-muted-foreground')}>
                {obDetection.bestOB.fvgConfluence ? '✓ FVG' : '✗ FVG'}
              </span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-[10px] mb-0.5"><span className="text-muted-foreground">Score</span><span className="font-mono">{obDetection.bestOB.score}/100</span></div>
              <PremiumProgress value={obDetection.bestOB.score} color={obDetection.bestOB.score >= 80 ? 'gold' : obDetection.bestOB.score >= 60 ? 'bull' : 'neutral'} height={5} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">No qualifying A+ or A order blocks. Reject poor quality OBs.</p>
      )}
      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{obDetection.description}</p>
    </LiquidGlassCard>
  )
}

// ============================================================
// PHASE 10 — TRADE MANAGEMENT
// ============================================================

function Phase10Card({ management, isWait }: { management: AILEAnalysis['phase10']; isWait: boolean }) {
  return (
    <LiquidGlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[rgba(245, 197, 66, 0.15)] text-[#FFC83D] text-[10px] font-mono font-bold flex items-center justify-center">10</span>
          Trade Management
        </h4>
        {isWait && <PremiumBadge variant="neutral" size="sm">N/A</PremiumBadge>}
      </div>
      <div className="space-y-2 text-xs">
        <ManagementRow label="After TP1" text={management.afterTP1} icon={<Target className="w-3 h-3" />} color="text-[#00E676]" />
        <ManagementRow label="After TP2" text={management.afterTP2} icon={<BarChart3 className="w-3 h-3" />} color="text-[#F5C542]" />
        <ManagementRow label="After TP3" text={management.afterTP3} icon={<Award className="w-3 h-3" />} color="text-[#FFC83D]" />
        <ManagementRow label="Break Even" text={management.breakEvenTrigger} icon={<Shield className="w-3 h-3" />} color="text-[#F5C542]" />
      </div>
    </LiquidGlassCard>
  )
}

function ManagementRow({ label, text, icon, color }: { label: string; text: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="p-2 rounded-md bg-white/[3%] border border-white/[6%]">
      <div className={cn('flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium mb-1', color)}>
        {icon}{label}
      </div>
      <p className="text-[11px] text-foreground/80 leading-relaxed">{text}</p>
    </div>
  )
}

// ============================================================
// PHASE 11 — CONFIDENCE SCORE
// ============================================================

function Phase11Card({ confidence }: { confidence: AILEAnalysis['phase11'] }) {
  const factors = [
    { label: 'HTF Alignment', value: confidence.htfAlignment, max: 15 },
    { label: 'Liquidity', value: confidence.liquidity, max: 15 },
    { label: 'OB Quality', value: confidence.obQuality, max: 15 },
    { label: 'FVG', value: confidence.fvg, max: 10 },
    { label: 'Session', value: confidence.session, max: 10 },
    { label: 'News', value: confidence.news, max: 10 },
    { label: 'Risk Reward', value: confidence.riskReward, max: 10 },
    { label: 'Trend Strength', value: confidence.trendStrength, max: 10 },
    { label: 'Momentum', value: confidence.momentum, max: 5 },
    { label: 'Structure', value: confidence.marketStructure, max: 10 },
  ]
  return (
    <LiquidGlassCard className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[rgba(245, 197, 66, 0.15)] text-[#FFC83D] text-[10px] font-mono font-bold flex items-center justify-center">11</span>
          AI Confidence Score
        </h4>
        <PremiumBadge variant={confidence.label === 'A_PLUS' ? 'gold' : confidence.label === 'A' ? 'bull' : confidence.label === 'B' ? 'info' : 'neutral'} size="sm">
          {confidence.total}/100 · {confidence.label}
        </PremiumBadge>
      </div>
      <div className="space-y-1.5">
        {factors.map(f => (
          <div key={f.label}>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="font-mono">{f.value}/{f.max}</span>
            </div>
            <PremiumProgress value={(f.value / f.max) * 100} color={f.value / f.max > 0.7 ? 'bull' : f.value / f.max > 0.4 ? 'gold' : 'neutral'} height={4} />
          </div>
        ))}
      </div>
    </LiquidGlassCard>
  )
}

function formatNum(n: number): string {
  return formatNumber(n, 2)
}
