/**
 * Hisab Gold AI — Risk Manager
 *
 * Calculates position size, lot size, max loss, max profit, and R:R for XAUUSD.
 * Educational only — not financial advice.
 *
 * XAUUSD specifications:
 *   - Contract size: 100 oz per 1.0 lot
 *   - Pip = $0.01 move (1 cent)
 *   - Pip value per 1.0 lot = $1.00 (100 oz * $0.01)
 *   - Margin requirement varies by broker (typically 1:100 to 1:500 leverage)
 */

import type { RiskCalculation } from '@/lib/types/hisab'

const XAUUSD_CONTRACT_SIZE = 100 // oz per lot
const XAUUSD_PIP_VALUE_PER_LOT = 1.0 // $1 per $0.01 move per lot
const DEFAULT_LEVERAGE = 100 // 1:100

export interface RiskInput {
  accountBalance: number
  riskPercent: number
  entryPrice: number
  stopLoss: number
  takeProfit?: number
  leverage?: number
}

export function calculateRisk(input: RiskInput): RiskCalculation {
  const {
    accountBalance,
    riskPercent,
    entryPrice,
    stopLoss,
    takeProfit,
    leverage = DEFAULT_LEVERAGE,
  } = input

  const riskAmount = accountBalance * (riskPercent / 100)
  const stopDistance = Math.abs(entryPrice - stopLoss)
  // stopDistance is in dollars. Each $1 move on 1 lot = $100.
  const lossPerLot = stopDistance * XAUUSD_CONTRACT_SIZE

  // Lot size: riskAmount / lossPerLot
  const lotSize = lossPerLot > 0 ? riskAmount / lossPerLot : 0

  // Max loss = risk amount
  const maximumLoss = riskAmount

  // Max profit if takeProfit is provided
  let maximumProfit = 0
  let riskReward = 0
  if (takeProfit) {
    const profitDistance = Math.abs(takeProfit - entryPrice)
    const profitPerLot = profitDistance * XAUUSD_CONTRACT_SIZE
    maximumProfit = profitPerLot * lotSize
    riskReward = riskAmount > 0 ? Math.round((maximumProfit / riskAmount) * 100) / 100 : 0
  } else {
    // Default 2R if no TP given
    riskReward = 2
    maximumProfit = riskAmount * 2
  }

  // Margin required
  const marginRequired = (entryPrice * XAUUSD_CONTRACT_SIZE * lotSize) / leverage

  return {
    accountBalance,
    riskPercent,
    riskAmount,
    lotSize: Math.round(lotSize * 100) / 100,
    maximumLoss,
    maximumProfit: Math.round(maximumProfit * 100) / 100,
    riskReward,
    pipValue: XAUUSD_PIP_VALUE_PER_LOT * lotSize,
    marginRequired: Math.round(marginRequired * 100) / 100,
    contractSize: XAUUSD_CONTRACT_SIZE,
  }
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatLotSize(lot: number): string {
  if (lot >= 1) return lot.toFixed(2)
  if (lot >= 0.1) return lot.toFixed(2)
  return lot.toFixed(3)
}

export function getPipValue(): number {
  return XAUUSD_PIP_VALUE_PER_LOT
}

export function getContractSize(): number {
  return XAUUSD_CONTRACT_SIZE
}
