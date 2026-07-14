/**
 * Hisab Gold AI — Core Domain Types
 * Educational XAUUSD analysis platform. Probability-based, never financial advice.
 */

export type MarketBias = 'BUY' | 'SELL' | 'NEUTRAL'
export type TrendDirection = 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'RANGING'
export type TradingSession = 'ASIAN' | 'LONDON' | 'NEW_YORK' | 'OFF_SESSION'
export type NewsImpact = 'HIGH' | 'MEDIUM' | 'LOW' | 'NON_ECONOMIC'
export type NewsSource = 'ForexFactory' | 'TradingEconomics' | 'Investing'
export type AlertType =
  | 'LIQUIDITY_SWEEP'
  | 'BOS'
  | 'CHOCH'
  | 'ORDER_BLOCK'
  | 'MITIGATION'
  | 'FVG_FILL'
  | 'PREMIUM'
  | 'DISCOUNT'
  | 'INDUCEMENT'
  | 'EQUAL_HIGHS_LOWS'
export type AlertSeverity = 'info' | 'warn' | 'critical'
export type Timeframe =
  | '1M'
  | '5M'
  | '15M'
  | '1H'
  | '4H'
  | 'D'
  | 'W'
  | 'M'
export type TradeResult = 'OPEN' | 'WIN' | 'LOSS' | 'BE' | 'CANCELLED'
export type TradeDirection = 'BUY' | 'SELL'

export interface PriceTick {
  symbol: string
  bid: number
  ask: number
  last: number
  change: number
  changePct: number
  high: number
  low: number
  open: number
  volume: number
  timestamp: number
}

export interface IndicatorSnapshot {
  rsi: number
  atr: number
  volatility: number
  trendStrength: number
  volume: number
  spread: number
  adx: number
}

export interface LiquidityLevel {
  price: number
  type: 'BUY_SIDE' | 'SELL_SIDE'
  strength: 'WEAK' | 'MEDIUM' | 'STRONG'
  swept: boolean
  sweptAt?: number
}

export interface OrderBlock {
  id: string
  high: number
  low: number
  type: 'BULLISH' | 'BEARISH'
  mitigated: boolean
  mitigationPct: number
  timeframe: Timeframe
}

export interface FairValueGap {
  id: string
  high: number
  low: number
  type: 'BULLISH' | 'BEARISH'
  filled: boolean
  fillPct: number
  timeframe: Timeframe
  createdAt: number
}

export interface StructureEvent {
  id: string
  type: 'BOS' | 'CHOCH' | 'MSS' | 'MSB'
  direction: 'BULLISH' | 'BEARISH'
  price: number
  timeframe: Timeframe
  timestamp: number
}

export interface SMCAnalysis {
  trend: TrendDirection
  trendStrength: number
  structure: {
    bosEvents: StructureEvent[]
    chochEvents: StructureEvent[]
    lastEvent?: StructureEvent
  }
  liquidity: LiquidityLevel[]
  orderBlocks: OrderBlock[]
  fvgs: FairValueGap[]
  equalHighs: number[]
  equalLows: number[]
  inducement: { price: number; type: 'BUY' | 'SELL' }[]
  premiumZone: { high: number; low: number }
  discountZone: { high: number; low: number }
  equilibrium: number
  swingHigh: number
  swingLow: number
}

export interface TradeSetup {
  bias: MarketBias
  confidence: number
  reasons: string[]
  entryZone: { low: number; high: number; optimal: number }
  stopLoss: number
  takeProfit1: number
  takeProfit2: number
  takeProfit3: number
  riskReward: number
  invalidation: string
  expectedSession: TradingSession
  invalidationLevels: number[]
}

export interface TimeframeAnalysis {
  timeframe: Timeframe
  bias: MarketBias
  trend: TrendDirection
  structure: 'BOS_BULL' | 'BOS_BEAR' | 'CHoCH_BULL' | 'CHoCH_BEAR' | 'RANGE'
  premiumDiscount: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM'
  liquiditySweep: boolean
  notes: string
}

export interface MTFAnalysis {
  monthly: TimeframeAnalysis
  weekly: TimeframeAnalysis
  daily: TimeframeAnalysis
  h4: TimeframeAnalysis
  h1: TimeframeAnalysis
  m15: TimeframeAnalysis
  m5: TimeframeAnalysis
  m1: TimeframeAnalysis
  overallBias: MarketBias
  overallConfidence: number
  alignment: number
}

export interface NewsEvent {
  id: string
  source: NewsSource
  title: string
  currency: string
  country?: string         // ISO currency code (USD, EUR, GBP, JPY, etc.) for flag display
  impact: NewsImpact
  actual?: string
  forecast?: string
  previous?: string
  eventTime: number
  minutesUntil: number
  url?: string             // link to source calendar
}

export interface NewsFilter {
  highImpact: boolean
  mediumImpact: boolean
  lowImpact: boolean
  minutesWindow: number
  shouldWarn: boolean
  nextEvent?: NewsEvent
}

export interface GoldStrengthComponents {
  dxy: { value: number; change: number; impact: number }
  us10y: { value: number; change: number; impact: number }
  interestRates: { value: number; trend: 'HAWKISH' | 'DOVISH' | 'NEUTRAL'; impact: number }
  volatility: { value: number; percentile: number; impact: number }
  safeHaven: { value: number; impact: number }
}

export interface GoldStrength {
  score: number
  label: 'VERY_STRONG' | 'STRONG' | 'NEUTRAL' | 'WEAK' | 'VERY_WEAK'
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  components: GoldStrengthComponents
  summary: string
}

export interface RiskCalculation {
  accountBalance: number
  riskPercent: number
  riskAmount: number
  lotSize: number
  maximumLoss: number
  maximumProfit: number
  riskReward: number
  pipValue: number
  marginRequired: number
  contractSize: number
}

export interface TradeJournalEntry {
  id: string
  symbol: string
  direction: TradeDirection
  bias?: string
  confidence?: number
  entryPrice: number
  stopLoss: number
  takeProfit1?: number
  takeProfit2?: number
  takeProfit3?: number
  lotSize: number
  riskReward?: number
  result: TradeResult
  pnl?: number
  exitPrice?: number
  screenshotUrl?: string
  emotion?: string
  mistakes?: string
  notes?: string
  session?: TradingSession
  timeframe?: Timeframe
  setupType?: string
  createdAt: number
  closedAt?: number
}

export interface JournalStats {
  totalTrades: number
  wins: number
  losses: number
  breakeven: number
  open: number
  winRate: number
  totalPnL: number
  avgRR: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  bestTrade: number
  worstTrade: number
  currentStreak: number
  longestWinStreak: number
  longestLossStreak: number
  emotionStats: Record<string, { count: number; winRate: number }>
}

export interface SessionInfo {
  name: TradingSession
  startTime: string
  endTime: string
  isActive: boolean
  isKillZone: boolean
  killZoneStart?: string
  killZoneEnd?: string
  description: string
  nextSession?: TradingSession
  nextSessionStart?: string
}

export interface DashboardData {
  price: PriceTick
  indicators: IndicatorSnapshot
  session: SessionInfo
  nextNewsCountdown?: number
  newsEvent?: NewsEvent
  lastUpdate: number
}

export interface AIAnalysisRequest {
  imageBase64?: string
  timeframe?: Timeframe
  symbol?: string
  context?: string
  provider?: 'auto' | 'glm' | 'claude' | 'gemini'
}

export interface AIAnalysisResponse {
  analysis: SMCAnalysis
  setup: TradeSetup
  mtf: MTFAnalysis
  coachExplanation: string
  provider: string
  durationMs: number
  disclaimer: string
}
