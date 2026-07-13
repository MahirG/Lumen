'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Plus, Trash2, X, TrendingUp, TrendingDown, Award,
  Target, Calendar, Brain, AlertCircle, BarChart3,
} from 'lucide-react'
import { GlassCard, SectionHeading, StatusBadge, ProgressBar } from '../primitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatNumber } from '@/lib/hisab/risk-manager'
import { computeJournalStats, getEmotionOptions, getMistakeOptions } from '@/lib/hisab/journal-stats'
import type { TradeJournalEntry, TradeResult, TradeDirection, TradingSession, Timeframe } from '@/lib/types/hisab'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'hisab-journal-v1'

export function TradeJournal() {
  const [trades, setTrades] = React.useState<TradeJournalEntry[]>([])
  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const { toast } = useToast()

  // Load from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as TradeJournalEntry[]
        setTrades(parsed)
      } else {
        // Seed sample trades
        const sample = generateSampleTrades()
        setTrades(sample)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sample))
      }
    } catch (e) {
      console.error('Failed to load journal', e)
    }
  }, [])

  const persistTrades = (next: TradeJournalEntry[]) => {
    setTrades(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const stats = React.useMemo(() => computeJournalStats(trades), [trades])

  const handleSave = (entry: Omit<TradeJournalEntry, 'id' | 'createdAt'>) => {
    if (editingId) {
      const next = trades.map(t => t.id === editingId ? { ...t, ...entry } : t)
      persistTrades(next)
      toast({ title: 'Trade updated' })
    } else {
      const newEntry: TradeJournalEntry = {
        ...entry,
        id: `trade-${Date.now()}`,
        createdAt: Date.now(),
      }
      persistTrades([newEntry, ...trades])
      toast({ title: 'Trade added to journal' })
    }
    setShowForm(false)
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    persistTrades(trades.filter(t => t.id !== id))
    toast({ title: 'Trade deleted' })
  }

  const handleEdit = (trade: TradeJournalEntry) => {
    setEditingId(trade.id)
    setShowForm(true)
  }

  return (
    <div className="space-y-5">
      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} icon={<Award className="w-4 h-4" />} color="text-[oklch(0.92_0.14_85)]" />
        <StatBox label="Total P&L" value={formatCurrency(stats.totalPnL)} icon={<TrendingUp className="w-4 h-4" />} color={stats.totalPnL >= 0 ? 'text-[oklch(0.85_0.15_145)]' : 'text-[oklch(0.85_0.15_25)]'} />
        <StatBox label="Profit Factor" value={formatNumber(stats.profitFactor, 2)} icon={<BarChart3 className="w-4 h-4" />} color="text-foreground" />
        <StatBox label="Total Trades" value={String(stats.totalTrades)} icon={<BookOpen className="w-4 h-4" />} color="text-foreground" />
        <StatBox label="Wins / Losses" value={`${stats.wins} / ${stats.losses}`} icon={<Target className="w-4 h-4" />} color="text-foreground" />
        <StatBox label="Avg R:R" value={`1:${formatNumber(stats.avgRR, 2)}`} icon={<Scale className="w-4 h-4" />} color="text-[oklch(0.92_0.14_85)]" />
        <StatBox label="Avg Win" value={formatCurrency(stats.avgWin)} icon={<TrendingUp className="w-4 h-4" />} color="text-[oklch(0.85_0.15_145)]" />
        <StatBox label="Avg Loss" value={formatCurrency(-stats.avgLoss)} icon={<TrendingDown className="w-4 h-4" />} color="text-[oklch(0.85_0.15_25)]" />
      </div>

      {/* Streak & emotion stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" /> Streaks
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-md bg-white/5">
              <span className="text-xs text-muted-foreground">Current streak</span>
              <span className={cn('font-mono font-semibold', stats.currentStreak > 0 ? 'text-[oklch(0.85_0.15_145)]' : stats.currentStreak < 0 ? 'text-[oklch(0.85_0.15_25)]' : 'text-muted-foreground')}>
                {stats.currentStreak > 0 ? `${stats.currentStreak}W` : stats.currentStreak < 0 ? `${Math.abs(stats.currentStreak)}L` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md bg-white/5">
              <span className="text-xs text-muted-foreground">Longest win streak</span>
              <span className="font-mono font-semibold text-[oklch(0.85_0.15_145)]">{stats.longestWinStreak}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md bg-white/5">
              <span className="text-xs text-muted-foreground">Longest loss streak</span>
              <span className="font-mono font-semibold text-[oklch(0.85_0.15_25)]">{stats.longestLossStreak}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md bg-white/5">
              <span className="text-xs text-muted-foreground">Best trade</span>
              <span className="font-mono font-semibold text-[oklch(0.85_0.15_145)]">{formatCurrency(stats.bestTrade)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md bg-white/5">
              <span className="text-xs text-muted-foreground">Worst trade</span>
              <span className="font-mono font-semibold text-[oklch(0.85_0.15_25)]">{formatCurrency(stats.worstTrade)}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-muted-foreground" /> Win Rate by Emotion
          </h4>
          {Object.keys(stats.emotionStats).length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No emotion data yet. Tag your trades!</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats.emotionStats).map(([emotion, data]) => (
                <div key={emotion}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">{emotion}</span>
                    <span className="font-mono">{data.winRate.toFixed(0)}% ({data.count})</span>
                  </div>
                  <ProgressBar
                    value={data.winRate}
                    color={data.winRate >= 60 ? 'bull' : data.winRate >= 40 ? 'gold' : 'bear'}
                    height={5}
                  />
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" /> Trade Distribution
          </h4>
          <div className="space-y-2">
            <DistributionRow label="Open" value={stats.open} total={stats.totalTrades} color="oklch(0.7 0.1 230)" />
            <DistributionRow label="Wins" value={stats.wins} total={stats.totalTrades} color="oklch(0.72 0.18 145)" />
            <DistributionRow label="Losses" value={stats.losses} total={stats.totalTrades} color="oklch(0.66 0.22 25)" />
            <DistributionRow label="Breakeven" value={stats.breakeven} total={stats.totalTrades} color="oklch(0.75 0.02 60)" />
          </div>
          <div className="mt-4 pt-3 border-t border-border/30">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-muted-foreground">Win rate</span>
              <span className="font-mono">{stats.winRate.toFixed(1)}%</span>
            </div>
            <ProgressBar value={stats.winRate} color="gold" height={8} />
          </div>
        </GlassCard>
      </div>

      {/* Add trade button */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold font-display">Trade History</h3>
        <Button
          onClick={() => { setEditingId(null); setShowForm(true) }}
          className="bg-gradient-to-r from-[oklch(0.78_0.16_85)] to-[oklch(0.72_0.18_75)] text-[oklch(0.16_0.012_240)] hover:opacity-90 font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Trade
        </Button>
      </div>

      {/* Trade list */}
      <GlassCard className="p-3">
        <div className="max-h-[480px] overflow-y-auto space-y-1.5">
          {trades.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No trades yet. Click "Add Trade" to log your first one.
            </div>
          ) : (
            trades.map((trade, i) => (
              <TradeRow
                key={trade.id}
                trade={trade}
                onEdit={() => handleEdit(trade)}
                onDelete={() => handleDelete(trade.id)}
                delay={i * 0.02}
              />
            ))
          )}
        </div>
      </GlassCard>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <TradeForm
            initial={editingId ? trades.find(t => t.id === editingId) : undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingId(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function StatBox({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <GlassCard className="p-4" hover>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-muted-foreground/70">{icon}</span>
      </div>
      <div className={cn('text-xl font-mono font-bold', color)}>{value}</div>
    </GlassCard>
  )
}

function DistributionRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function TradeRow({ trade, onEdit, onDelete, delay }: {
  trade: TradeJournalEntry
  onEdit: () => void
  onDelete: () => void
  delay: number
}) {
  const resultVariant = trade.result === 'WIN' ? 'bull' : trade.result === 'LOSS' ? 'bear' : trade.result === 'BE' ? 'neutral' : 'info'
  const dirVariant = trade.direction === 'BUY' ? 'bull' : 'bear'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ delay }}
      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/[0.07] transition-colors"
    >
      <div className={cn(
        'w-9 h-9 rounded-md flex items-center justify-center shrink-0',
        trade.direction === 'BUY' ? 'bg-[oklch(0.72_0.18_145/15%)]' : 'bg-[oklch(0.66_0.22_25/15%)]'
      )}>
        {trade.direction === 'BUY'
          ? <TrendingUp className="w-4 h-4 text-[oklch(0.85_0.15_145)]" />
          : <TrendingDown className="w-4 h-4 text-[oklch(0.85_0.15_25)]" />}
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-6 gap-2 items-center text-xs">
        <div>
          <div className="text-muted-foreground text-[10px]">Symbol</div>
          <div className="font-mono font-medium truncate">{trade.symbol}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10px]">Direction</div>
          <StatusBadge variant={dirVariant}>{trade.direction}</StatusBadge>
        </div>
        <div>
          <div className="text-muted-foreground text-[10px]">Entry / Exit</div>
          <div className="font-mono text-[11px]">{formatNumber(trade.entryPrice, 2)} {trade.exitPrice && `→ ${formatNumber(trade.exitPrice, 2)}`}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10px]">Lot</div>
          <div className="font-mono">{formatNumber(trade.lotSize, 2)}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10px]">P&L</div>
          <div className={cn('font-mono font-semibold', (trade.pnl ?? 0) >= 0 ? 'text-[oklch(0.85_0.15_145)]' : 'text-[oklch(0.85_0.15_25)]')}>
            {trade.pnl !== undefined ? formatCurrency(trade.pnl) : '—'}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10px]">Result</div>
          <StatusBadge variant={resultVariant}>{trade.result}</StatusBadge>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 px-2 text-xs">Edit</Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 px-2 text-xs text-[oklch(0.7_0.2_25)] hover:text-[oklch(0.85_0.15_25)]">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  )
}

function TradeForm({ initial, onSave, onCancel }: {
  initial?: TradeJournalEntry
  onSave: (entry: Omit<TradeJournalEntry, 'id' | 'createdAt'>) => void
  onCancel: () => void
}) {
  const [form, setForm] = React.useState({
    symbol: initial?.symbol ?? 'XAUUSD',
    direction: initial?.direction ?? 'BUY' as TradeDirection,
    entryPrice: initial?.entryPrice ?? 2650,
    stopLoss: initial?.stopLoss ?? 2647,
    takeProfit1: initial?.takeProfit1 ?? 2656,
    takeProfit2: initial?.takeProfit2 ?? 2662,
    takeProfit3: initial?.takeProfit3 ?? 2668,
    lotSize: initial?.lotSize ?? 0.5,
    exitPrice: initial?.exitPrice ?? undefined,
    pnl: initial?.pnl ?? undefined,
    result: initial?.result ?? 'OPEN' as TradeResult,
    session: initial?.session ?? 'LONDON' as TradingSession,
    timeframe: initial?.timeframe ?? '15M' as Timeframe,
    setupType: initial?.setupType ?? 'SMC Order Block',
    emotion: initial?.emotion ?? '',
    mistakes: initial?.mistakes ?? '',
    notes: initial?.notes ?? '',
    bias: initial?.bias ?? '',
    confidence: initial?.confidence ?? 70,
    riskReward: initial?.riskReward ?? 2,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-strong rounded-xl border-border/50"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold font-display">{initial ? 'Edit Trade' : 'Add Trade'}</h3>
            <Button variant="ghost" size="icon" type="button" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Symbol</Label>
              <Input value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs">Direction</Label>
              <Select value={form.direction} onValueChange={v => setForm({ ...form, direction: v as TradeDirection })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">BUY</SelectItem>
                  <SelectItem value="SELL">SELL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Result</Label>
              <Select value={form.result} onValueChange={v => setForm({ ...form, result: v as TradeResult })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="WIN">Win</SelectItem>
                  <SelectItem value="LOSS">Loss</SelectItem>
                  <SelectItem value="BE">Breakeven</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Entry Price</Label>
              <Input type="number" step="0.01" value={form.entryPrice} onChange={e => setForm({ ...form, entryPrice: parseFloat(e.target.value) || 0 })} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs">Stop Loss</Label>
              <Input type="number" step="0.01" value={form.stopLoss} onChange={e => setForm({ ...form, stopLoss: parseFloat(e.target.value) || 0 })} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs">Lot Size</Label>
              <Input type="number" step="0.01" value={form.lotSize} onChange={e => setForm({ ...form, lotSize: parseFloat(e.target.value) || 0 })} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs">Exit Price</Label>
              <Input type="number" step="0.01" value={form.exitPrice ?? ''} onChange={e => setForm({ ...form, exitPrice: e.target.value ? parseFloat(e.target.value) : undefined })} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs">P&L ($)</Label>
              <Input type="number" step="0.01" value={form.pnl ?? ''} onChange={e => setForm({ ...form, pnl: e.target.value ? parseFloat(e.target.value) : undefined })} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs">R:R</Label>
              <Input type="number" step="0.1" value={form.riskReward} onChange={e => setForm({ ...form, riskReward: parseFloat(e.target.value) || 0 })} className="mt-1 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs">Session</Label>
              <Select value={form.session} onValueChange={v => setForm({ ...form, session: v as TradingSession })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASIAN">Asian</SelectItem>
                  <SelectItem value="LONDON">London</SelectItem>
                  <SelectItem value="NEW_YORK">New York</SelectItem>
                  <SelectItem value="OFF_SESSION">Off Session</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Timeframe</Label>
              <Select value={form.timeframe} onValueChange={v => setForm({ ...form, timeframe: v as Timeframe })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['1M','5M','15M','1H','4H','D','W','M'].map(tf => (
                    <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Setup Type</Label>
              <Input value={form.setupType} onChange={e => setForm({ ...form, setupType: e.target.value })} className="mt-1 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Emotion</Label>
              <Select value={form.emotion} onValueChange={v => setForm({ ...form, emotion: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select emotion" /></SelectTrigger>
                <SelectContent>
                  {getEmotionOptions().map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Mistakes (comma-separated)</Label>
              <Input value={form.mistakes} onChange={e => setForm({ ...form, mistakes: e.target.value })} placeholder="e.g. Moved stop loss, Oversized" className="mt-1 text-sm" />
            </div>
            <div className="col-span-2 md:col-span-3">
              <Label className="text-xs">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="What was the thesis? What did you learn?" className="mt-1 text-sm min-h-[60px]" />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-[oklch(0.78_0.16_85)] to-[oklch(0.72_0.18_75)] text-[oklch(0.16_0.012_240)] font-semibold">
              {initial ? 'Update Trade' : 'Add Trade'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function Scale({ className }: { className?: string }) {
  return <Award className={className} />
}

function generateSampleTrades(): TradeJournalEntry[] {
  const now = Date.now()
  return [
    {
      id: `trade-${now - 86400000 * 7}`,
      symbol: 'XAUUSD',
      direction: 'BUY',
      entryPrice: 2635.50,
      stopLoss: 2631.20,
      takeProfit1: 2640,
      takeProfit2: 2645,
      takeProfit3: 2652,
      lotSize: 0.5,
      riskReward: 2.1,
      result: 'WIN',
      pnl: 315,
      exitPrice: 2645,
      session: 'LONDON',
      timeframe: '15M',
      setupType: 'SMC Order Block',
      emotion: 'Calm',
      mistakes: '',
      notes: 'Clean OB retest after liquidity sweep. Followed plan exactly.',
      createdAt: now - 86400000 * 7,
      closedAt: now - 86400000 * 7 + 3600000 * 3,
    },
    {
      id: `trade-${now - 86400000 * 5}`,
      symbol: 'XAUUSD',
      direction: 'SELL',
      entryPrice: 2648.80,
      stopLoss: 2653.20,
      takeProfit1: 2642,
      takeProfit2: 2636,
      takeProfit3: 2628,
      lotSize: 0.4,
      riskReward: 1.5,
      result: 'LOSS',
      pnl: -176,
      exitPrice: 2653.20,
      session: 'NEW_YORK',
      timeframe: '5M',
      setupType: 'CHoCH Reversal',
      emotion: 'Anxious',
      mistakes: 'Entered too early, Moved stop loss',
      notes: 'Chased the entry without waiting for confirmation. Stop hit, then market reversed.',
      createdAt: now - 86400000 * 5,
      closedAt: now - 86400000 * 5 + 3600000 * 2,
    },
    {
      id: `trade-${now - 86400000 * 3}`,
      symbol: 'XAUUSD',
      direction: 'BUY',
      entryPrice: 2642.10,
      stopLoss: 2638.40,
      takeProfit1: 2650,
      takeProfit2: 2656,
      takeProfit3: 2662,
      lotSize: 0.6,
      riskReward: 2.3,
      result: 'WIN',
      pnl: 468,
      exitPrice: 2656,
      session: 'LONDON',
      timeframe: '1H',
      setupType: 'FVG Fill + OB',
      emotion: 'Confident',
      mistakes: '',
      notes: 'Perfect confluence: FVG fill into bullish OB during London KZ.',
      createdAt: now - 86400000 * 3,
      closedAt: now - 86400000 * 3 + 3600000 * 4,
    },
    {
      id: `trade-${now - 86400000 * 2}`,
      symbol: 'XAUUSD',
      direction: 'BUY',
      entryPrice: 2655.00,
      stopLoss: 2650.50,
      takeProfit1: 2662,
      takeProfit2: 2668,
      takeProfit3: 2675,
      lotSize: 0.3,
      riskReward: 2.0,
      result: 'OPEN',
      session: 'NEW_YORK',
      timeframe: '15M',
      setupType: 'OB Mitigation',
      emotion: 'Disciplined',
      mistakes: '',
      notes: 'Long from bullish OB after BOS confirmation. Targeting TP2.',
      createdAt: now - 86400000 * 2,
    },
  ]
}
