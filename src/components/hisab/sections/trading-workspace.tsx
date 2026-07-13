'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, ZoomIn, ZoomOut, Maximize2, Minimize2,
  Activity, BarChart3, TrendingUp, TrendingDown, Wifi, Loader2,
  Crosshair, Move, PenTool, Ruler, Type, Bell, Search, Sparkles,
} from 'lucide-react'
import { LiquidGlassCard, GlowButton, PremiumBadge } from '../primitives'
import { useMarketStore } from '@/lib/hisab/market-store'
import { generateCandles, type Candle } from '@/lib/hisab/smc-engine'
import { formatNumber } from '@/lib/hisab/risk-manager'
import {
  createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries,
  LineSeries, HistogramSeries, CrosshairMode,
} from 'lightweight-charts'
import type { Timeframe } from '@/lib/types/hisab'
import { cn } from '@/lib/utils'

// ===== Symbol definitions =====
interface SymbolDef {
  id: string
  label: string
  category: 'Forex' | 'Crypto' | 'Indices'
  basePrice: number
  volatility: number
}

const SYMBOLS: SymbolDef[] = [
  { id: 'XAUUSD', label: 'XAU/USD', category: 'Forex', basePrice: 4011, volatility: 1.0 },
  { id: 'EURUSD', label: 'EUR/USD', category: 'Forex', basePrice: 1.087, volatility: 0.3 },
  { id: 'GBPUSD', label: 'GBP/USD', category: 'Forex', basePrice: 1.268, volatility: 0.4 },
  { id: 'USDJPY', label: 'USD/JPY', category: 'Forex', basePrice: 161.88, volatility: 0.5 },
  { id: 'BTCUSDT', label: 'BTC/USDT', category: 'Crypto', basePrice: 62255, volatility: 3.0 },
  { id: 'ETHUSDT', label: 'ETH/USDT', category: 'Crypto', basePrice: 3180, volatility: 2.5 },
  { id: 'PAXGUSDT', label: 'PAXG/USDT', category: 'Crypto', basePrice: 4015, volatility: 1.0 },
  { id: 'NAS100', label: 'NAS100', category: 'Indices', basePrice: 17980, volatility: 2.0 },
  { id: 'SPX500', label: 'SPX500', category: 'Indices', basePrice: 5180, volatility: 1.5 },
  { id: 'US30', label: 'US30', category: 'Indices', basePrice: 38500, volatility: 1.8 },
]

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: '1M', label: '1m' },
  { id: '5M', label: '5m' },
  { id: '15M', label: '15m' },
  { id: '1H', label: '1H' },
  { id: '4H', label: '4H' },
  { id: 'D', label: '1D' },
]

interface IndicatorState {
  ma: boolean
  ema: boolean
  rsi: boolean
  macd: boolean
  volume: boolean
}

type ToolType = 'crosshair' | 'move' | 'trend' | 'fib' | 'text'

// ===== Generate candles for any symbol =====
function generateSymbolCandles(symbol: SymbolDef, timeframe: Timeframe, count = 200): Candle[] {
  const tfMultipliers: Record<Timeframe, number> = {
    '1M': 0.2, '5M': 0.4, '15M': 0.8, '1H': 2.0, '4H': 4.0, 'D': 10, 'W': 25, 'M': 50,
  }
  const tfSeconds: Record<Timeframe, number> = {
    '1M': 60, '5M': 300, '15M': 900, '1H': 3600, '4H': 14400,
    'D': 86400, 'W': 604800, 'M': 2592000,
  }
  const vol = tfMultipliers[timeframe] * symbol.volatility
  const interval = tfSeconds[timeframe] * 1000
  const now = Date.now()
  const candles: Candle[] = []
  let price = symbol.basePrice
  let trend = 0

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * interval
    if (i % 30 === 0) trend = (Math.random() - 0.5) * 0.4
    const noise = (Math.random() - 0.5) * vol * 2
    const open = price
    const close = open + noise + trend * vol
    const range = Math.abs(noise) * (1 + Math.random()) + vol * 0.3
    const high = Math.max(open, close) + Math.random() * range * 0.5
    const low = Math.min(open, close) - Math.random() * range * 0.5
    const volume = 1000 + Math.random() * 5000 + Math.abs(noise) * 200
    candles.push({ time, open, high, low, close, volume })
    price = close
  }
  return candles
}

// ===== Main component =====
export function TradingWorkspace() {
  const marketPrice = useMarketStore(s => s.price)
  const [symbolId, setSymbolId] = React.useState('XAUUSD')
  const [timeframe, setTimeframe] = React.useState<Timeframe>('15M')
  const [indicators, setIndicators] = React.useState<IndicatorState>({ ma: true, ema: false, rsi: true, macd: false, volume: true })
  const [activeTool, setActiveTool] = React.useState<ToolType>('crosshair')
  const [loading, setLoading] = React.useState(true)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [showSymbolSearch, setShowSymbolSearch] = React.useState(false)
  const [showAIAnalysis, setShowAIAnalysis] = React.useState(true)

  const symbol = SYMBOLS.find(s => s.id === symbolId) ?? SYMBOLS[0]
  const isLiveSymbol = symbolId === 'XAUUSD' && marketPrice

  React.useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [symbolId, timeframe])

  const chartCandles = React.useMemo(() => generateSymbolCandles(symbol, timeframe, 200), [symbol, timeframe])

  const currentPrice = isLiveSymbol ? marketPrice.last : chartCandles.at(-1)?.close ?? 0
  const prevClose = chartCandles.at(-2)?.close ?? currentPrice
  const change = currentPrice - prevClose
  const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0
  const isUp = change >= 0

  const priceFormat = currentPrice > 1000 ? 2 : currentPrice > 10 ? 2 : 4

  return (
    <div className={cn('space-y-4', isFullscreen && 'fixed inset-0 z-[100] p-4 bg-background overflow-auto')}>
      {/* AI Analysis Bar */}
      {showAIAnalysis && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <LiquidGlassCard variant="gold" className="p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #1677FF, #7C5CFC)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#F5B942]">AI Analysis</span>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {isUp ? `${symbol.label} showing bullish momentum. ` : `${symbol.label} under bearish pressure. `}
                {indicators.rsi ? 'RSI confirms ' + (isUp ? 'overbought conditions — watch for reversal. ' : 'oversold conditions — potential bounce. ') : ''}
                {indicators.volume ? 'Volume ' + (isUp ? 'supporting upward move. ' : 'on selling side. ') : ''}
                <span className="text-muted-foreground italic">Educational only — not financial advice.</span>
              </p>
            </div>
            <button onClick={() => setShowAIAnalysis(false)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          </LiquidGlassCard>
        </motion.div>
      )}

      {/* Workspace container */}
      <LiquidGlassCard variant="strong" className={cn('overflow-hidden', isFullscreen && 'min-h-[80vh]')}>
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
          {/* Left: Symbol + Price */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Symbol selector with search */}
            <div className="relative">
              <button
                onClick={() => setShowSymbolSearch(!showSymbolSearch)}
                className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity"
              >
                {symbol.label}
                <Search className="w-3 h-3 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {showSymbolSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 mt-1 z-20 w-56 rounded-xl p-2 max-h-64 overflow-y-auto"
                    style={{ background: 'var(--popover)', border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
                  >
                    {['Forex', 'Crypto', 'Indices'].map(cat => (
                      <div key={cat}>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground px-2 py-1 font-semibold">{cat}</div>
                        {SYMBOLS.filter(s => s.category === cat).map(s => (
                          <button
                            key={s.id}
                            onClick={() => { setSymbolId(s.id); setShowSymbolSearch(false) }}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-foreground/[6%] transition-colors text-left"
                          >
                            <span className="font-mono font-medium text-foreground">{s.label}</span>
                            <span className="text-[9px] text-muted-foreground">{s.category}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono font-bold tabular text-foreground">
                {currentPrice > 1000 ? `$${formatNumber(currentPrice, 2)}` : formatNumber(currentPrice, priceFormat)}
              </span>
              <span className="text-xs font-mono font-semibold flex items-center gap-0.5" style={{ color: isUp ? '#10B981' : '#EF4444' }}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? '+' : ''}{formatNumber(change, priceFormat)} ({isUp ? '+' : ''}{formatNumber(changePct, 2)}%)
              </span>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'rgba(16,185,129,0.08)' }}>
              <div className="relative w-1.5 h-1.5">
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: '#10B981' }} />
                <div className="relative w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
              </div>
              <span className="text-[9px] font-mono font-semibold uppercase text-[#10B981]">Live</span>
            </div>
            {/* Alert button */}
            <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[6%] transition-colors" title="Set Price Alert" aria-label="Set alert">
              <Bell className="w-3.5 h-3.5" />
            </button>
            {/* Timeframe selector */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--muted)' }}>
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  className={cn('px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition-all', timeframe === tf.id ? 'text-white' : 'text-muted-foreground hover:text-foreground')}
                  style={timeframe === tf.id ? { background: '#1677FF' } : {}}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            {/* Fullscreen */}
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[6%] transition-colors" aria-label="Toggle fullscreen">
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Chart Tools Bar */}
        <div className="flex items-center gap-1 px-4 py-1.5 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
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
                className={cn('w-7 h-7 rounded-md flex items-center justify-center transition-all shrink-0', activeTool === tool.id ? 'text-white' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[6%]')}
                style={activeTool === tool.id ? { background: '#1677FF' } : {}}
                title={tool.label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            )
          })}
          <div className="w-px h-5 bg-border mx-1 shrink-0" />
          {/* Indicators */}
          {[
            { id: 'ma' as keyof IndicatorState, label: 'MA' },
            { id: 'ema' as keyof IndicatorState, label: 'EMA' },
            { id: 'rsi' as keyof IndicatorState, label: 'RSI' },
            { id: 'macd' as keyof IndicatorState, label: 'MACD' },
            { id: 'volume' as keyof IndicatorState, label: 'Vol' },
          ].map(ind => {
            const isActive = indicators[ind.id]
            return (
              <button
                key={ind.id}
                onClick={() => setIndicators(prev => ({ ...prev, [ind.id]: !prev[ind.id] }))}
                className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-semibold transition-all shrink-0', isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}
                style={isActive ? { background: 'rgba(22,119,255,0.1)', border: '1px solid rgba(22,119,255,0.2)' } : { border: '1px solid transparent' }}
              >
                {ind.label}
              </button>
            )
          })}
          <div className="flex-1" />
          <Settings className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors shrink-0" />
        </div>

        {/* Chart Area — 16:9 cinematic */}
        <div className="relative" style={{ aspectRatio: isFullscreen ? 'auto' : '16 / 9', minHeight: isFullscreen ? '60vh' : 'auto', maxHeight: '520px' }}>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ProChart
              candles={chartCandles}
              timeframe={timeframe}
              showMA={indicators.ma}
              showEMA={indicators.ema}
              showRSI={indicators.rsi}
              showMACD={indicators.macd}
              showVolume={indicators.volume}
              pricePrecision={priceFormat}
            />
          )}

          {/* Connection status */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md z-10" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <Wifi className="w-3 h-3 text-[#10B981]" />
            <span className="text-[9px] font-mono text-muted-foreground hidden sm:inline">Live Market Data</span>
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground flex-wrap">
            <span>O: <span className="text-foreground">{formatNumber(chartCandles.at(-1)?.open ?? 0, priceFormat)}</span></span>
            <span>H: <span style={{ color: '#10B981' }}>{formatNumber(chartCandles.at(-1)?.high ?? 0, priceFormat)}</span></span>
            <span>L: <span style={{ color: '#EF4444' }}>{formatNumber(chartCandles.at(-1)?.low ?? 0, priceFormat)}</span></span>
            <span>C: <span className="text-foreground">{formatNumber(chartCandles.at(-1)?.close ?? 0, priceFormat)}</span></span>
            <span className="hidden sm:inline">Vol: <span className="text-foreground">{formatNumber(chartCandles.at(-1)?.volume ?? 0, 0)}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[6%] transition-colors" aria-label="Zoom out"><ZoomOut className="w-3.5 h-3.5" /></button>
            <button className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[6%] transition-colors" aria-label="Zoom in"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Session High" value={formatNumber(Math.max(...chartCandles.slice(-30).map(c => c.high)), priceFormat)} color="#10B981" />
        <StatCard label="Session Low" value={formatNumber(Math.min(...chartCandles.slice(-30).map(c => c.low)), priceFormat)} color="#EF4444" />
        <StatCard label="Avg Volume" value={formatNumber(chartCandles.slice(-20).reduce((s, c) => s + c.volume, 0) / 20, 0)} color="#1677FF" />
        <StatCard label="Volatility" value={`${formatNumber(Math.abs(changePct), 2)}%`} color="#F5B942" />
      </div>
    </div>
  )
}

/* ============================================
   PRO CHART — TradingView-style with MACD
   ============================================ */

function ProChart({ candles, timeframe, showMA, showEMA, showRSI, showMACD, showVolume, pricePrecision }: {
  candles: Candle[]
  timeframe: Timeframe
  showMA: boolean
  showEMA: boolean
  showRSI: boolean
  showMACD: boolean
  showVolume: boolean
  pricePrecision: number
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const chartRef = React.useRef<IChartApi | null>(null)
  const candleSeriesRef = React.useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = React.useRef<ISeriesApi<'Histogram'> | null>(null)
  const indicatorSeriesRef = React.useRef<ISeriesApi<'Line'>[]>([])

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
      priceFormat: { type: 'price', precision: pricePrecision, minMove: 1 / Math.pow(10, pricePrecision) },
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
      indicatorSeriesRef.current = []
    }
  }, [timeframe, pricePrecision])

  // Candle data
  React.useEffect(() => {
    if (!candleSeriesRef.current || !candles.length) return
    const data = candles.map(c => ({
      time: Math.floor(c.time / 1000) as any,
      open: c.open, high: c.high, low: c.low, close: c.close,
    }))
    candleSeriesRef.current.setData(data)
    chartRef.current?.timeScale().fitContent()
  }, [candles])

  // Clear and rebuild indicators
  React.useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    // Remove all previous indicator series
    indicatorSeriesRef.current.forEach(s => { try { chart.removeSeries(s) } catch {} })
    indicatorSeriesRef.current = []
    if (volumeSeriesRef.current) { try { chart.removeSeries(volumeSeriesRef.current) } catch {} volumeSeriesRef.current = null }

    const toTime = (i: number) => Math.floor(candles[i].time / 1000) as any

    // Volume
    if (showVolume) {
      const vol = chart.addSeries(HistogramSeries, {
        color: 'rgba(22, 119, 255, 0.3)',
        priceFormat: { type: 'volume' },
        priceScaleId: 'vol',
      })
      chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.88, bottom: 0 } })
      vol.setData(candles.map(c => ({
        time: toTime(candles.indexOf(c)),
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
      })))
      volumeSeriesRef.current = vol
    }

    // Moving Average (SMA 20)
    if (showMA) {
      const ma = chart.addSeries(LineSeries, {
        color: '#F5B942', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false, title: 'MA(20)',
      })
      const period = 20
      const maData: any[] = []
      for (let i = period - 1; i < candles.length; i++) {
        const sum = candles.slice(i - period + 1, i + 1).reduce((a, b) => a + b.close, 0)
        maData.push({ time: toTime(i), value: sum / period })
      }
      ma.setData(maData)
      indicatorSeriesRef.current.push(ma)
    }

    // EMA 9
    if (showEMA) {
      const ema = chart.addSeries(LineSeries, {
        color: '#7C5CFC', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false, title: 'EMA(9)',
      })
      const period = 9
      const k = 2 / (period + 1)
      let prev = candles[0].close
      const emaData: any[] = [{ time: toTime(0), value: prev }]
      for (let i = 1; i < candles.length; i++) {
        prev = candles[i].close * k + prev * (1 - k)
        emaData.push({ time: toTime(i), value: prev })
      }
      ema.setData(emaData)
      indicatorSeriesRef.current.push(ema)
    }

    // RSI
    if (showRSI) {
      const rsi = chart.addSeries(LineSeries, {
        color: '#7C5CFC', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: true, title: 'RSI', priceScaleId: 'rsi',
      })
      chart.priceScale('rsi').applyOptions({ scaleMargins: { top: 0.78, bottom: 0.05 } })
      const period = 14
      const rsiData: any[] = []
      for (let i = period; i < candles.length; i++) {
        let gains = 0, losses = 0
        for (let j = i - period + 1; j <= i; j++) {
          const diff = candles[j].close - candles[j - 1].close
          if (diff >= 0) gains += diff; else losses -= diff
        }
        const rs = losses === 0 ? 100 : gains / losses
        rsiData.push({ time: toTime(i), value: 100 - 100 / (1 + rs) })
      }
      rsi.setData(rsiData)
      indicatorSeriesRef.current.push(rsi)
    }

    // MACD
    if (showMACD) {
      const macdLine = chart.addSeries(LineSeries, {
        color: '#1677FF', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: true, title: 'MACD', priceScaleId: 'macd',
      })
      const signalLine = chart.addSeries(LineSeries, {
        color: '#F5B942', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, priceScaleId: 'macd',
      })
      chart.priceScale('macd').applyOptions({ scaleMargins: { top: 0.85, bottom: 0.05 } })
      const fastPeriod = 12, slowPeriod = 26, signalPeriod = 9
      const closes = candles.map(c => c.close)
      const ema = (period: number) => {
        const k = 2 / (period + 1)
        let prev = closes[0]
        const result = [prev]
        for (let i = 1; i < closes.length; i++) { prev = closes[i] * k + prev * (1 - k); result.push(prev) }
        return result
      }
      const fastEma = ema(fastPeriod)
      const slowEma = ema(slowPeriod)
      const macdValues = closes.map((_, i) => fastEma[i] - slowEma[i])
      const signalK = 2 / (signalPeriod + 1)
      let signalPrev = macdValues[0]
      const signalValues = [signalPrev]
      for (let i = 1; i < macdValues.length; i++) { signalPrev = macdValues[i] * signalK + signalPrev * (1 - signalK); signalValues.push(signalPrev) }
      const macdData = macdValues.map((v, i) => ({ time: toTime(i), value: v })).slice(slowPeriod)
      const sigData = signalValues.map((v, i) => ({ time: toTime(i), value: v })).slice(slowPeriod)
      macdLine.setData(macdData)
      signalLine.setData(sigData)
      indicatorSeriesRef.current.push(macdLine, signalLine)
    }
  }, [showMA, showEMA, showRSI, showMACD, showVolume, candles])

  return <div ref={containerRef} className="w-full h-full" />
}

/* ============================================
   CHART SKELETON
   ============================================ */

function ChartSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-full h-full p-4 space-y-3">
        <div className="flex items-end gap-1 h-[60%]">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm"
              style={{ height: `${30 + Math.random() * 50}%`, background: 'linear-gradient(180deg, rgba(22,119,255,0.06), rgba(22,119,255,0.02))' }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.03 }}
            />
          ))}
        </div>
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
