/**
 * Hisab Gold AI — Trade Journal Statistics
 */

import type { TradeJournalEntry, JournalStats } from '@/lib/types/hisab'

export function computeJournalStats(trades: TradeJournalEntry[]): JournalStats {
  const closed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BE')
  const wins = closed.filter(t => t.result === 'WIN')
  const losses = closed.filter(t => t.result === 'LOSS')
  const breakeven = closed.filter(t => t.result === 'BE')
  const open = trades.filter(t => t.result === 'OPEN')

  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
  const winPnLs = wins.map(t => t.pnl ?? 0)
  const lossPnLs = losses.map(t => t.pnl ?? 0)
  const avgWin = winPnLs.length ? winPnLs.reduce((a, b) => a + b, 0) / winPnLs.length : 0
  const avgLoss = lossPnLs.length ? Math.abs(lossPnLs.reduce((a, b) => a + b, 0) / lossPnLs.length) : 0
  const grossProfit = winPnLs.reduce((a, b) => a + b, 0)
  const grossLoss = Math.abs(lossPnLs.reduce((a, b) => a + b, 0))

  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0

  const avgRR = trades.filter(t => t.riskReward).map(t => t.riskReward ?? 0)
  const avgRRValue = avgRR.length ? avgRR.reduce((a, b) => a + b, 0) / avgRR.length : 0

  // Streaks (based on closed trades in chronological order)
  const sortedClosed = [...closed].sort((a, b) => (a.closedAt ?? a.createdAt) - (b.closedAt ?? b.createdAt))
  let currentStreak = 0
  let longestWinStreak = 0
  let longestLossStreak = 0
  let tempWin = 0
  let tempLoss = 0
  for (let i = sortedClosed.length - 1; i >= 0; i--) {
    const t = sortedClosed[i]
    if (t.result === 'WIN') {
      if (currentStreak >= 0) currentStreak++
      else currentStreak = 1
      tempWin++
      tempLoss = 0
    } else if (t.result === 'LOSS') {
      if (currentStreak <= 0) currentStreak--
      else currentStreak = -1
      tempLoss++
      tempWin = 0
    } else {
      break
    }
    longestWinStreak = Math.max(longestWinStreak, tempWin)
    longestLossStreak = Math.max(longestLossStreak, tempLoss)
  }

  // Emotion stats
  const emotionMap: Record<string, { count: number; wins: number }> = {}
  for (const t of closed) {
    if (!t.emotion) continue
    if (!emotionMap[t.emotion]) emotionMap[t.emotion] = { count: 0, wins: 0 }
    emotionMap[t.emotion].count++
    if (t.result === 'WIN') emotionMap[t.emotion].wins++
  }
  const emotionStats: JournalStats['emotionStats'] = {}
  for (const [emotion, data] of Object.entries(emotionMap)) {
    emotionStats[emotion] = {
      count: data.count,
      winRate: (data.wins / data.count) * 100,
    }
  }

  return {
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    breakeven: breakeven.length,
    open: open.length,
    winRate,
    totalPnL,
    avgRR: avgRRValue,
    avgWin,
    avgLoss,
    profitFactor,
    bestTrade: Math.max(...trades.map(t => t.pnl ?? 0), 0),
    worstTrade: Math.min(...trades.map(t => t.pnl ?? 0), 0),
    currentStreak,
    longestWinStreak,
    longestLossStreak,
    emotionStats,
  }
}

export function getEmotionOptions(): string[] {
  return ['Calm', 'Confident', 'Anxious', 'FOMO', 'Revenge', 'Bored', 'Disciplined', 'Greedy', 'Fearful']
}

export function getMistakeOptions(): string[] {
  return [
    'Moved stop loss',
    'Entered too early',
    'Entered too late',
    'Oversized position',
    'Ignored news',
    'Traded against trend',
    'No setup',
    'Revenge trade',
    'Booked profit too early',
    'Held loss too long',
    'Did not follow plan',
    'Chased the market',
  ]
}
