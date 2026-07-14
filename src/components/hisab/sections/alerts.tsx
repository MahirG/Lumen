'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Waves, TrendingUp, Shuffle, SquareStack, CircleDot,
  Columns3, ArrowUpCircle, ArrowDownCircle, Anchor, Equal, X, BellRing,
} from 'lucide-react'
import { GlassCard, SectionHeading, StatusBadge } from '../primitives'
import { Button } from '@/components/ui/button'
import { useMarketStore } from '@/lib/hisab/market-store'
import { getAlertLabel, getSeverityColor } from '@/lib/hisab/alerts'
import { formatNumber } from '@/lib/hisab/risk-manager'
import type { AlertType, AlertSeverity } from '@/lib/types/hisab'
import { cn } from '@/lib/utils'

const ALERT_ICONS: Record<AlertType, React.ComponentType<{ className?: string }>> = {
  LIQUIDITY_SWEEP: Waves,
  BOS: TrendingUp,
  CHOCH: Shuffle,
  ORDER_BLOCK: SquareStack,
  MITIGATION: CircleDot,
  FVG_FILL: Columns3,
  PREMIUM: ArrowUpCircle,
  DISCOUNT: ArrowDownCircle,
  INDUCEMENT: Anchor,
  EQUAL_HIGHS_LOWS: Equal,
}

export function SmartAlerts() {
  const alerts = useMarketStore(s => s.alerts)
  const refreshAlerts = useMarketStore(s => s.refreshAlerts)
  const acknowledgeAlert = useMarketStore(s => s.acknowledgeAlert)
  const [filter, setFilter] = React.useState<AlertSeverity | 'ALL'>('ALL')
  const [enabledTypes, setEnabledTypes] = React.useState<Set<AlertType>>(new Set([
    'LIQUIDITY_SWEEP', 'CHOCH', 'BOS', 'ORDER_BLOCK', 'FVG_FILL',
    'PREMIUM', 'DISCOUNT', 'MITIGATION', 'INDUCEMENT', 'EQUAL_HIGHS_LOWS',
  ]))

  const filtered = alerts.filter(a =>
    enabledTypes.has(a.type) &&
    (filter === 'ALL' || a.severity === filter)
  )

  const toggleType = (type: AlertType) => {
    setEnabledTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const criticalCount = alerts.filter(a => a.severity === 'critical').length
  const warnCount = alerts.filter(a => a.severity === 'warn').length
  const infoCount = alerts.filter(a => a.severity === 'info').length

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 text-center" hover>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Critical</div>
          <div className="text-3xl font-mono font-bold text-[oklch(0.85_0.15_25)]">{criticalCount}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">action required</div>
        </GlassCard>
        <GlassCard className="p-4 text-center" hover>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Warnings</div>
          <div className="text-3xl font-mono font-bold text-[oklch(0.92_0.14_85)]">{warnCount}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">monitor closely</div>
        </GlassCard>
        <GlassCard className="p-4 text-center" hover>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Info</div>
          <div className="text-3xl font-mono font-bold text-[oklch(0.85_0.13_230)]">{infoCount}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">informational</div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Severity:</span>
          {(['ALL', 'critical', 'warn', 'info'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-all',
                filter === s
                  ? 'text-foreground border-[oklch(0.82_0.15_85/40%)] bg-[oklch(0.82_0.15_85/10%)]'
                  : 'text-muted-foreground border-border/30 hover:border-border/60'
              )}
            >
              {s.toUpperCase()}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => refreshAlerts('15M')} className="text-xs">
              <BellRing className="w-3.5 h-3.5 mr-1" /> Refresh
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(ALERT_ICONS) as AlertType[]).map(type => {
            const Icon = ALERT_ICONS[type]
            const enabled = enabledTypes.has(type)
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium border transition-all',
                  enabled
                    ? 'bg-white/5 border-border/50 text-foreground'
                    : 'border-transparent text-muted-foreground/40 line-through'
                )}
                title={getAlertLabel(type)}
              >
                <Icon className="w-3 h-3" />
                {getAlertLabel(type)}
              </button>
            )
          })}
        </div>
      </GlassCard>

      {/* Alert feed */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold font-display flex items-center gap-2">
            <Bell className="w-4 h-4 text-[oklch(0.92_0.14_85)]" /> Live Alert Feed
          </h3>
          <StatusBadge variant={filtered.length > 0 ? 'gold' : 'neutral'}>
            {filtered.length} active
          </StatusBadge>
        </div>
        <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Bell className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No active alerts. Markets are quiet.</p>
              </motion.div>
            ) : (
              filtered.map((alert, i) => {
                const Icon = ALERT_ICONS[alert.type]
                const color = getSeverityColor(alert.severity)
                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.02 }}
                    className="group relative flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-border/30 hover:border-border/50 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold" style={{ color }}>{getAlertLabel(alert.type)}</span>
                        <StatusBadge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'warn' ? 'gold' : 'info'}>
                          {alert.severity}
                        </StatusBadge>
                        <span className="text-[10px] text-muted-foreground font-mono">{alert.timeframe}</span>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground font-mono">
                        <span>@ ${formatNumber(alert.price, 2)}</span>
                        <span>{new Date(alert.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
                      aria-label="Dismiss alert"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      <div className="text-[11px] text-muted-foreground italic text-center">
        Alerts are generated from real-time SMC detection. Educational only — verify before acting.
      </div>
    </div>
  )
}
