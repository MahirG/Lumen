'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, TrendingUp, TrendingDown, Wifi, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMarketStore } from '@/lib/hisab/market-store'
import { formatNumber } from '@/lib/hisab/risk-manager'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick: () => void
  title: string
  subtitle?: string
}

export function Header({ onMenuClick, title, subtitle }: HeaderProps) {
  const price = useMarketStore(s => s.price)
  const session = useMarketStore(s => s.session)
  const newsEvents = useMarketStore(s => s.newsEvents)
  const dataSource = useMarketStore(s => s.dataSource)
  const lastRealUpdate = useMarketStore(s => s.lastRealUpdate)
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
  const sourceColor = dataSource === 'live' ? 'oklch(0.72 0.18 145)' : dataSource === 'cached' ? 'oklch(0.78 0.16 85)' : 'oklch(0.7 0.1 230)'

  const isUp = (price?.change ?? 0) >= 0
  const highImpactNext = newsEvents.find(e => e.impact === 'HIGH' && e.minutesUntil <= 60)

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-border/30">
      <div className="flex items-center justify-between gap-3 px-4 lg:px-6 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-foreground shrink-0"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base lg:text-lg font-semibold leading-tight font-display tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Live ticker */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Connection status — shows real data source */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground" title={`Data source: ${dataSource}. Last real update: ${secondsAgo ?? '—'}s ago`}>
            <div className="relative w-1.5 h-1.5">
              <div className="absolute inset-0 rounded-full" style={{ background: sourceColor }} />
              <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ background: sourceColor }} />
            </div>
            <span className="font-mono" style={{ color: sourceColor }}>{sourceLabel}</span>
            {secondsAgo !== null && (
              <span className="font-mono text-[10px] text-muted-foreground/70">· {secondsAgo}s</span>
            )}
          </div>

          {/* Session badge */}
          {session && (
            <Badge
              variant="outline"
              className={cn(
                'hidden sm:inline-flex border-border/50 font-mono text-[10px] gap-1',
                session.isActive
                  ? session.isKillZone
                    ? 'bg-[oklch(0.78_0.16_85/15%)] text-[oklch(0.92_0.14_85)] border-[oklch(0.82_0.15_85/30%)]'
                    : 'bg-[oklch(0.72_0.18_145/10%)] text-[oklch(0.85_0.15_145)] border-[oklch(0.72_0.18_145/30%)]'
                  : 'text-muted-foreground'
              )}
            >
              {session.isKillZone && <AlertTriangle className="w-3 h-3" />}
              {session.name.replace('_', ' ')}
            </Badge>
          )}

          {/* Price ticker */}
          <AnimatePresence mode="wait">
            {price && (
              <motion.div
                key={Math.floor(price.timestamp / 250)}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'flex flex-col items-end rounded-lg px-2.5 lg:px-3 py-1 transition-colors',
                  flash === 'up' && 'flash-up',
                  flash === 'down' && 'flash-down',
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs lg:text-sm font-mono font-semibold tabular-nums text-foreground">
                    ${formatNumber(price.last, 2)}
                  </span>
                  {isUp ? (
                    <TrendingUp className="w-3.5 h-3.5 text-[oklch(0.72_0.18_145)]" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-[oklch(0.66_0.22_25)]" />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] lg:text-xs font-mono tabular-nums',
                  isUp ? 'text-[oklch(0.72_0.18_145)]' : 'text-[oklch(0.66_0.22_25)]'
                )}>
                  {isUp ? '+' : ''}{formatNumber(price.change, 2)} ({isUp ? '+' : ''}{formatNumber(price.changePct, 2)}%)
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* High-impact news warning */}
          {highImpactNext && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[oklch(0.66_0.22_25/15%)] border border-[oklch(0.66_0.22_25/30%)]"
              title={highImpactNext.title}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[oklch(0.7_0.2_25)]" />
              <span className="text-[11px] font-mono text-[oklch(0.85_0.15_25)]">
                News in {highImpactNext.minutesUntil}m
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}
