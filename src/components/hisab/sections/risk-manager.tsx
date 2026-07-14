'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Calculator, Wallet, AlertTriangle, TrendingUp, DollarSign, Scale } from 'lucide-react'
import { GlassCard, SectionHeading, StatusBadge, ProgressBar } from '../primitives'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { calculateRisk, formatCurrency, formatNumber, formatLotSize } from '@/lib/hisab/risk-manager'
import { useMarketStore } from '@/lib/hisab/market-store'
import type { RiskCalculation } from '@/lib/types/hisab'

export function RiskManager() {
  const price = useMarketStore(s => s.price)
  const [accountBalance, setAccountBalance] = React.useState(10000)
  const [riskPercent, setRiskPercent] = React.useState(1)
  const [entryPrice, setEntryPrice] = React.useState(price?.last ?? 2650)
  const [stopLoss, setStopLoss] = React.useState((price?.last ?? 2650) - 3)
  const [takeProfit, setTakeProfit] = React.useState((price?.last ?? 2650) + 6)
  const [direction, setDirection] = React.useState<'BUY' | 'SELL'>('BUY')
  const [leverage, setLeverage] = React.useState(100)
  const [result, setResult] = React.useState<RiskCalculation | null>(null)

  React.useEffect(() => {
    if (price) {
      setEntryPrice(price.last)
      setStopLoss(direction === 'BUY' ? price.last - 3 : price.last + 3)
      setTakeProfit(direction === 'BUY' ? price.last + 6 : price.last - 6)
    }
  }, [price?.last])

  React.useEffect(() => {
    const calc = calculateRisk({
      accountBalance, riskPercent, entryPrice, stopLoss, takeProfit, leverage,
    })
    setResult(calc)
  }, [accountBalance, riskPercent, entryPrice, stopLoss, takeProfit, leverage])

  if (!result) return null

  const riskAmount = result.riskAmount
  const profitAmount = result.maximumProfit
  const lossPctOfAccount = (riskAmount / accountBalance) * 100
  const profitPctOfAccount = (profitAmount / accountBalance) * 100

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input panel */}
        <GlassCard className="p-5">
          <h3 className="text-base font-semibold font-display flex items-center gap-2 mb-4">
            <Calculator className="w-4 h-4 text-[oklch(0.92_0.14_85)]" /> Position Inputs
          </h3>
          <div className="space-y-4">
            {/* Direction */}
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Direction</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <button
                  onClick={() => setDirection('BUY')}
                  className={`py-2 rounded-md text-sm font-medium border transition-all ${
                    direction === 'BUY'
                      ? 'bg-[oklch(0.72_0.18_145/15%)] text-[oklch(0.85_0.15_145)] border-[oklch(0.72_0.18_145/40%)]'
                      : 'bg-white/5 text-muted-foreground border-border/30 hover:border-border/60'
                  }`}
                >
                  BUY (Long)
                </button>
                <button
                  onClick={() => setDirection('SELL')}
                  className={`py-2 rounded-md text-sm font-medium border transition-all ${
                    direction === 'SELL'
                      ? 'bg-[oklch(0.66_0.22_25/15%)] text-[oklch(0.85_0.15_25)] border-[oklch(0.66_0.22_25/40%)]'
                      : 'bg-white/5 text-muted-foreground border-border/30 hover:border-border/60'
                  }`}
                >
                  SELL (Short)
                </button>
              </div>
            </div>

            {/* Account balance */}
            <div>
              <Label htmlFor="balance" className="text-xs uppercase tracking-wider text-muted-foreground">Account Balance ($)</Label>
              <Input
                id="balance"
                type="number"
                value={accountBalance}
                onChange={e => setAccountBalance(Math.max(0, parseFloat(e.target.value) || 0))}
                className="mt-1.5 font-mono"
              />
            </div>

            {/* Risk percent */}
            <div>
              <div className="flex justify-between items-center">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Risk Per Trade</Label>
                <span className="text-sm font-mono font-semibold text-[oklch(0.92_0.14_85)]">{riskPercent.toFixed(1)}%</span>
              </div>
              <Slider
                value={[riskPercent]}
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={v => setRiskPercent(v[0])}
                className="mt-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                <span>0.1% (conservative)</span>
                <span>5% (aggressive)</span>
              </div>
            </div>

            {/* Entry / SL / TP */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="entry" className="text-[10px] uppercase tracking-wider text-muted-foreground">Entry</Label>
                <Input id="entry" type="number" step="0.01" value={entryPrice}
                  onChange={e => setEntryPrice(parseFloat(e.target.value) || 0)}
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="sl" className="text-[10px] uppercase tracking-wider text-muted-foreground">Stop Loss</Label>
                <Input id="sl" type="number" step="0.01" value={stopLoss}
                  onChange={e => setStopLoss(parseFloat(e.target.value) || 0)}
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="tp" className="text-[10px] uppercase tracking-wider text-muted-foreground">Take Profit</Label>
                <Input id="tp" type="number" step="0.01" value={takeProfit}
                  onChange={e => setTakeProfit(parseFloat(e.target.value) || 0)}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </div>

            {/* Leverage */}
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Leverage</Label>
              <Select value={String(leverage)} onValueChange={v => setLeverage(parseInt(v))}>
                <SelectTrigger className="mt-1.5 font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100, 200, 500].map(lev => (
                    <SelectItem key={lev} value={String(lev)}>1:{lev}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Results */}
        <div className="space-y-4">
          {/* Main result */}
          <GlassCard variant="strong" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold font-display">Calculated Position</h3>
              <StatusBadge variant={result.riskReward >= 2 ? 'bull' : result.riskReward >= 1 ? 'gold' : 'bear'}>
                R:R 1:{formatNumber(result.riskReward, 2)}
              </StatusBadge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">
                  <Wallet className="w-3 h-3" /> Lot Size
                </div>
                <div className="text-2xl font-mono font-bold text-[oklch(0.92_0.14_85)] mt-1">
                  {formatLotSize(result.lotSize)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  = {formatNumber(result.lotSize * 100, 0)} oz
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">
                  <AlertTriangle className="w-3 h-3" /> Max Loss
                </div>
                <div className="text-2xl font-mono font-bold text-[oklch(0.85_0.15_25)] mt-1">
                  {formatCurrency(-result.maximumLoss)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {lossPctOfAccount.toFixed(1)}% of account
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">
                  <TrendingUp className="w-3 h-3" /> Max Profit
                </div>
                <div className="text-2xl font-mono font-bold text-[oklch(0.85_0.15_145)] mt-1">
                  {formatCurrency(result.maximumProfit)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {profitPctOfAccount.toFixed(1)}% of account
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">
                  <DollarSign className="w-3 h-3" /> Risk Amount
                </div>
                <div className="text-2xl font-mono font-bold mt-1">
                  {formatCurrency(result.riskAmount)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {riskPercent.toFixed(1)}% × balance
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Detailed breakdown */}
          <GlassCard className="p-5">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-muted-foreground" /> Trade Math
            </h4>
            <div className="space-y-2 text-xs">
              <Row label="Stop distance" value={`$${formatNumber(Math.abs(entryPrice - stopLoss), 2)}`} />
              <Row label="Pip value (per lot)" value={`$${formatNumber(result.pipValue / result.lotSize, 2)}`} />
              <Row label="Total pip value" value={`$${formatNumber(result.pipValue, 2)}`} />
              <Row label="Margin required" value={formatCurrency(result.marginRequired)} />
              <Row label="Contract size" value={`${result.contractSize} oz / lot`} />
              <Row label="Margin utilization" value={`${((result.marginRequired / accountBalance) * 100).toFixed(1)}%`} />
            </div>
          </GlassCard>

          {/* Risk visualization */}
          <GlassCard className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Risk vs Reward</div>
            <div className="relative h-8 rounded-lg overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-[oklch(0.55_0.25_25)] to-[oklch(0.66_0.22_25)] flex items-center justify-center text-[10px] font-mono font-bold text-white"
                style={{ width: '33%' }}
              >
                -{formatCurrency(result.maximumLoss)}
              </div>
              <div
                className="bg-gradient-to-r from-[oklch(0.65_0.2_145)] to-[oklch(0.72_0.18_145)] flex items-center justify-center text-[10px] font-mono font-bold text-white"
                style={{ width: `${Math.min(67, result.riskReward / (result.riskReward + 1) * 100)}%` }}
              >
                +{formatCurrency(result.maximumProfit)}
              </div>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground">
              {result.riskReward >= 3 ? 'Excellent R:R — high-quality setup' :
               result.riskReward >= 2 ? 'Good R:R — meets minimum standard' :
               result.riskReward >= 1 ? 'Marginal R:R — consider improving entry' :
               'Poor R:R — reconsider this trade'}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-white/5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  )
}
