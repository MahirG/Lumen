'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Activity, ArrowUp, ArrowDown, Minus, Layers } from 'lucide-react'
import { GlassCard, SectionHeading, StatusBadge, ProgressBar } from '../primitives'
import { useMarketStore } from '@/lib/hisab/market-store'
import { runMultiTimeframeAnalysis } from '@/lib/hisab/mtf-analysis'
import type { MTFAnalysis, TimeframeAnalysis, MarketBias } from '@/lib/types/hisab'
import { cn } from '@/lib/utils'

export function MultiTimeframe() {
  // Do NOT subscribe to live candles — causes re-renders every tick.
  // Read from store snapshot only once on mount.
  const [mtf, setMtf] = React.useState<MTFAnalysis | null>(null)
  const hasInitialized = React.useRef(false)

  React.useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true
    const candlesSnapshot = useMarketStore.getState().candles
    const result = runMultiTimeframeAnalysis(candlesSnapshot)
    setMtf(result)
  }, [])

  if (!mtf) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#F7A707] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const tfs: { label: string; data: TimeframeAnalysis; weight: number }[] = [
    { label: 'Monthly', data: mtf.monthly, weight: 4 },
    { label: 'Weekly', data: mtf.weekly, weight: 3 },
    { label: 'Daily', data: mtf.daily, weight: 2.5 },
    { label: '4H', data: mtf.h4, weight: 2 },
    { label: '1H', data: mtf.h1, weight: 1.5 },
    { label: '15M', data: mtf.m15, weight: 1 },
    { label: '5M', data: mtf.m5, weight: 0.7 },
    { label: '1M', data: mtf.m1, weight: 0.5 },
  ]

  const bullCount = tfs.filter(t => t.data.bias === 'BUY').length
  const bearCount = tfs.filter(t => t.data.bias === 'SELL').length
  const neutralCount = tfs.filter(t => t.data.bias === 'NEUTRAL').length

  return (
    <div className="space-y-5">
      {/* Summary */}
      <GlassCard variant="strong" className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Overall Bias</div>
            <div className={cn(
              'text-4xl font-bold font-display flex items-center justify-center gap-2',
              mtf.overallBias === 'BUY' ? 'text-[#00E676]' : mtf.overallBias === 'SELL' ? 'text-[#FF7252]' : 'text-[#F7A707]'
            )}>
              {mtf.overallBias === 'BUY' && <ArrowUp className="w-7 h-7" />}
              {mtf.overallBias === 'SELL' && <ArrowDown className="w-7 h-7" />}
              {mtf.overallBias === 'NEUTRAL' && <Minus className="w-7 h-7" />}
              {mtf.overallBias}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Alignment</div>
            <div className="text-4xl font-bold font-mono text-[#FFC83D]">{mtf.alignment}%</div>
            <div className="mt-2 max-w-[180px] mx-auto">
              <ProgressBar value={mtf.alignment} color="gold" height={6} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Confidence</div>
            <div className="text-4xl font-bold font-mono text-[#FFC83D]">{mtf.overallConfidence}%</div>
            <div className="mt-2 max-w-[180px] mx-auto">
              <ProgressBar value={mtf.overallConfidence} color={mtf.overallConfidence > 70 ? 'bull' : 'gold'} height={6} />
            </div>
          </div>
        </div>

        {/* Distribution bar */}
        <div className="flex h-3 rounded-full overflow-hidden bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(bullCount / 8) * 100}%` }}
            className="bg-gradient-to-r from-[#00C853] to-[#00E676]"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(neutralCount / 8) * 100}%` }}
            className="bg-[rgba(247, 167, 7, 0.4)]"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(bearCount / 8) * 100}%` }}
            className="bg-gradient-to-r from-[#CC3333] to-[#FF5252]"
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono">
          <span className="text-[#00E676]">{bullCount} Bullish</span>
          <span className="text-muted-foreground">{neutralCount} Neutral</span>
          <span className="text-[#FF7252]">{bearCount} Bearish</span>
        </div>
      </GlassCard>

      {/* MTF matrix */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold font-display flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FFC83D]" /> Timeframe Matrix
          </h3>
          <StatusBadge variant="info">8 timeframes</StatusBadge>
        </div>

        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          <div className="col-span-2">Timeframe</div>
          <div className="col-span-2">Bias</div>
          <div className="col-span-2">Trend</div>
          <div className="col-span-2">Structure</div>
          <div className="col-span-2">P/D Zone</div>
          <div className="col-span-2">Liquidity</div>
        </div>

        <div className="space-y-1.5">
          {tfs.map((tf, i) => (
            <motion.div
              key={tf.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-2 md:grid-cols-12 gap-2 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/[0.07] transition-colors"
            >
              <div className="col-span-2 md:col-span-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md glass-gold flex items-center justify-center text-xs font-mono font-bold text-[#FFC83D]">
                  {tf.data.timeframe}
                </div>
                <span className="text-sm font-medium">{tf.label}</span>
              </div>
              <div className="md:col-span-2 flex items-center">
                <StatusBadge variant={tf.data.bias === 'BUY' ? 'bull' : tf.data.bias === 'SELL' ? 'bear' : 'neutral'}>
                  {tf.data.bias === 'BUY' ? <ArrowUp className="w-3 h-3" /> : tf.data.bias === 'SELL' ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                  {tf.data.bias}
                </StatusBadge>
              </div>
              <div className="md:col-span-2 text-xs text-muted-foreground flex items-center">
                {tf.data.trend}
              </div>
              <div className="md:col-span-2 text-xs font-mono text-foreground/80 flex items-center">
                {tf.data.structure.replace('_', ' ')}
              </div>
              <div className="md:col-span-2 flex items-center">
                <StatusBadge variant={tf.data.premiumDiscount === 'PREMIUM' ? 'bear' : tf.data.premiumDiscount === 'DISCOUNT' ? 'bull' : 'neutral'}>
                  {tf.data.premiumDiscount}
                </StatusBadge>
              </div>
              <div className="md:col-span-2 flex items-center text-xs">
                {tf.data.liquiditySweep ? (
                  <span className="text-[#FFC83D] flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Sweep
                  </span>
                ) : (
                  <span className="text-muted-foreground">No sweep</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Notes */}
      <GlassCard className="p-5">
        <h3 className="text-base font-semibold font-display mb-3">Per-Timeframe Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tfs.map((tf, i) => (
            <motion.div
              key={tf.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-3 rounded-lg bg-white/5 border border-border/30"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-semibold text-[#FFC83D]">{tf.data.timeframe}</span>
                <StatusBadge variant={tf.data.bias === 'BUY' ? 'bull' : tf.data.bias === 'SELL' ? 'bear' : 'neutral'}>
                  {tf.data.bias}
                </StatusBadge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{tf.data.notes}</p>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
