'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries,
  LineSeries, HistogramSeries, CrosshairMode,
} from 'lightweight-charts'
import { Palette, X, Check, RotateCcw } from 'lucide-react'
import type { Candle } from '@/lib/hisab/smc-engine'
import type { SMCAnalysis, Timeframe } from '@/lib/types/hisab'

interface SMCChartProps {
  candles: Candle[]
  smc?: SMCAnalysis
  timeframe: Timeframe
  height?: number
  showOverlays?: boolean
  className?: string
}

// ===== Chart color theme (customizable, persisted to localStorage) =====
interface ChartTheme {
  bull: string
  bear: string
  bullWick: string
  bearWick: string
  bg: string
  text: string
  grid: string
  border: string
  volume: string
  liq: string
  equilibrium: string
  ob: string
}

const DEFAULT_THEME: ChartTheme = {
  bull: '#00E676',
  bear: '#FF5252',
  bullWick: 'rgba(0, 230, 118, 0.7)',
  bearWick: 'rgba(255, 82, 82, 0.7)',
  bg: 'transparent',
  text: '#64748B',
  grid: 'rgba(44, 44, 44, 0.05)',
  border: 'rgba(44, 44, 44, 0.1)',
  volume: 'rgba(245, 197, 66, 0.25)',
  liq: 'rgba(245, 197, 66, 0.6)',
  equilibrium: 'rgba(245, 197, 66, 0.4)',
  ob: 'rgba(245, 197, 66, 0.15)',
}

const THEME_STORAGE_KEY = 'apex-chart-theme-v1'

function loadTheme(): ChartTheme {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) return DEFAULT_THEME
    return { ...DEFAULT_THEME, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_THEME
  }
}

function saveTheme(theme: ChartTheme) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme))
  } catch {}
}

// Preset themes
const PRESETS: { name: string; theme: Partial<ChartTheme> }[] = [
  { name: 'Default', theme: { bull: '#00E676', bear: '#FF5252' } },
  { name: 'TradingView', theme: { bull: '#26a69a', bear: '#ef5350' } },
  { name: 'Classic', theme: { bull: '#00e676', bear: '#ff1744' } },
  { name: 'Neon', theme: { bull: '#00ff88', bear: '#ff0044' } },
  { name: 'Mono', theme: { bull: '#4fc3f7', bear: '#ff7043' } },
  { name: 'Gold', theme: { bull: '#ffd54f', bear: '#ff8a65' } },
]

export function SMCChart({
  candles, smc, timeframe, height = 480, showOverlays = true, className,
}: SMCChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const chartRef = React.useRef<IChartApi | null>(null)
  const seriesRef = React.useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeRef = React.useRef<ISeriesApi<'Histogram'> | null>(null)
  const overlaysRef = React.useRef<ISeriesApi<'Line'>[]>([])
  const [theme, setTheme] = React.useState<ChartTheme>(DEFAULT_THEME)
  const [showSettings, setShowSettings] = React.useState(false)
  const [ohlc, setOhlc] = React.useState<{ o: number; h: number; l: number; c: number } | null>(null)

  // Load theme from localStorage on mount
  React.useEffect(() => {
    setTheme(loadTheme())
  }, [])

  // Init chart
  React.useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: theme.bg },
        textColor: theme.text,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: theme.grid },
        horzLines: { color: theme.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(245, 197, 66, 0.4)', width: 1, style: 2, labelBackgroundColor: '#F5C542' },
        horzLine: { color: 'rgba(245, 197, 66, 0.4)', width: 1, style: 2, labelBackgroundColor: '#F5C542' },
      },
      rightPriceScale: {
        borderColor: theme.border,
        scaleMargins: { top: 0.05, bottom: 0.2 },
      },
      timeScale: {
        borderColor: theme.border,
        timeVisible: timeframe === '1M' || timeframe === '5M' || timeframe === '15M' || timeframe === '1H',
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: theme.bull,
      downColor: theme.bear,
      borderUpColor: theme.bull,
      borderDownColor: theme.bear,
      wickUpColor: theme.bullWick,
      wickDownColor: theme.bearWick,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: theme.volume,
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    })

    chartRef.current = chart
    seriesRef.current = series
    volumeRef.current = volumeSeries

    // OHLC legend on crosshair move
    chart.subscribeCrosshairMove(param => {
      if (!param.time || !param.seriesData) {
        setOhlc(null)
        return
      }
      const data = param.seriesData.get(series)
      if (data && 'open' in data) {
        setOhlc({ o: data.open, h: data.high, l: data.low, c: data.close })
      }
    })

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
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
      seriesRef.current = null
      volumeRef.current = null
      overlaysRef.current = []
    }
  }, [height, timeframe])

  // Update candle data
  React.useEffect(() => {
    if (!seriesRef.current || !volumeRef.current || !candles.length) return
    try {
      const candleData = candles.map(c => ({
        time: Math.floor(c.time / 1000) as any,
        open: c.open, high: c.high, low: c.low, close: c.close,
      }))
      const volumeData = candles.map(c => ({
        time: Math.floor(c.time / 1000) as any,
        value: c.volume,
        color: c.close >= c.open
          ? theme.bull.replace(')', ', 0.25)').replace('rgb', 'rgba').replace('#', '').match(/.{2}/g)?.map(h => parseInt(h, 16)).join(',') ? `rgba(${parseInt(theme.bull.slice(1, 3), 16)}, ${parseInt(theme.bull.slice(3, 5), 16)}, ${parseInt(theme.bull.slice(5, 7), 16)}, 0.25)` : theme.bull
          : `rgba(${parseInt(theme.bear.slice(1, 3), 16)}, ${parseInt(theme.bear.slice(3, 5), 16)}, ${parseInt(theme.bear.slice(5, 7), 16)}, 0.25)`,
      }))
      seriesRef.current.setData(candleData)
      volumeRef.current.setData(volumeData)
      chartRef.current?.timeScale().fitContent()
    } catch (err) {
      console.warn('Chart data update failed:', err)
    }
  }, [candles, theme.bull, theme.bear])

  // Update colors when theme changes
  React.useEffect(() => {
    if (!seriesRef.current) return
    seriesRef.current.applyOptions({
      upColor: theme.bull,
      downColor: theme.bear,
      borderUpColor: theme.bull,
      borderDownColor: theme.bear,
      wickUpColor: theme.bullWick,
      wickDownColor: theme.bearWick,
    })
    if (chartRef.current) {
      chartRef.current.applyOptions({
        grid: {
          vertLines: { color: theme.grid },
          horzLines: { color: theme.grid },
        },
        rightPriceScale: { borderColor: theme.border },
        timeScale: { borderColor: theme.border },
      })
    }
  }, [theme])

  // SMC overlays
  React.useEffect(() => {
    if (!chartRef.current || !smc || !showOverlays) return
    overlaysRef.current.forEach(s => { try { chartRef.current?.removeSeries(s) } catch {} })
    overlaysRef.current = []

    try {
      const lastTime = Math.floor(candles.at(-1)!.time / 1000)
      const firstTime = Math.floor(candles[0].time / 1000)

      // Equilibrium
      const eq = chartRef.current.addSeries(LineSeries, {
        color: theme.equilibrium, lineWidth: 1, lineStyle: 2,
        priceLineVisible: false, lastValueVisible: true, title: 'EQ 50%',
      })
      eq.setData([{ time: firstTime as any, value: smc.equilibrium }, { time: lastTime as any, value: smc.equilibrium }])
      overlaysRef.current.push(eq)

      // Order blocks
      for (const ob of smc.orderBlocks.filter(o => !o.mitigated).slice(-3)) {
        const c = ob.type === 'BULLISH' ? theme.bull : theme.bear
        const obHigh = chartRef.current.addSeries(LineSeries, {
          color: c + '99', lineWidth: 1, priceLineVisible: false, lastValueVisible: false,
          title: ob.type === 'BULLISH' ? 'Bull OB' : 'Bear OB',
        })
        obHigh.setData([{ time: firstTime as any, value: ob.high }, { time: lastTime as any, value: ob.high }])
        overlaysRef.current.push(obHigh)

        const obLow = chartRef.current.addSeries(LineSeries, {
          color: c + '99', lineWidth: 1, priceLineVisible: false, lastValueVisible: false,
        })
        obLow.setData([{ time: firstTime as any, value: ob.low }, { time: lastTime as any, value: ob.low }])
        overlaysRef.current.push(obLow)
      }

      // Liquidity levels
      for (const liq of smc.liquidity.slice(0, 4)) {
        const liqColor = liq.swept ? 'rgba(160, 163, 184, 0.3)' : theme.liq
        const liqSeries = chartRef.current.addSeries(LineSeries, {
          color: liqColor, lineWidth: 1, lineStyle: liq.swept ? 1 : 3,
          priceLineVisible: false, lastValueVisible: true,
          title: liq.type === 'BUY_SIDE' ? 'BSL' : 'SSL',
        })
        liqSeries.setData([{ time: firstTime as any, value: liq.price }, { time: lastTime as any, value: liq.price }])
        overlaysRef.current.push(liqSeries)
      }
    } catch (err) {
      console.warn('Overlay update failed:', err)
    }
  }, [smc, showOverlays, candles, theme])

  const updateTheme = (newTheme: ChartTheme) => {
    setTheme(newTheme)
    saveTheme(newTheme)
  }

  const applyPreset = (preset: Partial<ChartTheme>) => {
    const newTheme = { ...theme, ...preset }
    // Auto-generate wick colors from candle colors
    if (preset.bull) {
      newTheme.bullWick = `rgba(${parseInt(preset.bull.slice(1, 3), 16)}, ${parseInt(preset.bull.slice(3, 5), 16)}, ${parseInt(preset.bull.slice(5, 7), 16)}, 0.7)`
    }
    if (preset.bear) {
      newTheme.bearWick = `rgba(${parseInt(preset.bear.slice(1, 3), 16)}, ${parseInt(preset.bear.slice(3, 5), 16)}, ${parseInt(preset.bear.slice(5, 7), 16)}, 0.7)`
    }
    updateTheme(newTheme)
  }

  return (
    <div className="relative">
      {/* Chart container */}
      <div
        ref={containerRef}
        className={className}
        style={{ width: '100%', height }}
        role="img"
        aria-label={`XAUUSD ${timeframe} candlestick chart with SMC overlays`}
      />

      {/* OHLC legend (TradingView-style) */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2 text-[10px] font-mono pointer-events-none">
        <span className="font-bold text-foreground">XAUUSD</span>
        <span className="text-muted-foreground">{timeframe}</span>
        {ohlc ? (
          <>
            <span className="text-muted-foreground">O: <span style={{ color: ohlc.c >= ohlc.o ? theme.bull : theme.bear }}>{ohlc.o.toFixed(2)}</span></span>
            <span className="text-muted-foreground">H: <span style={{ color: ohlc.c >= ohlc.o ? theme.bull : theme.bear }}>{ohlc.h.toFixed(2)}</span></span>
            <span className="text-muted-foreground">L: <span style={{ color: ohlc.c >= ohlc.o ? theme.bull : theme.bear }}>{ohlc.l.toFixed(2)}</span></span>
            <span className="text-muted-foreground">C: <span style={{ color: ohlc.c >= ohlc.o ? theme.bull : theme.bear }}>{ohlc.c.toFixed(2)}</span></span>
          </>
        ) : candles.length > 0 && (
          <>
            <span className="text-muted-foreground">O: <span style={{ color: candles.at(-1)!.close >= candles.at(-1)!.open ? theme.bull : theme.bear }}>{candles.at(-1)!.open.toFixed(2)}</span></span>
            <span className="text-muted-foreground">H: <span style={{ color: candles.at(-1)!.close >= candles.at(-1)!.open ? theme.bull : theme.bear }}>{candles.at(-1)!.high.toFixed(2)}</span></span>
            <span className="text-muted-foreground">L: <span style={{ color: candles.at(-1)!.close >= candles.at(-1)!.open ? theme.bull : theme.bear }}>{candles.at(-1)!.low.toFixed(2)}</span></span>
            <span className="text-muted-foreground">C: <span style={{ color: candles.at(-1)!.close >= candles.at(-1)!.open ? theme.bull : theme.bear }}>{candles.at(-1)!.close.toFixed(2)}</span></span>
          </>
        )}
      </div>

      {/* Color settings button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-lg liquid-glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-105 transition-all"
        aria-label="Chart color settings"
        title="Customize candle colors"
      >
        <Palette className="w-4 h-4" />
      </button>

      {/* Color settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            className="absolute top-12 right-2 z-20 w-64 rounded-xl liquid-glass-strong p-4 shadow-premium-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold">Chart Colors</span>
              <button onClick={() => setShowSettings(false)} className="p-0.5 rounded hover:bg-white/10">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Presets */}
            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Presets</div>
              <div className="grid grid-cols-3 gap-1.5">
                {PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.theme)}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-white/[4%] hover:bg-white/[8%] border border-white/[6%] hover:border-white/[12%] transition-all"
                  >
                    <div className="flex gap-0.5">
                      <div className="w-3 h-3 rounded-sm" style={{ background: preset.theme.bull }} />
                      <div className="w-3 h-3 rounded-sm" style={{ background: preset.theme.bear }} />
                    </div>
                    <span className="text-[8px] text-muted-foreground">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom color pickers */}
            <div className="space-y-2">
              <ColorRow label="Bullish Candles" value={theme.bull} onChange={v => updateTheme({ ...theme, bull: v })} />
              <ColorRow label="Bearish Candles" value={theme.bear} onChange={v => updateTheme({ ...theme, bear: v })} />
            </div>

            {/* Reset */}
            <button
              onClick={() => updateTheme(DEFAULT_THEME)}
              className="w-full mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[4%] hover:bg-white/[8%] text-[10px] text-muted-foreground hover:text-foreground transition-all"
            >
              <RotateCcw className="w-3 h-3" /> Reset to Default
            </button>

            <div className="mt-2 text-[9px] text-muted-foreground/60 text-center">
              Colors saved automatically · Persists on refresh
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value.startsWith('#') ? value : '#22c98a'}
          onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer bg-transparent border border-white/[10%]"
          aria-label={label}
        />
        <span className="text-[10px] font-mono text-muted-foreground w-16">{value}</span>
      </div>
    </div>
  )
}
