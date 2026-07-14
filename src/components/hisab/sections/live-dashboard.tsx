'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Activity, TrendingUp, TrendingDown, Gauge, BarChart3,
  Clock, AlertTriangle, Zap, Sigma, DollarSign,
} from 'lucide-react'
import { useMarketStore } from '@/lib/hisab/market-store'
import { GlassCard, StatCard, SectionHeading, StatusBadge, ProgressBar } from '../primitives'
import { formatNumber } from '@/lib/hisab/risk-manager'
import { getCurrentSession, getSessionColor } from '@/lib/hisab/sessions'
import { cn } from '@/lib/utils'

export function LiveDashboard() {
  const price = useMarketStore(s => s.price)
  const indicators = useMarketStore(s => s.indicators)
  const session = useMarketStore(s => s.session)
  const newsEvents = useMarketStore(s => s.newsEvents)
  const dataSource = useMarketStore(s => s.dataSource)
  const lastRealUpdate = useMarketStore(s => s.lastRealUpdate)

  if (!price || !indicators) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#F7A707] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-muted-foreground">Fetching live gold price...</span>
      </div>
    )
  }

  const secondsAgo = lastRealUpdate ? Math.round((Date.now() - lastRealUpdate) / 1000) : null
  const sourceBadge = dataSource === 'live'
    ? { label: 'LIVE • gold-api.com', variant: 'bull' as const }
    : dataSource === 'cached'
    ? { label: 'CACHED', variant: 'gold' as const }
    : { label: 'DEMO MODE', variant: 'info' as const }

  const nextHighNews = newsEvents.find(e => e.impact === 'HIGH' && e.minutesUntil <= 120)
  const rsiColor = indicators.rsi > 70
    ? 'text-[#FF5252]'
    : indicators.rsi < 30
    ? 'text-[#00E676]'
    : 'text-foreground'

  return (
    <div className="space-y-5">
      {/* Live data source banner */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-lg glass-gold"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 rounded-full" style={{
              background: dataSource === 'live' ? '#00E676' : dataSource === 'cached' ? '#F7A707' : '#F7A707'
            }} />
            <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{
              background: dataSource === 'live' ? '#00E676' : dataSource === 'cached' ? '#F7A707' : '#F7A707'
            }} />
          </div>
          <StatusBadge variant={sourceBadge.variant}>{sourceBadge.label}</StatusBadge>
          <span className="text-xs text-muted-foreground">
            Real-time XAUUSD spot price · updates every 20s
          </span>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {secondsAgo !== null && (
            <span>Last sync: {secondsAgo}s ago</span>
          )}
        </div>
      </motion.div>

      {/* Top stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          label="XAUUSD Last"
          value={`$${formatNumber(price.last, 2)}`}
          sub={`Bid: $${formatNumber(price.bid, 2)} · Ask: $${formatNumber(price.ask, 2)}`}
          icon={<DollarSign className="w-4 h-4" />}
          trend={price.change >= 0 ? 'up' : 'down'}
          delay={0}
        />
        <StatCard
          label="Daily Change"
          value={`${price.change >= 0 ? '+' : ''}${formatNumber(price.change, 2)}`}
          sub={`${price.change >= 0 ? '+' : ''}${formatNumber(price.changePct, 2)}%`}
          icon={price.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          trend={price.change >= 0 ? 'up' : 'down'}
          delay={0.05}
        />
        <StatCard
          label="Day Range"
          value={`$${formatNumber(price.high - price.low, 2)}`}
          sub={`H: $${formatNumber(price.high, 2)} · L: $${formatNumber(price.low, 2)}`}
          icon={<Activity className="w-4 h-4" />}
          delay={0.1}
        />
        <StatCard
          label="Spread"
          value={`${formatNumber((price.ask - price.bid) * 100, 1)}¢`}
          sub="Pips"
          icon={<Zap className="w-4 h-4" />}
          delay={0.15}
        />
        <StatCard
          label="RSI (14)"
          value={formatNumber(indicators.rsi, 1)}
          sub={indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
          icon={<Sigma className="w-4 h-4" />}
          delay={0.2}
        />
        <StatCard
          label="ATR (14)"
          value={`$${formatNumber(indicators.atr, 2)}`}
          sub="Average true range"
          icon={<Activity className="w-4 h-4" />}
          delay={0.25}
        />
        <StatCard
          label="Trend Strength (ADX)"
          value={formatNumber(indicators.trendStrength, 0)}
          sub={indicators.trendStrength > 40 ? 'Strong trend' : indicators.trendStrength > 25 ? 'Trending' : 'Ranging'}
          icon={<Gauge className="w-4 h-4" />}
          delay={0.3}
        />
        <StatCard
          label="Volume"
          value={formatNumber(indicators.volume, 0)}
          sub="Avg per bar"
          icon={<BarChart3 className="w-4 h-4" />}
          delay={0.35}
        />
      </div>

      {/* Detailed cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* RSI gauge */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">RSI Oscillator</div>
              <div className={cn('text-3xl font-mono font-bold mt-1', rsiColor)}>
                {formatNumber(indicators.rsi, 1)}
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div>OB: 70+</div>
              <div>OS: 30-</div>
            </div>
          </div>
          <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="absolute inset-0 flex">
              <div className="w-[30%] bg-[rgba(0, 230, 118, 0.20)]" />
              <div className="flex-1 bg-[rgba(247, 167, 7, 0.1)]" />
              <div className="w-[30%] bg-[rgba(255, 82, 82, 0.20)]" />
            </div>
            <motion.div
              initial={{ left: '50%' }}
              animate={{ left: `${indicators.rsi}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#FFC83D] shadow-[0_0_12px_rgba(247, 167, 7, 0.6)] -translate-x-1/2"
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono">
            <span>0</span><span>30</span><span>50</span><span>70</span><span>100</span>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {indicators.rsi > 70
              ? 'Overbought conditions — potential reversal risk.'
              : indicators.rsi < 30
              ? 'Oversold conditions — potential bounce ahead.'
              : indicators.rsi > 50
              ? 'Bullish momentum building.'
              : 'Bearish momentum building.'}
          </div>
        </GlassCard>

        {/* Volatility & ATR */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Volatility & ATR</div>
              <div className="text-3xl font-mono font-bold mt-1 text-[#FFC83D]">
                ${formatNumber(indicators.atr, 2)}
              </div>
            </div>
            <Activity className="w-5 h-5 text-[#F7A707]" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground">Per-bar range</span>
                <span className="font-mono">${formatNumber(indicators.volatility, 2)}</span>
              </div>
              <ProgressBar value={Math.min(100, (indicators.volatility / 5) * 100)} color="gold" height={6} />
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground">ATR vs 14-day avg</span>
                <span className="font-mono">${formatNumber(indicators.atr, 2)}</span>
              </div>
              <ProgressBar value={Math.min(100, (indicators.atr / 10) * 100)} color="bull" height={6} />
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground">Trend Strength</span>
                <span className="font-mono">{formatNumber(indicators.trendStrength, 0)}</span>
              </div>
              <ProgressBar
                value={Math.min(100, indicators.trendStrength)}
                color={indicators.trendStrength > 40 ? 'bull' : 'neutral'}
                height={6}
              />
            </div>
          </div>
        </GlassCard>

        {/* Session & News */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Current Session</div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-2 h-2 rounded-full pulse-dot"
                  style={{ background: session?.isActive ? getSessionColor(session.name) : '#E69500' }}
                />
                <span className="text-2xl font-bold font-display">
                  {session?.name.replace('_', ' ') ?? 'OFF'}
                </span>
                {session?.isKillZone && (
                  <StatusBadge variant="gold">KILL ZONE</StatusBadge>
                )}
              </div>
            </div>
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active window</span>
              <span className="font-mono">{session?.startTime} → {session?.endTime}</span>
            </div>
            {session?.killZoneStart && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kill zone</span>
                <span className="font-mono text-[#FFC83D]">{session.killZoneStart} → {session.killZoneEnd}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next session</span>
              <span className="font-mono">{session?.nextSession?.replace('_', ' ')} @ {session?.nextSessionStart}</span>
            </div>
          </div>
          {nextHighNews && (
            <div className="mt-4 p-2.5 rounded-lg bg-[rgba(255, 82, 82, 0.10)] border border-[rgba(255, 82, 82, 0.3)]">
              <div className="flex items-center gap-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FF5252]" />
                <span className="font-medium text-[#FF7252]">
                  High-impact news in {nextHighNews.minutesUntil}m
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 truncate">
                {nextHighNews.title}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* OHLC bar */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Live OHLC Bar · 1M timeframe</div>
          <StatusBadge variant={price.change >= 0 ? 'bull' : 'bear'}>
            {price.change >= 0 ? 'BULLISH' : 'BEARISH'}
          </StatusBadge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Open', value: price.open, color: '' },
            { label: 'High', value: price.high, color: 'text-[#00E676]' },
            { label: 'Low', value: price.low, color: 'text-[#FF5252]' },
            { label: 'Last', value: price.last, color: 'text-[#FFC83D]' },
            { label: 'Volume', value: indicators.volume, color: '', isVolume: true },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg p-2.5 bg-white/5"
            >
              <div className="text-[10px] uppercase text-muted-foreground tracking-wide">{item.label}</div>
              <div className={cn('text-sm font-mono font-semibold mt-0.5', item.color)}>
                {item.isVolume ? formatNumber(item.value, 0) : `$${formatNumber(item.value, 2)}`}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
