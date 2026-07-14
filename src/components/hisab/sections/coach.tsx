'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap, Sparkles, Brain, Lightbulb, BookOpen,
  TrendingUp, Quote, RotateCcw,
} from 'lucide-react'
import { GlassCard, SectionHeading, StatusBadge, ProgressBar } from '../primitives'
import { Button } from '@/components/ui/button'
import { useMarketStore } from '@/lib/hisab/market-store'
import { analyzeSMC } from '@/lib/hisab/smc-engine'
import { runMultiTimeframeAnalysis, generateTradeSetup } from '@/lib/hisab/mtf-analysis'
import { generateCoachExplanation, generateQuickCoachTip } from '@/lib/hisab/ai-coach'
import type { TradeSetup, MTFAnalysis, SMCAnalysis, MarketBias } from '@/lib/types/hisab'

export function AICoach() {
  // Do NOT subscribe to candles/price — that causes re-renders every tick.
  // Instead, read from store snapshot only when manually generating.
  const [smc, setSmc] = React.useState<SMCAnalysis | null>(null)
  const [mtf, setMtf] = React.useState<MTFAnalysis | null>(null)
  const [setup, setSetup] = React.useState<TradeSetup | null>(null)
  const [explanation, setExplanation] = React.useState('')
  const [quickTip, setQuickTip] = React.useState('')
  const [generating, setGenerating] = React.useState(false)
  const [explanationKey, setExplanationKey] = React.useState(0)
  const hasInitialized = React.useRef(false)

  // Generate ONLY ONCE on mount — do NOT re-render when candles/price update.
  // This keeps the reading experience stable and calm.
  // User can manually refresh with the button.
  const generate = React.useCallback(() => {
    setGenerating(true)
    setTimeout(() => {
      // Use a snapshot of candles at generation time — don't track live updates
      const candlesSnapshot = useMarketStore.getState().candles
      const priceSnapshot = useMarketStore.getState().price?.last ?? 2650
      const smcResult = analyzeSMC(candlesSnapshot['15M'], '15M')
      const mtfResult = runMultiTimeframeAnalysis(candlesSnapshot)
      const setupResult = generateTradeSetup(smcResult, mtfResult, priceSnapshot)
      const coach = generateCoachExplanation(smcResult, setupResult, mtfResult)
      const tip = generateQuickCoachTip(smcResult, setupResult.bias)
      setSmc(smcResult)
      setMtf(mtfResult)
      setSetup(setupResult)
      setExplanation(coach)
      setQuickTip(tip)
      setGenerating(false)
      setExplanationKey(k => k + 1)
    }, 400)
  }, []) // Empty dependency array — never auto-regenerates

  // Run once on mount only
  React.useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      generate()
    }
  }, [generate])

  return (
    <div className="space-y-5">
      {/* Coach intro */}
      <GlassCard variant="strong" className="p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFC83D] to-[#F7A707] flex items-center justify-center shrink-0 glow-gold">
            <GraduationCap className="w-7 h-7 text-[#1A1A1A]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold font-display">AI Trading Mentor</h3>
              <StatusBadge variant="gold">LIVE</StatusBadge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your professional SMC/ICT mentor that explains every trade setup like a 20-year veteran.
              The AI breaks down the structure, liquidity, order flow, and psychology behind each setup.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generate}
            disabled={generating}
            className="shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${generating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {setup && mtf && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-[10px] uppercase text-muted-foreground">Current Bias</div>
              <div className={`text-lg font-bold mt-0.5 ${setup.bias === 'BUY' ? 'text-[#00E676]' : setup.bias === 'SELL' ? 'text-[#FF7252]' : 'text-foreground'}`}>
                {setup.bias}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-[10px] uppercase text-muted-foreground">Confidence</div>
              <div className="text-lg font-bold mt-0.5 text-[#FFC83D]">{setup.confidence}%</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-[10px] uppercase text-muted-foreground">Timeframe Alignment</div>
              <div className="text-lg font-bold mt-0.5">{mtf.alignment}%</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <div className="text-[10px] uppercase text-muted-foreground">Expected R:R</div>
              <div className="text-lg font-bold mt-0.5">1:{setup.riskReward}</div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Quick tip */}
      {quickTip && (
        <GlassCard variant="gold" className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(247, 167, 7, 0.15)] flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-[#FFC83D]" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-[#FFC83D] mb-1 font-medium">Quick Coach Tip</div>
              <p className="text-sm leading-relaxed">{quickTip}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Full explanation */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FFC83D] to-[#F7A707] flex items-center justify-center">
            <Brain className="w-4 h-4 text-[#1A1A1A]" />
          </div>
          <div>
            <h3 className="text-base font-semibold font-display">Full Mentor Explanation</h3>
            <p className="text-xs text-muted-foreground">Step-by-step breakdown of the current setup</p>
          </div>
        </div>

        {generating ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#F7A707] border-t-transparent rounded-full animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Mentor analyzing market structure...</span>
          </div>
        ) : (
          <motion.div
            key={explanationKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-sm max-w-none space-y-3"
          >
            {explanation.split('. ').map((sentence, i, arr) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-sm leading-relaxed text-foreground/90 flex gap-2"
              >
                <span className="text-[#F7A707] font-mono text-xs shrink-0 mt-0.5">{(i + 1).toString().padStart(2, '0')}</span>
                <span>{sentence}{i < arr.length - 1 ? '.' : ''}</span>
              </motion.p>
            ))}
          </motion.div>
        )}
      </GlassCard>

      {/* SMC concept library */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConceptCard
          icon={<TrendingUp className="w-4 h-4" />}
          title="Break of Structure (BOS)"
          definition="When price closes beyond the prior swing high (bullish BOS) or swing low (bearish BOS), confirming trend continuation."
          usage="Confirms the existing trend is intact. Look for entries on retracements after a BOS."
        />
        <ConceptCard
          icon={<Sparkles className="w-4 h-4" />}
          title="Change of Character (CHoCH)"
          definition="The first sign of trend reversal. Price breaks the most recent opposite-side structure, signaling smart money is shifting positions."
          usage="Early reversal signal. Wait for OB retest after CHoCH for high-probability counter-trend entries."
        />
        <ConceptCard
          icon={<Quote className="w-4 h-4" />}
          title="Order Block (OB)"
          definition="The last down candle before a strong bullish move (bullish OB) or last up candle before strong bearish move (bearish OB). Represents institutional order placement."
          usage="Wait for price to retrace into the OB zone. Enter on confirmation (pin bar, CHoCH) at the OB."
        />
        <ConceptCard
          icon={<BookOpen className="w-4 h-4" />}
          title="Fair Value Gap (FVG)"
          definition="A 3-candle imbalance where the wicks of candle 1 and candle 3 don't overlap, leaving a gap. Represents inefficiency in price delivery."
          usage="Markets tend to revisit and fill FVGs. Use as entry zone or take-profit target."
        />
        <ConceptCard
          icon={<Lightbulb className="w-4 h-4" />}
          title="Liquidity Sweep"
          definition="When price briefly penetrates beyond a key high/low (where stops rest) and then reverses. Smart money triggers stops to fill their orders."
          usage="A sweep followed by a CHoCH is one of the highest-probability reversal setups in SMC."
        />
        <ConceptCard
          icon={<Brain className="w-4 h-4" />}
          title="Premium vs Discount"
          definition="Using the swing high-low range, the upper half is 'premium' (favor shorts) and lower half is 'discount' (favor longs). The 50% level is equilibrium."
          usage="Always trade in the direction of the trend, but only enter from premium/discount zones for optimal R:R."
        />
      </div>

      <div className="text-[11px] text-muted-foreground italic text-center">
        The AI Coach provides educational analysis only — not financial advice. Always do your own research and risk management.
      </div>
    </div>
  )
}

function ConceptCard({ icon, title, definition, usage }: {
  icon: React.ReactNode
  title: string
  definition: string
  usage: string
}) {
  return (
    <GlassCard className="p-4" hover>
      <div className="flex items-center gap-2 mb-2 text-[#FFC83D]">
        {icon}
        <h4 className="text-sm font-semibold font-display">{title}</h4>
      </div>
      <p className="text-xs text-foreground/80 leading-relaxed mb-2">{definition}</p>
      <div className="pt-2 border-t border-border/30">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Usage</div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{usage}</p>
      </div>
    </GlassCard>
  )
}
