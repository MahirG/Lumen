'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, Upload, Loader2, X, Sparkles, Image as ImageIcon,
  TrendingUp, Layers, Waves, CircleDot, SquareStack, Columns3,
} from 'lucide-react'
import { GlassCard, SectionHeading, StatusBadge } from '../primitives'
import { SMCChart } from '../smc-chart'
import { Button } from '@/components/ui/button'
import { useMarketStore } from '@/lib/hisab/market-store'
import { analyzeSMC } from '@/lib/hisab/smc-engine'
import { useToast } from '@/hooks/use-toast'
import { formatNumber } from '@/lib/hisab/risk-manager'
import type { Timeframe, SMCAnalysis } from '@/lib/types/hisab'
import { cn } from '@/lib/utils'

const TIMEFRAMES: Timeframe[] = ['1M', '5M', '15M', '1H', '4H', 'D', 'W', 'M']

interface AIAnalysisResult {
  detected: {
    trend: string
    structure: string[]
    liquidity: string[]
    orderBlocks: string[]
    fvgs: string[]
    equalHighs: string[]
    equalLows: string[]
    premiumDiscount: string
  }
  bias: 'BUY' | 'SELL' | 'NEUTRAL'
  confidence: number
  notes: string
  rawAnalysis: string
}

export function ChartAnalysis() {
  const candles = useMarketStore(s => s.candles)
  const [timeframe, setTimeframe] = React.useState<Timeframe>('15M')
  const [smc, setSmc] = React.useState<SMCAnalysis | null>(null)
  const [screenshot, setScreenshot] = React.useState<string | null>(null)
  const [screenshotName, setScreenshotName] = React.useState<string>('')
  const [analyzing, setAnalyzing] = React.useState(false)
  const [aiResult, setAiResult] = React.useState<AIAnalysisResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  React.useEffect(() => {
    if (candles[timeframe]) {
      setSmc(analyzeSMC(candles[timeframe], timeframe))
    }
  }, [candles, timeframe])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum 5MB.', variant: 'destructive' })
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setScreenshot(ev.target?.result as string)
      setScreenshotName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const runAIAnalysis = async () => {
    setAnalyzing(true)
    setError(null)
    setAiResult(null)
    try {
      const res = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: screenshot ?? undefined,
          timeframe,
          symbol: 'XAUUSD',
          context: screenshot ? 'TradingView screenshot uploaded by user' : 'Live market data',
        }),
      })
      if (!res.ok) throw new Error(`Analysis failed (${res.status})`)
      const data = await res.json()
      setAiResult(data.result)
      toast({ title: 'AI Analysis Complete', description: `Confidence: ${data.result.confidence}%` })
    } catch (err: any) {
      setError(err.message || 'Analysis failed')
      toast({ title: 'Analysis failed', description: err.message, variant: 'destructive' })
    } finally {
      setAnalyzing(false)
    }
  }

  const currentCandles = candles[timeframe] ?? []

  return (
    <div className="space-y-5">
      {/* Top row: chart + AI vision upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-4 lg:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold font-display">XAUUSD Chart</h3>
                <StatusBadge variant="gold">{timeframe}</StatusBadge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">SMC overlays · Live simulation</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all',
                    timeframe === tf
                      ? 'bg-[oklch(0.82_0.15_85/20%)] text-[oklch(0.92_0.14_85)] border border-[oklch(0.82_0.15_85/30%)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <SMCChart candles={currentCandles} smc={smc ?? undefined} timeframe={timeframe} height={420} />
          <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[oklch(0.72_0.18_145/60%)]" />Bull OB</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[oklch(0.66_0.22_25/60%)]" />Bear OB</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[oklch(0.82_0.15_85/50%)]" style={{ borderTop: '1px dashed' }} />Liquidity / EQ levels</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[oklch(0.82_0.15_85/50%)]" style={{ borderTop: '1px dotted' }} />Equilibrium (50%)</span>
          </div>
        </GlassCard>

        {/* AI Vision upload card */}
        <GlassCard variant="gold" className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-[oklch(0.92_0.14_85)]" />
            <h3 className="text-base font-semibold font-display">AI Vision Analysis</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Upload a TradingView screenshot and the AI will read candlestick structure, detect SMC elements, and locate entry/SL/TP levels.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="sr-only"
            aria-label="Upload TradingView screenshot"
          />

          {!screenshot ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-lg border-2 border-dashed border-border/60 hover:border-[oklch(0.82_0.15_85/50%)] hover:bg-[oklch(0.82_0.15_85/5%)] transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <Upload className="w-7 h-7 text-muted-foreground group-hover:text-[oklch(0.92_0.14_85)] transition-colors" />
              <span className="text-xs text-muted-foreground group-hover:text-foreground">Drop screenshot or click</span>
              <span className="text-[10px] text-muted-foreground/60">PNG, JPG · max 5MB</span>
            </button>
          ) : (
            <div className="relative rounded-lg overflow-hidden border border-border/50">
              <img src={screenshot} alt="Uploaded chart" className="w-full h-auto max-h-64 object-contain bg-black/30" />
              <button
                onClick={() => { setScreenshot(null); setScreenshotName(''); setAiResult(null) }}
                className="absolute top-2 right-2 p-1 rounded-md bg-black/60 backdrop-blur hover:bg-black/80"
                aria-label="Remove screenshot"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-white/80 truncate">
                {screenshotName}
              </div>
            </div>
          )}

          <Button
            onClick={runAIAnalysis}
            disabled={analyzing || (!screenshot && !smc)}
            className="w-full mt-4 bg-gradient-to-r from-[oklch(0.78_0.16_85)] to-[oklch(0.72_0.18_75)] text-[oklch(0.16_0.012_240)] hover:opacity-90 font-semibold"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
          {error && <p className="text-xs text-[oklch(0.7_0.2_25)] mt-2">{error}</p>}
        </GlassCard>
      </div>

      {/* AI Result */}
      <AnimatePresence>
        {aiResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <GlassCard variant="strong" className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.92_0.14_85)] to-[oklch(0.72_0.18_75)] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[oklch(0.16_0.012_240)]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold font-display">AI Vision Result</h3>
                    <p className="text-xs text-muted-foreground">Detected structure & directional bias</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge variant={aiResult.bias === 'BUY' ? 'bull' : aiResult.bias === 'SELL' ? 'bear' : 'neutral'}>
                    {aiResult.bias}
                  </StatusBadge>
                  <StatusBadge variant="gold">{aiResult.confidence}% conf</StatusBadge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <DetectionCard
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Trend"
                  items={[aiResult.detected.trend]}
                />
                <DetectionCard
                  icon={<Layers className="w-4 h-4" />}
                  label="Structure Events"
                  items={aiResult.detected.structure}
                />
                <DetectionCard
                  icon={<Waves className="w-4 h-4" />}
                  label="Liquidity"
                  items={aiResult.detected.liquidity}
                />
                <DetectionCard
                  icon={<SquareStack className="w-4 h-4" />}
                  label="Order Blocks"
                  items={aiResult.detected.orderBlocks}
                />
                <DetectionCard
                  icon={<Columns3 className="w-4 h-4" />}
                  label="Fair Value Gaps"
                  items={aiResult.detected.fvgs}
                />
                <DetectionCard
                  icon={<CircleDot className="w-4 h-4" />}
                  label="Equal Highs/Lows"
                  items={[...aiResult.detected.equalHighs, ...aiResult.detected.equalLows]}
                />
              </div>

              <div className="mt-4 p-3 rounded-lg bg-white/5 border border-border/30">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">AI Notes</div>
                <p className="text-sm leading-relaxed">{aiResult.notes}</p>
              </div>

              <div className="mt-3 text-[10px] text-muted-foreground italic">
                ⚠ Educational analysis only — probability-based, not financial advice. Always confirm with your own research.
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SMC detection grid */}
      {smc && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SMCInfoCard
            title="Trend & Structure"
            items={[
              { label: 'Trend', value: smc.trend, badge: true },
              { label: 'Trend Strength', value: `${smc.trendStrength.toFixed(0)} (ADX)` },
              { label: 'Swing High', value: `$${formatNumber(smc.swingHigh, 2)}` },
              { label: 'Swing Low', value: `$${formatNumber(smc.swingLow, 2)}` },
              { label: 'Last BOS', value: smc.structure.bosEvents.at(-1)?.direction ?? '—' },
              { label: 'Last CHoCH', value: smc.structure.chochEvents.at(-1)?.direction ?? '—' },
            ]}
          />
          <SMCInfoCard
            title="Liquidity Levels"
            items={smc.liquidity.slice(0, 6).map(l => ({
              label: `${l.type === 'BUY_SIDE' ? 'BSL' : 'SSL'} · ${l.strength}`,
              value: `$${formatNumber(l.price, 2)}`,
              badge: l.swept,
              badgeText: l.swept ? 'SWEPT' : 'ACTIVE',
            }))}
          />
          <SMCInfoCard
            title="Order Blocks"
            items={smc.orderBlocks.slice(0, 5).map(ob => ({
              label: `${ob.type} OB`,
              value: `$${formatNumber(ob.low, 2)}-${formatNumber(ob.high, 2)}`,
              badge: ob.mitigated,
              badgeText: `${ob.mitigationPct.toFixed(0)}% mit`,
            }))}
          />
          <SMCInfoCard
            title="Fair Value Gaps"
            items={smc.fvgs.slice(0, 5).map(f => ({
              label: `${f.type} FVG`,
              value: `$${formatNumber(f.low, 2)}-${formatNumber(f.high, 2)}`,
              badge: f.filled,
              badgeText: f.filled ? 'FILLED' : `${f.fillPct.toFixed(0)}% filled`,
            }))}
          />
          <SMCInfoCard
            title="Premium / Discount Zones"
            items={[
              { label: 'Equilibrium', value: `$${formatNumber(smc.equilibrium, 2)}` },
              { label: 'Premium Zone', value: `$${formatNumber(smc.premiumZone.low, 2)} - $${formatNumber(smc.premiumZone.high, 2)}` },
              { label: 'Discount Zone', value: `$${formatNumber(smc.discountZone.low, 2)} - $${formatNumber(smc.discountZone.high, 2)}` },
              { label: 'Equal Highs', value: smc.equalHighs.length ? smc.equalHighs.map(h => `$${formatNumber(h, 2)}`).join(', ') : 'None' },
              { label: 'Equal Lows', value: smc.equalLows.length ? smc.equalLows.map(l => `$${formatNumber(l, 2)}`).join(', ') : 'None' },
            ]}
          />
          <SMCInfoCard
            title="Inducement"
            items={smc.inducement.length
              ? smc.inducement.map(ind => ({
                  label: `Inducement (${ind.type})`,
                  value: `$${formatNumber(ind.price, 2)}`,
                }))
              : [{ label: 'Inducement', value: 'No active inducement levels' }]
            }
          />
        </div>
      )}
    </div>
  )
}

interface SMCInfoCardProps {
  title: string
  items: { label: string; value: string; badge?: boolean; badgeText?: string }[]
}

function SMCInfoCard({ title, items }: SMCInfoCardProps) {
  return (
    <GlassCard className="p-4">
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">{title}</h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground truncate">{item.label}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono font-medium text-foreground">{item.value}</span>
              {item.badge && item.badgeText && (
                <StatusBadge variant={item.badgeText.includes('SWEPT') || item.badgeText.includes('mit') || item.badgeText.includes('FILLED') ? 'neutral' : 'gold'}>
                  {item.badgeText}
                </StatusBadge>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

interface DetectionCardProps {
  icon: React.ReactNode
  label: string
  items: string[]
}

function DetectionCard({ icon, label, items }: DetectionCardProps) {
  return (
    <div className="rounded-lg p-3 bg-white/5 border border-border/30">
      <div className="flex items-center gap-2 mb-2 text-[oklch(0.92_0.14_85)]">
        {icon}
        <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div className="space-y-1">
        {items.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">None detected</div>
        ) : (
          items.map((item, i) => (
            <div key={i} className="text-xs text-foreground/90 font-mono">{item}</div>
          ))
        )}
      </div>
    </div>
  )
}
