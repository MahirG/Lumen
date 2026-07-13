'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, ZoomIn, ZoomOut, Maximize2,
  Activity, BarChart3, TrendingUp, TrendingDown, Wifi, Loader2,
  Crosshair, Move, PenTool, Ruler, Type,
} from 'lucide-react'
import { LiquidGlassCard, GlowButton, PremiumBadge } from '../primitives'
import { useMarketStore } from '@/lib/hisab/market-store'
import { generateCandles, analyzeSMC, type Candle } from '@/lib/hisab/smc-engine'
import { formatNumber } from '@/lib/hisab/risk-manager'
import {
  createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries,
  LineSeries, HistogramSeries, CrosshairMode,
} from 'lightweight-charts'
import type { Timeframe } from '@/lib/types/hisab'
import { cn } from '@/lib/utils'

const TIMEFRAMES: Timeframe[] = ['1M', '5M', '15M', '1H', '4H', 'D', 'W']
const SYMBOLS = ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD', 'DXY']

interface IndicatorState {
  ma: boolean
  rsi: boolean
  volume: boolean
}

type ToolType = 'crosshair' | 'move' | 'trend' | 'fib' | 'text'

export function TradingWorkspace() {
  const price = useMarketStore(s => s.price)
  const candles = useMarketStore(s => s.candles)
  const [symbol, setSymbol] = React.useState('XAUUSD')
  const [timeframe, setTimeframe] = React.useState<Timeframe>('15M')
  const [indicators, setIndicators] = React.useState<IndicatorState>({ ma: false, rsi: true, volume: true })
  const [activeTool, setActiveTool] = React.useState<ToolType>('crosshair')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [symbol, timeframe])

  // Get candles for the selected timeframe
  const chartCandles = React.useMemo(() => {
    const c = candles[timeframe]
    if (c && c.length > 0) return c
    return generateCandles(timeframe, 150)
  }, [candles, timeframe])

  const currentPrice = price?.last ?? chartCandles.at(-1)?.close ?? 0
  const change = price?.change ?? 0
  const changePct = price?.changePct ?? 0
  const isUp = change >= 0

  return (
    <div className="space-y-4">
      {/* Workspace container — cinematic 16:9 feel */}
      <LiquidGlassCard variant="strong" className="overflow-hidden">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          {/* Left: Symbol + Price */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Symbol selector */}
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-transparent text-sm font-bold tracking-tight cursor-pointer outline-none"
              style={{ color: 'var(--foreground)' }}
            >
              {SYMBOLS.map(s => <option key={s} value={s} style={{ background: 'var(--popover)' }}>{s}</option>)}
            </select>
            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-bold tabular" style={{ color: 'var(--foreground)' }}>
                ${formatNumber(currentPrice, currentPrice > 100 ? 2 : 4)}
              </span>
              <span
                className="text-xs font-mono font-semibold flex items-center gap-0.5"
                style={{ color: isUp ? '#10B981' : '#EF4444' }}
              >
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? '+' : ''}{formatNumber(change, 2)} ({isUp ? '+' : ''}{formatNumber(changePct, 2)}%)
              </span>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: isUp ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
              <div className="relative w-1.5 h-1.5">
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: '#10B981' }} />
                <div className="relative w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
              </div>
              <span className="text-[9px] font-mono font-semibold uppercase" style={{ color: '#10B981' }}>Live</span>
            </div>
            {/* Timeframe selector */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--muted)' }}>
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    'px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition-all',
                    timeframe === tf ? 'text-white' : 'text-muted-foreground hover:text-foreground',
                  )}
                  style={timeframe === tf ? { background: '#1677FF' } : {}}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Tools Bar */}
        <div className="flex items-center gap-1 px-4 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
          {[
            { id: 'crosshair' as ToolType, icon: Crosshair, label: 'Crosshair' },
            { id: 'move' as ToolType, icon: Move, label: 'Pan' },
            { id: 'trend' as ToolType, icon: PenTool, label: 'Trend Line' },
            { id: 'fib' as ToolType, icon: Ruler, label: 'Fibonacci' },
            { id: 'text' as ToolType, icon: Type, label: 'Text' },
          ].map(tool => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={cn('w-7 h-7 rounded-md flex items-center justify-center transition-all', activeTool === tool.id ? 'text-white' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[6%]')}
                style={activeTool === tool.id ? { background: '#1677FF' } : {}}
                title={tool.label}
                aria-label={tool.label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            )
          })}
          <div className="w-px h-5 bg-border mx-1" />
          {/* Indicators */}
          {[
            { id: 'ma' as keyof IndicatorState, label: 'MA', icon: Activity },
            { id: 'rsi' as keyof IndicatorState, label: 'RSI', icon: BarChart3 },
            { id: 'volume' as keyof IndicatorState, label: 'Vol', icon: BarChart3 },
          ].map(ind => {
            const Icon = ind.icon
            const isActive = indicators[ind.id]
            return (
              <button
                key={ind.id}
                onClick={() => setIndicators(prev => ({ ...prev, [ind.id]: !prev[ind.id] }))}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition-all',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
                style={isActive ? { background: 'rgba(22,119,255,0.1)', border: '1px solid rgba(22,119,255,0.2)' } : { border: '1px solid transparent' }}
                title={ind.label}
              >
                <Icon className="w-3 h-3" />
                {ind.label}
              </button>
            )
          })}
          <div className="flex-1" />
          <Settings className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
        </div>

        {/* Chart Area — 16:9 cinematic */}
        <div className="relative" style={{ aspectRatio: '16 / 9', maxHeight: '500px' }}>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ProChart
              candles={chartCandles}
              timeframe={timeframe}
              showMA={indicators.ma}
              showRSI={indicators.rsi}
              showVolume={indicators.volume}
            />
          )}

          {/* Connection status overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <Wifi className="w-3 h-3 text-[#10B981]" />
            <span className="text-[9px] font-mono text-muted-foreground">Live Market Data</span>
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
            <span>O: <span className="text-foreground">{formatNumber(chartCandles.at(-1)?.open ?? 0, 2)}</span></span>
            <span>H: <span className="text-[#10B981]">{formatNumber(chartCandles.at(-1)?.high ?? 0, 2)}</span></span>
            <span>L: <span className="text-[#EF4444]">{formatNumber(chartCandles.at(-1)?.low ?? 0, 2)}</span></span>
            <span>C: <span className="text-foreground">{formatNumber(chartCandles.at(-1)?.close ?? 0, 2)}</span></span>
            <span className="hidden sm:inline">Vol: <span className="text-foreground">{formatNumber(chartCandles.at(-1)?.volume ?? 0, 0)}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[6%] transition-colors" aria-label="Zoom out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[6%] transition-colors" aria-label="Zoom in">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[6%] transition-colors" aria-label="Fullscreen">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Quick stats below chart */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="24h High" value={`$${formatNumber(price?.high ?? 0, 2)}`} color="#10B981" />
        <StatCard label="24h Low" value={`$${formatNumber(price?.low ?? 0, 2)}`} color="#EF4444" />
        <StatCard label="Spread" value={`${formatNumber(price ? price.ask - price.bid : 0, 2)}¢`} color="#F5B942" />
        <StatCard label="Volume" value={formatNumber(chartCandles.at(-1)?.volume ?? 0, 0)} color="#1677FF" />
      </div>
    </div>
  )
}

/* ============================================
   PRO CHART — TradingView-style candlestick
   ============================================ */

function ProChart({ candles, timeframe, showMA, showRSI, showVolume }: {
  candles: Candle[]
  timeframe: Timeframe
  showMA: boolean
  showRSI: boolean
  showVolume: boolean
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const chartRef = React.useRef<IChartApi | null>(null)
  const candleSeriesRef = React.useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = React.useRef<ISeriesApi<'Histogram'> | null>(null)
  const maSeriesRef = React.useRef<ISeriesApi<'Line'> | null>(null)
  const extraSeriesRef = React.useRef<ISeriesApi<'Line'>[]>([])

  React.useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748B',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(120, 160, 200, 0.05)' },
        horzLines: { color: 'rgba(120, 160, 200, 0.05)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(22, 119, 255, 0.4)', width: 1, style: 2, labelBackgroundColor: '#1677FF' },
        horzLine: { color: 'rgba(22, 119, 255, 0.4)', width: 1, style: 2, labelBackgroundColor: '#1677FF' },
      },
      rightPriceScale: { borderColor: 'rgba(120, 160, 200, 0.1)', scaleMargins: { top: 0.05, bottom: 0.15 } },
      timeScale: {
        borderColor: 'rgba(120, 160, 200, 0.1)',
        timeVisible: timeframe === '1M' || timeframe === '5M' || timeframe === '15M' || timeframe === '1H',
      },
      handleScroll: true,
      handleScale: true,
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: 'rgba(16, 185, 129, 0.7)',
      wickDownColor: 'rgba(239, 68, 68, 0.7)',
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight })
      }
    }
    window.addEventListener('resize', handleResize)
    const ro = new ResizeObserver(handleResize)
    ro.observe(containerRef.current)

    return () => {
      window.removeEventListener('resize', handleResize)
      ro.disconnect()
      try { chart.remove() } catch {}
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
      maSeriesRef.current = null
      extraSeriesRef.current = []
    }
  }, [timeframe])

  // Update candle data
  React.useEffect(() => {
    if (!candleSeriesRef.current || !candles.length) return
    const data = candles.map(c => ({
      time: Math.floor(c.time / 1000) as any,
      open: c.open, high: c.high, low: c.low, close: c.close,
    }))
    candleSeriesRef.current.setData(data)
    chartRef.current?.timeScale().fitContent()
  }, [candles])

  // Volume
  React.useEffect(() => {
    if (!chartRef.current) return
    if (volumeSeriesRef.current) {
      try { chartRef.current.removeSeries(volumeSeriesRef.current) } catch {}
      volumeSeriesRef.current = null
    }
    if (showVolume) {
      const vol = chartRef.current.addSeries(HistogramSeries, {
        color: 'rgba(22, 119, 255, 0.3)',
        priceFormat: { type: 'volume' },
        priceScaleId: 'vol',
      })
      chartRef.current.priceScale('vol').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } })
      vol.setData(candles.map(c => ({
        time: Math.floor(c.time / 1000) as any,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
      })))
      volumeSeriesRef.current = vol
    }
  }, [showVolume, candles])

  // Moving Average
  React.useEffect(() => {
    if (!chartRef.current) return
    if (maSeriesRef.current) {
      try { chartRef.current.removeSeries(maSeriesRef.current) } catch {}
      maSeriesRef.current = null
    }
    if (showMA) {
      const ma = chartRef.current.addSeries(LineSeries, {
        color: '#F5B942',
        lineWidth: 1.5,
        priceLineVisible: false,
        lastValueVisible: false,
        title: 'MA(20)',
      })
      const closes = candles.map(c => c.close)
      const period = 20
      const maData: any[] = []
      for (let i = period - 1; i < closes.length; i++) {
        const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
        maData.push({ time: Math.floor(candles[i].time / 1000) as any, value: sum / period })
      }
      ma.setData(maData)
      maSeriesRef.current = ma
    }
  }, [showMA, candles])

  // RSI (simplified — as a separate pane line)
  React.useEffect(() => {
    if (!chartRef.current) return
    extraSeriesRef.current.forEach(s => { try { chartRef.current?.removeSeries(s) } catch {} })
    extraSeriesRef.current = []
    if (showRSI) {
      const rsiSeries = chartRef.current.addSeries(LineSeries, {
        color: '#7C5CFC',
        lineWidth: 1.5,
        priceLineVisible: false,
        lastValueVisible: true,
        title: 'RSI',
        priceScaleId: 'rsi',
      })
      chartRef.current.priceScale('rsi').applyOptions({ scaleMargins: { top: 0.75, bottom: 0.05 } })
      const closes = candles.map(c => c.close)
      const period = 14
      const rsiData: any[] = []
      for (let i = period; i < closes.length; i++) {
        let gains = 0, losses = 0
        for (let j = i - period + 1; j <= i; j++) {
          const diff = closes[j] - closes[j - 1]
          if (diff >= 0) gains += diff
          else losses -= diff
        }
        const rs = losses === 0 ? 100 : gains / losses
        rsiData.push({ time: Math.floor(candles[i].time / 1000) as any, value: 100 - 100 / (1 + rs) })
      }
      rsiSeries.setData(rsiData)
      extraSeriesRef.current.push(rsiSeries)
    }
  }, [showRSI, candles])

  return <div ref={containerRef} className="w-full h-full" />
}

/* ============================================
   CHART SKELETON — Premium loading state
   ============================================ */

function ChartSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-full p-4 space-y-3">
        {/* Skeleton candlesticks */}
        <div className="flex items-end gap-1 h-[60%]">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${30 + Math.random() * 50}%`,
                background: 'linear-gradient(180deg, rgba(22,119,255,0.06), rgba(22,119,255,0.02))',
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.03 }}
            />
          ))}
        </div>
        {/* Skeleton bottom */}
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-foreground/[6%] animate-pulse" />
          <div className="h-2 rounded-full bg-foreground/[4%] animate-pulse w-3/4" />
        </div>
      </div>
      <div className="absolute flex flex-col items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#1677FF]" />
        <span className="text-xs text-muted-foreground">Loading market data...</span>
      </div>
    </div>
  )
}

/* ============================================
   STAT CARD
   ============================================ */

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <LiquidGlassCard className="p-3" hover>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-mono font-bold" style={{ color }}>{value}</div>
    </LiquidGlassCard>
  )
}
