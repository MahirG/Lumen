'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Crown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarketStore } from '@/lib/hisab/market-store'
import { formatNumber } from '@/lib/hisab/risk-manager'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick: () => void
  title: string
  subtitle?: string
}

// Ticker tape items — mix of forex, metals, indices
const TICKER_ITEMS = [
  { symbol: 'XAUUSD', label: 'Gold', basePrice: 4055, volatility: 0.8 },
  { symbol: 'XAGUSD', label: 'Silver', basePrice: 58.35, volatility: 0.15 },
  { symbol: 'EURUSD', label: 'EUR/USD', basePrice: 1.087, volatility: 0.002 },
  { symbol: 'GBPUSD', label: 'GBP/USD', basePrice: 1.272, volatility: 0.002 },
  { symbol: 'USDJPY', label: 'USD/JPY', basePrice: 161.88, volatility: 0.15 },
  { symbol: 'DXY', label: 'Dollar Index', basePrice: 101.05, volatility: 0.15 },
  { symbol: 'BTCUSD', label: 'Bitcoin', basePrice: 58250, volatility: 80 },
  { symbol: 'ETHUSD', label: 'Ethereum', basePrice: 3120, volatility: 12 },
  { symbol: 'US10Y', label: 'US 10Y', basePrice: 4.28, volatility: 0.02 },
  { symbol: 'SPX', label: 'S&P 500', basePrice: 5680, volatility: 5 },
  { symbol: 'NDX', label: 'Nasdaq', basePrice: 20350, volatility: 25 },
  { symbol: 'WTI', label: 'Crude Oil', basePrice: 78.45, volatility: 0.3 },
]

function useTickerPrices() {
  const [prices, setPrices] = React.useState(() =>
    TICKER_ITEMS.map(item => ({
      ...item,
      price: item.basePrice,
      change: 0,
      changePct: 0,
    })),
  )

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev =>
        prev.map(item => {
          const delta = (Math.random() - 0.5) * item.volatility
          const newPrice = item.price + delta
          const change = newPrice - item.basePrice
          return {
            ...item,
            price: newPrice,
            change,
            changePct: (change / item.basePrice) * 100,
          }
        }),
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return prices
}

export function Header({ onMenuClick, title, subtitle }: HeaderProps) {
  const price = useMarketStore(s => s.price)
  const dataSource = useMarketStore(s => s.dataSource)
  const lastRealUpdate = useMarketStore(s => s.lastRealUpdate)
  const tickerPrices = useTickerPrices()
  const prevPriceRef = React.useRef<number | null>(null)
  const [flash, setFlash] = React.useState<'up' | 'down' | null>(null)

  React.useEffect(() => {
    if (!price) return
    if (prevPriceRef.current !== null) {
      if (price.last > prevPriceRef.current) setFlash('up')
      else if (price.last < prevPriceRef.current) setFlash('down')
      const t = setTimeout(() => setFlash(null), 600)
      return () => clearTimeout(t)
    }
    prevPriceRef.current = price.last
  }, [price?.last])

  const secondsAgo = lastRealUpdate ? Math.round((Date.now() - lastRealUpdate) / 1000) : null
  const sourceLabel = dataSource === 'live' ? 'LIVE' : dataSource === 'cached' ? 'CACHED' : 'DEMO'
  const sourceColor = dataSource === 'live' ? 'oklch(0.78 0.19 152)' : dataSource === 'cached' ? 'oklch(0.82 0.15 85)' : 'oklch(0.78 0.13_230)'

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-white/[6%]">
      {/* Ticker tape — scrolling marquee */}
      <div className="relative overflow-hidden border-b border-white/[4%] bg-black/30">
        <div className="flex animate-ticker-scroll whitespace-nowrap py-1.5" aria-hidden="true">
          {[...tickerPrices, ...tickerPrices].map((item, i) => {
            const isUp = item.change >= 0
            return (
              <div key={i} className="inline-flex items-center gap-2 px-4 border-r border-white/[5%]">
                <span className="text-[10px] font-mono font-semibold uppercase text-muted-foreground">{item.symbol}</span>
                <span className="text-[11px] font-mono tabular text-foreground/90">
                  {item.price > 1000 ? item.price.toFixed(0) : item.price.toFixed(item.price > 10 ? 2 : 4)}
                </span>
                <span className={cn(
                  'text-[10px] font-mono tabular',
                  isUp ? 'text-[oklch(0.78_0.19_152)]' : 'text-[oklch(0.66_0.24_25)]',
                )}>
                  {isUp ? '▲' : '▼'} {Math.abs(item.changePct).toFixed(2)}%
                </span>
              </div>
            )
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[oklch(0.07_0.018_265)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[oklch(0.07_0.018_265)] to-transparent" />
      </div>

      {/* Main header bar */}
      <div className="flex items-center justify-between gap-3 px-4 lg:px-6 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-base lg:text-lg font-bold leading-tight font-display tracking-tight truncate text-gradient-platinum">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          {/* Live status badge */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/[8%]"
            title={`Data source: ${dataSource}. Last real update: ${secondsAgo ?? '—'}s ago`}
          >
            <span className="relative flex w-1.5 h-1.5">
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ background: sourceColor }}
              />
              <span className="relative w-1.5 h-1.5 rounded-full" style={{ background: sourceColor }} />
            </span>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wide" style={{ color: sourceColor }}>
              {sourceLabel}
            </span>
            {secondsAgo !== null && (
              <span className="text-[10px] font-mono text-muted-foreground/70 tabular">· {secondsAgo}s</span>
            )}
          </div>

          {/* Gold price ticker */}
          <AnimatePresence mode="wait">
            {price && (
              <motion.div
                key={Math.floor(price.timestamp / 250)}
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'flex flex-col items-end rounded-xl px-3 lg:px-4 py-1.5 transition-colors glass-gold',
                  flash === 'up' && 'flash-up',
                  flash === 'down' && 'flash-down',
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3 h-3 text-[oklch(0.92_0.13_85)]" />
                  <span className="text-xs font-mono font-semibold uppercase text-muted-foreground">XAUUSD</span>
                  <span className="text-sm lg:text-base font-mono font-bold tabular text-foreground">
                    ${formatNumber(price.last, 2)}
                  </span>
                </div>
                <span className={cn(
                  'text-[10px] lg:text-xs font-mono tabular',
                  price.change >= 0 ? 'text-[oklch(0.78_0.19_152)]' : 'text-[oklch(0.66_0.24_25)]'
                )}>
                  {price.change >= 0 ? '+' : ''}{formatNumber(price.change, 2)} ({price.change >= 0 ? '+' : ''}{formatNumber(price.changePct, 2)}%)
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Engine indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.82_0.15_85/10%)] to-transparent border border-[oklch(0.82_0.15_85/15%)]">
            <Zap className="w-3 h-3 text-[oklch(0.92_0.13_85)]" />
            <span className="text-[10px] font-mono font-semibold text-[oklch(0.92_0.13_85)] uppercase tracking-wide">AI</span>
          </div>

          {/* Hamburger menu — right side, 2-line + short style */}
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-[5px] hover:scale-105 active:scale-95 transition-transform shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(13, 17, 38, 0.8), rgba(8, 12, 28, 0.8))',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            aria-label="Open navigation menu"
          >
            <div className="w-[16px] h-[2px] rounded-full bg-foreground" />
            <div className="w-[16px] h-[2px] rounded-full bg-foreground" />
            <div className="w-[10px] h-[2px] rounded-full bg-foreground" style={{ alignSelf: 'flex-start', marginLeft: '8px' }} />
          </button>
        </div>
      </div>
    </header>
  )
}
