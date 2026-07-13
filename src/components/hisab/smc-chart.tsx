'use client'

import * as React from 'react'
import {
  createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries,
  LineSeries, HistogramSeries, CrosshairMode,
} from 'lightweight-charts'
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

// lightweight-charts requires standard color formats (hex/rgba), not CSS color functions
const COLORS = {
  bg: 'transparent',
  text: '#a0a3b8',
  grid: 'rgba(255, 255, 255, 0.04)',
  border: 'rgba(255, 255, 255, 0.08)',
  bull: '#22c98a',
  bear: '#ef4856',
  bullWick: 'rgba(34, 201, 138, 0.7)',
  bearWick: 'rgba(239, 72, 86, 0.7)',
  obBull: 'rgba(34, 201, 138, 0.12)',
  obBear: 'rgba(239, 72, 86, 0.12)',
  fvgBull: 'rgba(34, 201, 138, 0.06)',
  fvgBear: 'rgba(239, 72, 86, 0.06)',
  liqBuy: 'rgba(224, 178, 67, 0.8)',
  liqSell: 'rgba(224, 178, 67, 0.8)',
  equilibrium: 'rgba(224, 178, 67, 0.5)',
  premium: 'rgba(239, 72, 86, 0.05)',
  discount: 'rgba(34, 201, 138, 0.05)',
  gold: '#e0b243',
  goldSoft: 'rgba(224, 178, 67, 0.2)',
  volumeBull: 'rgba(34, 201, 138, 0.25)',
  volumeBear: 'rgba(239, 72, 86, 0.25)',
  volumeBase: 'rgba(110, 130, 200, 0.3)',
}

export function SMCChart({
  candles, smc, timeframe, height = 480, showOverlays = true, className,
}: SMCChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const chartRef = React.useRef<IChartApi | null>(null)
  const seriesRef = React.useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeRef = React.useRef<ISeriesApi<'Histogram'> | null>(null)
  const overlaysRef = React.useRef<ISeriesApi<'Line'>[]>([])

  // Init chart once
  React.useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: COLORS.bg },
        textColor: COLORS.text,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: COLORS.grid },
        horzLines: { color: COLORS.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(224, 178, 67, 0.4)', width: 1, style: 2, labelBackgroundColor: '#e0b243' },
        horzLine: { color: 'rgba(224, 178, 67, 0.4)', width: 1, style: 2, labelBackgroundColor: '#e0b243' },
      },
      rightPriceScale: {
        borderColor: COLORS.border,
        scaleMargins: { top: 0.05, bottom: 0.2 },
      },
      timeScale: {
        borderColor: COLORS.border,
        timeVisible: timeframe === '1M' || timeframe === '5M' || timeframe === '15M' || timeframe === '1H',
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: COLORS.bull,
      downColor: COLORS.bear,
      borderUpColor: COLORS.bull,
      borderDownColor: COLORS.bear,
      wickUpColor: COLORS.bullWick,
      wickDownColor: COLORS.bearWick,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: COLORS.volumeBase,
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    })

    chartRef.current = chart
    seriesRef.current = series
    volumeRef.current = volumeSeries

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(containerRef.current)

    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
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
        color: c.close >= c.open ? COLORS.volumeBull : COLORS.volumeBear,
      }))
      seriesRef.current.setData(candleData)
      volumeRef.current.setData(volumeData)
      chartRef.current?.timeScale().fitContent()
    } catch (err) {
      console.warn('Chart data update failed:', err)
    }
  }, [candles])

  // Update overlays when SMC changes
  React.useEffect(() => {
    if (!chartRef.current || !smc || !showOverlays) return
    // Clear existing overlays
    overlaysRef.current.forEach(s => {
      try { chartRef.current?.removeSeries(s) } catch {}
    })
    overlaysRef.current = []

    try {
      // Equilibrium line
      const eqSeries = chartRef.current.addSeries(LineSeries, {
        color: COLORS.equilibrium,
        lineWidth: 1,
        lineStyle: 2,
        priceLineVisible: false,
        lastValueVisible: true,
        title: 'EQ 50%',
      })
      const lastTime = Math.floor(candles.at(-1)!.time / 1000)
      const firstTime = Math.floor(candles[0].time / 1000)
      eqSeries.setData([
        { time: firstTime as any, value: smc.equilibrium },
        { time: lastTime as any, value: smc.equilibrium },
      ])
      overlaysRef.current.push(eqSeries)

      // Order blocks (horizontal shaded lines)
      for (const ob of smc.orderBlocks.filter(o => !o.mitigated).slice(-3)) {
        const obColor = ob.type === 'BULLISH' ? 'rgba(34, 201, 138, 0.6)' : 'rgba(239, 72, 86, 0.6)'
        const obHigh = chartRef.current.addSeries(LineSeries, {
          color: obColor,
          lineWidth: 1,
          lineStyle: 0,
          priceLineVisible: false,
          lastValueVisible: false,
          title: ob.type === 'BULLISH' ? 'Bull OB' : 'Bear OB',
        })
        obHigh.setData([
          { time: firstTime as any, value: ob.high },
          { time: lastTime as any, value: ob.high },
        ])
        overlaysRef.current.push(obHigh)

        const obLow = chartRef.current.addSeries(LineSeries, {
          color: obColor,
          lineWidth: 1,
          lineStyle: 0,
          priceLineVisible: false,
          lastValueVisible: false,
        })
        obLow.setData([
          { time: firstTime as any, value: ob.low },
          { time: lastTime as any, value: ob.low },
        ])
        overlaysRef.current.push(obLow)
      }

      // Liquidity levels
      for (const liq of smc.liquidity.slice(0, 4)) {
        const liqColor = liq.swept ? 'rgba(160, 163, 184, 0.3)' : 'rgba(224, 178, 67, 0.6)'
        const liqSeries = chartRef.current.addSeries(LineSeries, {
          color: liqColor,
          lineWidth: 1,
          lineStyle: liq.swept ? 1 : 3,
          priceLineVisible: false,
          lastValueVisible: true,
          title: liq.type === 'BUY_SIDE' ? 'BSL' : 'SSL',
        })
        liqSeries.setData([
          { time: firstTime as any, value: liq.price },
          { time: lastTime as any, value: liq.price },
        ])
        overlaysRef.current.push(liqSeries)
      }

      // Equal highs/lows
      for (const eh of smc.equalHighs.slice(0, 2)) {
        const s = chartRef.current.addSeries(LineSeries, {
          color: 'rgba(224, 178, 67, 0.5)',
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          title: 'EQ Highs',
        })
        s.setData([
          { time: firstTime as any, value: eh },
          { time: lastTime as any, value: eh },
        ])
        overlaysRef.current.push(s)
      }
      for (const el of smc.equalLows.slice(0, 2)) {
        const s = chartRef.current.addSeries(LineSeries, {
          color: 'rgba(224, 178, 67, 0.5)',
          lineWidth: 1,
          lineStyle: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          title: 'EQ Lows',
        })
        s.setData([
          { time: firstTime as any, value: el },
          { time: lastTime as any, value: el },
        ])
        overlaysRef.current.push(s)
      }
    } catch (err) {
      console.warn('Overlay update failed:', err)
    }
  }, [smc, showOverlays, candles])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height }}
      role="img"
      aria-label={`XAUUSD ${timeframe} candlestick chart with SMC overlays`}
    />
  )
}
