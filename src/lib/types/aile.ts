/**
 * AILE v1.0 — Apex Institutional Liquidity Engine
 *
 * Type system for the 12-phase institutional analysis engine.
 * The engine follows ICT/SMC methodology and outputs WAIT when any
 * of the 8 entry conditions are not met.
 *
 * Educational only — never financial advice. Probability-based analysis.
 */

import type { Timeframe, TrendDirection, TradingSession, SMCAnalysis, MTFAnalysis } from './hisab'

// ===== Phase 1: Higher Timeframe Context =====
export interface HTFContext {
  monthly: TimeframeBias
  weekly: TimeframeBias
  daily: TimeframeBias
  h4: TimeframeBias
  h1: TimeframeBias
  primaryTrend: TrendDirection
  institutionalBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  premiumDiscount: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM'
  majorSwingHigh: number
  majorSwingLow: number
  liquidityPools: LiquidityPool[]
  protectedHighs: number[]
  protectedLows: number[]
  keyLevels: KeyLevel[]
  institutionalOrderBlocks: InstitutionalOB[]
  fairValueGaps: FVGZone[]
  breakerBlocks: BreakerBlock[]
  mitigationBlocks: MitigationBlock[]
  aligned: boolean
}

export interface TimeframeBias {
  timeframe: Timeframe
  trend: TrendDirection
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  premiumDiscount: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM'
  swingHigh: number
  swingLow: number
  notes: string
}

export interface LiquidityPool {
  price: number
  type: 'BUY_SIDE' | 'SELL_SIDE'
  scope: 'INTERNAL' | 'EXTERNAL'
  strength: 'WEAK' | 'MEDIUM' | 'STRONG'
  swept: boolean
  sweptAt?: number
  description: string
}

export interface KeyLevel {
  price: number
  type: 'DAILY_OB' | '4H_OB' | 'WEEKLY_OB' | 'LIQUIDITY' | 'EQUAL_HIGHS' | 'EQUAL_LOWS' | 'FIBONACCI' | 'PREVIOUS_HIGH' | 'PREVIOUS_LOW' | 'IMBALANCE'
  strength: 'WEAK' | 'MEDIUM' | 'STRONG'
  description: string
  confluence: number // count of overlapping concepts
}

export interface InstitutionalOB {
  id: string
  high: number
  low: number
  type: 'BULLISH' | 'BEARISH'
  timeframe: Timeframe
  fresh: boolean
  unmitigated: boolean
  highVolume: boolean
  institutional: boolean
  rank: 'A_PLUS' | 'A' | 'B' | 'REJECT'
  fvgConfluence: boolean
  fibConfluence: boolean
  score: number
  description: string
}

export interface FVGZone {
  id: string
  high: number
  low: number
  type: 'BULLISH' | 'BEARISH'
  timeframe: Timeframe
  filled: boolean
  fillPct: number
}

export interface BreakerBlock {
  high: number
  low: number
  type: 'BULLISH' | 'BEARISH'
  timeframe: Timeframe
  description: string
}

export interface MitigationBlock {
  high: number
  low: number
  type: 'BULLISH' | 'BEARISH'
  timeframe: Timeframe
  description: string
}

// ===== Phase 3: Fibonacci Framework =====
export interface FibonacciFramework {
  swingHigh: number
  swingLow: number
  direction: 'UP' | 'DOWN'
  levels: {
    level: number
    price: number
    label: string
    zone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM' | 'OTE'
  }[]
  premiumZone: { high: number; low: number }
  discountZone: { high: number; low: number }
  oteZone: { high: number; low: number } // 0.618 - 0.79
  equilibrium: number // 0.5
  currentLevel: number // current price position relative to fib
  inOTE: boolean
  inPremium: boolean
  inDiscount: boolean
}

// ===== Phase 4: Liquidity Confirmation =====
export interface LiquidityConfirmation {
  buySideLiquidity: LiquidityPool[]
  sellSideLiquidity: LiquidityPool[]
  equalHighs: number[]
  equalLows: number[]
  stopHunts: LiquidityPool[]
  liquiditySweeps: LiquidityPool[]
  inducement: { price: number; type: 'BUY' | 'SELL' }[]
  internalLiquidity: LiquidityPool[]
  externalLiquidity: LiquidityPool[]
  liquidityEngineered: boolean
  sweepDirection: 'BULLISH' | 'BEARISH' | 'NONE'
  description: string
}

// ===== Phase 5: Structure Confirmation =====
export interface StructureConfirmation {
  eventType: 'BOS' | 'CHOCH' | 'NONE'
  direction: 'BULLISH' | 'BEARISH' | 'NONE'
  price: number
  strong: boolean
  candleClose: boolean
  description: string
  confirmed: boolean
}

// ===== Phase 6: Order Block Detection =====
export interface OBDetection {
  orderBlocks: InstitutionalOB[]
  bestOB: InstitutionalOB | null
  description: string
}

// ===== Phase 7: Entry Conditions =====
export interface EntryConditions {
  htfBias: boolean
  keyLevel: boolean
  liquiditySweep: boolean
  bosOrChoch: boolean
  institutionalOB: boolean
  fibConfluence: boolean
  premiumDiscountAlignment: boolean
  cleanRR: boolean
  allMet: boolean
  missing: string[]
  description: string
}

// ===== Phase 8 & 9: Stop Loss & Take Profits =====
export interface RiskManagement {
  entry: number
  stopLoss: number
  tp1: number // nearest internal liquidity
  tp2: number // opposing liquidity pool
  tp3: number // higher timeframe target
  riskDistance: number
  reward1: number
  reward2: number
  reward3: number
  rr1: number
  rr2: number
  rr3: number
  invalidation: string
}

// ===== Phase 10: Trade Management =====
export interface TradeManagement {
  afterTP1: string
  afterTP2: string
  afterTP3: string
  trailingPlan: string
  breakEvenTrigger: string
  description: string
}

// ===== Phase 11: Confidence Score =====
export interface ConfidenceScore {
  htfAlignment: number
  liquidity: number
  obQuality: number
  fvg: number
  session: number
  news: number
  riskReward: number
  trendStrength: number
  momentum: number
  marketStructure: number
  total: number
  label: 'A_PLUS' | 'A' | 'B' | 'C' | 'WAIT'
  description: string
}

// ===== Phase 12: Output =====
export interface AILEOutput {
  marketBias: 'BUY' | 'SELL' | 'WAIT'
  confidence: number
  confidenceLabel: ConfidenceScore['label']
  trend: TrendDirection
  keyLevel: KeyLevel | null
  liquidityType: string
  structure: string
  orderBlock: InstitutionalOB | null
  fibonacciZone: string
  entry: number | null
  stopLoss: number | null
  tp1: number | null
  tp2: number | null
  tp3: number | null
  riskReward: number | null
  invalidation: string
  tradeManagementPlan: TradeManagement
  expectedSession: TradingSession
  narrative: string
  educationalNote: string
}

// ===== Full AILE Analysis =====
export interface AILEAnalysis {
  phase1: HTFContext
  phase2: { atKeyLevel: boolean; level: KeyLevel | null; confluence: number; description: string }
  phase3: FibonacciFramework
  phase4: LiquidityConfirmation
  phase5: StructureConfirmation
  phase6: OBDetection
  phase7: EntryConditions
  phase8to9: RiskManagement | null
  phase10: TradeManagement
  phase11: ConfidenceScore
  phase12: AILEOutput
  timestamp: number
  symbol: string
  currentPrice: number
}
