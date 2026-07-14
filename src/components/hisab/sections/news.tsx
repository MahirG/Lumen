'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, AlertTriangle, Clock, Filter } from 'lucide-react'
import { GlassCard, SectionHeading, StatusBadge } from '../primitives'
import { Button } from '@/components/ui/button'
import { useMarketStore } from '@/lib/hisab/market-store'
import { getImpactColor, getImpactLabel, getSourceColor, shouldWarnForNews } from '@/lib/hisab/news'
import { cn } from '@/lib/utils'
import type { NewsImpact, NewsSource } from '@/lib/types/hisab'

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

  const filteredEvents = newsEvents.filter(e => filterImpact[e.impact])
  const newsFilter = shouldWarnForNews(newsEvents)

  return (
    <div className="space-y-5">
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
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[oklch(0.85_0.15_25)]">High Impact News in {newsFilter.nextEvent.minutesUntil} minutes</h3>
                  <StatusBadge variant="danger">AVOID ENTERING</StatusBadge>
                </div>
                <p className="text-sm text-foreground/90">{newsFilter.nextEvent.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Source: {SOURCE_LABELS[newsFilter.nextEvent.source]} · Forecast: {newsFilter.nextEvent.forecast ?? '—'}
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Filter controls */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Impact filter:</span>
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
            onClick={refreshNews}
            className="text-xs"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
        </div>
      </GlassCard>

      {/* News sources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(['ForexFactory', 'TradingEconomics', 'Investing'] as NewsSource[]).map(source => {
          const count = filteredEvents.filter(e => e.source === source).length
          return (
            <GlassCard key={source} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{SOURCE_LABELS[source]}</span>
                <div
                  className="w-2 h-2 rounded-full pulse-dot"
                  style={{ background: getSourceColor(source) }}
                />
              </div>
              <div className="text-2xl font-bold font-mono">{count}</div>
              <div className="text-[11px] text-muted-foreground">filtered events</div>
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
          <StatusBadge variant="info">USD</StatusBadge>
        </div>
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
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
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'p-3 rounded-lg border transition-all',
                    event.minutesUntil <= 18 && event.impact === 'HIGH'
                      ? 'bg-[oklch(0.66_0.22_25/8%)] border-[oklch(0.66_0.22_25/30%)]'
                      : 'bg-white/5 border-border/30 hover:border-border/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: getImpactColor(event.impact) }}
                        />
                        <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                          {event.impact}
                        </span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{SOURCE_LABELS[event.source]}</span>
                        {event.minutesUntil <= 18 && event.impact === 'HIGH' && (
                          <StatusBadge variant="danger">SOON</StatusBadge>
                        )}
                      </div>
                      <div className="text-sm font-medium text-foreground truncate">{event.title}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-muted-foreground">In</div>
                      <div className={cn(
                        'text-sm font-mono font-semibold',
                        event.minutesUntil <= 30 ? 'text-[oklch(0.85_0.15_25)]' : 'text-foreground'
                      )}>
                        {event.minutesUntil}m
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border/20 text-[11px]">
                    <div>
                      <div className="text-muted-foreground">Forecast</div>
                      <div className="font-mono text-foreground/90">{event.forecast ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Previous</div>
                      <div className="font-mono text-foreground/90">{event.previous ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Time</div>
                      <div className="font-mono text-foreground/90">
                        {new Date(event.eventTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  )
}
