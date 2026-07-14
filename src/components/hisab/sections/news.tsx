'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, AlertTriangle, Clock, Filter, ExternalLink, RefreshCw, Radio } from 'lucide-react'
import { GlassCard, SectionHeading, StatusBadge } from '../primitives'
import { Button } from '@/components/ui/button'
import { useMarketStore } from '@/lib/hisab/market-store'
import { getImpactColor, getImpactLabel, getSourceColor, shouldWarnForNews, getCurrencyFlag } from '@/lib/hisab/news'
import { cn } from '@/lib/utils'
import type { NewsImpact, NewsSource, NewsEvent } from '@/lib/types/hisab'

const SOURCE_LABELS: Record<NewsSource, string> = {
  ForexFactory: 'Forex Factory',
  TradingEconomics: 'Trading Economics',
  Investing: 'Investing.com',
}

export function NewsFilter() {
  const newsEvents = useMarketStore(s => s.newsEvents)
  const refreshNews = useMarketStore(s => s.refreshNews)
  const [filterImpact, setFilterImpact] = React.useState<{ HIGH: boolean; MEDIUM: boolean; LOW: boolean }>({
    HIGH: true, MEDIUM: true, LOW: false,
  })
  const [refreshing, setRefreshing] = React.useState(false)

  const filteredEvents = newsEvents.filter(e => filterImpact[e.impact])
  const newsFilter = shouldWarnForNews(newsEvents)

  const handleRefresh = () => {
    setRefreshing(true)
    refreshNews()
    setTimeout(() => setRefreshing(false), 1200)
  }

  // Group events by currency for the summary
  const currencies = Array.from(new Set(filteredEvents.map(e => e.currency))).sort()

  return (
    <div className="space-y-5">
      {/* Live data source banner */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-lg"
        style={{
          background: 'var(--accent)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ background: '#10B981' }} />
            <div className="relative w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
          </div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wide" style={{ color: '#10B981' }}>
            Live · Forex Factory Feed
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Real economic calendar · refreshed every 5 min
          </span>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {filteredEvents.length} events · {currencies.length} currencies
        </div>
      </motion.div>

      {/* Warning banner */}
      {newsFilter.shouldWarn && newsFilter.nextEvent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard variant="gold" className="p-4 border-[oklch(0.66_0.22_25/40%)] bg-[oklch(0.66_0.22_25/10%)]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[oklch(0.66_0.22_25/20%)] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[oklch(0.85_0.15_25)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-[oklch(0.85_0.15_25)]">
                    High Impact News in {newsFilter.nextEvent.minutesUntil} minutes
                  </h3>
                  <StatusBadge variant="danger">AVOID ENTERING</StatusBadge>
                </div>
                <p className="text-sm text-foreground/90 flex items-center gap-2">
                  <span>{getCurrencyFlag(newsFilter.nextEvent.currency)}</span>
                  <span>{newsFilter.nextEvent.title}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {SOURCE_LABELS[newsFilter.nextEvent.source]} · Forecast: {newsFilter.nextEvent.forecast ?? '—'} · Previous: {newsFilter.nextEvent.previous ?? '—'}
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Filter controls */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Impact:</span>
            {(['HIGH', 'MEDIUM', 'LOW'] as NewsImpact[]).map(impact => (
              <button
                key={impact}
                onClick={() => setFilterImpact(prev => ({ ...prev, [impact]: !prev[impact] }))}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-all',
                  filterImpact[impact]
                    ? 'text-foreground border-current'
                    : 'text-muted-foreground border-border/30 hover:border-border/60'
                )}
                style={filterImpact[impact] ? { color: getImpactColor(impact), borderColor: `${getImpactColor(impact)}60` } : {}}
              >
                {getImpactLabel(impact)}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-xs"
            disabled={refreshing}
          >
            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', refreshing && 'animate-spin')} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </GlassCard>

      {/* Currency summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {currencies.slice(0, 6).map(currency => {
          const count = filteredEvents.filter(e => e.currency === currency).length
          const highCount = filteredEvents.filter(e => e.currency === currency && e.impact === 'HIGH').length
          return (
            <GlassCard key={currency} className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">{getCurrencyFlag(currency)}</span>
                <span className="text-[10px] font-mono font-semibold text-muted-foreground">{currency}</span>
              </div>
              <div className="text-lg font-bold font-mono text-foreground">{count}</div>
              <div className="text-[10px] text-muted-foreground">
                {highCount > 0 && <span className="text-[oklch(0.66_0.22_25)]">{highCount} high</span>}
                {highCount === 0 && 'events'}
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* News list */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold font-display flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[oklch(0.92_0.14_85)]" /> Upcoming Economic Events
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
              <Radio className="w-3 h-3 text-[#10B981] animate-pulse" />
              <span>REAL DATA</span>
            </div>
          </div>
        </div>
        <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
          <AnimatePresence>
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-sm text-muted-foreground"
              >
                No events match the current filter.
              </motion.div>
            ) : (
              filteredEvents.map((event, i) => (
                <NewsEventRow key={event.id} event={event} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  )
}

/* ============================================
   NewsEventRow — single event card with rich data
   ============================================ */

function NewsEventRow({ event, index }: { event: NewsEvent; index: number }) {
  const isReleased = event.minutesUntil < 0 && event.actual
  const isUpcoming = event.minutesUntil >= 0
  const isSoon = event.minutesUntil <= 18 && event.minutesUntil >= 0 && event.impact === 'HIGH'
  const isImminent = event.minutesUntil <= 60 && event.minutesUntil >= 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className={cn(
        'p-3 rounded-lg border transition-all',
        isSoon
          ? 'bg-[oklch(0.66_0.22_25/8%)] border-[oklch(0.66_0.22_25/30%)]'
          : isReleased
          ? 'bg-[oklch(0.78_0.16_145/5%)] border-[oklch(0.78_0.16_145/20%)]'
          : 'bg-white/5 border-border/30 hover:border-border/50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* Impact dot */}
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: getImpactColor(event.impact) }}
            />
            <span className="text-xs font-mono uppercase tracking-wide" style={{ color: getImpactColor(event.impact) }}>
              {event.impact}
            </span>
            {/* Currency flag + code */}
            <span className="text-sm leading-none">{getCurrencyFlag(event.currency)}</span>
            <span className="text-[10px] font-mono font-semibold text-muted-foreground">{event.currency}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground">{SOURCE_LABELS[event.source]}</span>
            {isSoon && <StatusBadge variant="danger">SOON</StatusBadge>}
            {isReleased && <StatusBadge variant="bull">RELEASED</StatusBadge>}
          </div>
          <div className="text-sm font-medium text-foreground truncate">{event.title}</div>
        </div>
        <div className="text-right shrink-0">
          {isUpcoming ? (
            <>
              <div className="text-[10px] text-muted-foreground uppercase">In</div>
              <div className={cn(
                'text-sm font-mono font-semibold',
                event.minutesUntil <= 30 ? 'text-[oklch(0.85_0.15_25)]' : 'text-foreground'
              )}>
                {formatCountdown(event.minutesUntil)}
              </div>
            </>
          ) : (
            <>
              <div className="text-[10px] text-muted-foreground uppercase">{Math.abs(event.minutesUntil)}m ago</div>
              <div className="text-[10px] text-[#10B981] font-mono">released</div>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-border/20 text-[11px]">
        <div>
          <div className="text-muted-foreground text-[10px] uppercase">Actual</div>
          <div className={cn(
            'font-mono font-semibold',
            event.actual ? 'text-[#10B981]' : 'text-muted-foreground/40'
          )}>
            {event.actual ?? '—'}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10px] uppercase">Forecast</div>
          <div className="font-mono text-foreground/90">{event.forecast ?? '—'}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10px] uppercase">Previous</div>
          <div className="font-mono text-foreground/90">{event.previous ?? '—'}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10px] uppercase">Time (UTC)</div>
          <div className="font-mono text-foreground/90">
            {new Date(event.eventTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false })}
          </div>
        </div>
      </div>
      {event.url && (
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#1677FF] hover:text-[#3B9BFF] transition-colors"
        >
          View on Forex Factory <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </motion.div>
  )
}

/* ============================================
   Helpers
   ============================================ */

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours < 24) return `${hours}h ${mins}m`
  const days = Math.floor(hours / 24)
  const hrs = hours % 24
  return `${days}d ${hrs}h`
}
