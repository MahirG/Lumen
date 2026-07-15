/**
 * ApexEAPro Institutional OTE AI Engine (2026 Edition)
 *
 * Professional institutional-grade market analysis and trading system
 * built around Smart Money Concepts (SMC), ICT methodology, Liquidity
 * Engineering, Market Structure, and the Optimal Trade Entry (OTE) model.
 *
 * Mission: NOT to force trades. Patiently wait for the highest-probability
 * institutional setup. If every required condition is not satisfied,
 * DO NOT generate a trade — display "NO TRADE – WAIT FOR INSTITUTIONAL CONFIRMATION"
 *
 * Capital preservation is the first priority.
 */

// ============================================================
// SUPPORTED MARKETS
// ============================================================
export const OTE_MARKETS = [
  'XAUUSD',
  'EURUSD',
  'GBPUSD',
  'USDJPY',
  'BTCUSD',
  'NAS100',
  'US30',
  'SP500',
] as const

// ============================================================
// TIMEFRAMES
// ============================================================
export const OTE_TIMEFRAMES = [
  'Daily',
  'H4',
  'H1',
  'M30',
  'M15',
  'M5',
  'M1',
] as const

// ============================================================
// SESSION PRIORITY (ICT Kill Zones)
// ============================================================
export const SESSION_PRIORITY = {
  LONDON: { priority: 5, label: 'London', description: '★★★★★ London' },
  NEW_YORK: { priority: 5, label: 'New York', description: '★★★★★ New York' },
  OVERLAP: { priority: 4, label: 'London-New York Overlap', description: '★★★★ London-New York Overlap' },
  ASIAN: { priority: 1, label: 'Asian', description: '★★ Asian (reject unless enabled)' },
} as const

// ============================================================
// NEWS FILTER — Major events that block trading
// ============================================================
export const MAJOR_NEWS_EVENTS = [
  'FOMC',
  'CPI',
  'NFP',
  'PPI',
  'GDP',
  'Interest Rate',
  'Powell Speech',
  'ECB Rate Decision',
  'BoE Rate Decision',
  'BoJ Rate Decision',
] as const

export const NEWS_BLOCK_MINUTES = 20 // Reject trades if major news < 20 min away

// ============================================================
// FIBONACCI LEVELS (OTE Zone)
// ============================================================
export const FIBONACCI_LEVELS = {
  ZERO: 0,
  HALF: 0.5,
  OTE_START: 0.618,
  OTE_MIN: 0.705, // Institutional Optimal Trade Entry — lower bound
  OTE_MAX: 0.71,  // Institutional Optimal Trade Entry — upper bound
  OTE_DEEP: 0.786,
  EXTENSION: 0.91,
  TP2_NEGATIVE: -0.21, // Fibonacci extension for TP2
} as const

// ============================================================
// 11-STEP METHODOLOGY
// ============================================================
export const OTE_STEPS = [
  {
    step: 1,
    name: 'Higher Timeframe Bias',
    description: 'Begin from Daily and H4. Determine overall trend, HH/HL/LH/LL, MSS, BOS, Premium/Discount. If Daily and H4 disagree → NO TRADE.',
    requirements: [
      'Overall trend identified',
      'Higher Highs / Higher Lows confirmed',
      'Lower Highs / Lower Lows confirmed',
      'Market Structure Shift (MSS) detected',
      'Break of Structure (BOS) confirmed',
      'Premium or Discount zone identified',
    ],
  },
  {
    step: 2,
    name: 'Session Filter',
    description: 'Only allow trades during institutional sessions. Priority: London ★★★★★, New York ★★★★★, Overlap ★★★★. Reject Asian unless specifically enabled.',
    requirements: [
      'Current Session displayed',
      'Remaining Session Time shown',
      'Session Strength calculated',
    ],
  },
  {
    step: 3,
    name: 'News Filter',
    description: 'Check economic calendar. Reject trades if major news (FOMC, CPI, NFP, PPI, GDP, Interest Rate, Powell Speech) is less than 20 minutes away.',
    requirements: [
      'No FOMC within 20 min',
      'No CPI within 20 min',
      'No NFP within 20 min',
      'No PPI within 20 min',
      'No GDP within 20 min',
      'No Interest Rate decision within 20 min',
      'No Powell Speech within 20 min',
    ],
  },
  {
    step: 4,
    name: 'Identify Swings',
    description: 'Automatically detect Swing High, Swing Low, Internal Swing, External Swing. Ignore weak swings — only institutional swings are valid.',
    requirements: [
      'Swing High confirmed',
      'Swing Low confirmed',
      'Internal Swing identified',
      'External Swing identified',
    ],
  },
  {
    step: 5,
    name: 'Internal Shift',
    description: 'Wait for Internal Market Structure Shift. Break of internal low (Sell) or internal high (Buy). If not present → reject.',
    requirements: [
      'Internal low broken (for Sell)',
      'OR internal high broken (for Buy)',
    ],
  },
  {
    step: 6,
    name: 'External Shift',
    description: 'Wait for external BOS. Institutional trend must change. If external BOS does not exist → reject.',
    requirements: [
      'External BOS confirmed',
      'Institutional trend change validated',
    ],
  },
  {
    step: 7,
    name: 'Liquidity Engine',
    description: 'Detect Equal Highs, Equal Lows, Buy Side Liquidity, Sell Side Liquidity, Liquidity Pools, Liquidity Sweep, Stop Hunt. The liquidity sweep MUST occur before entry.',
    requirements: [
      'Equal Highs/Lows detected',
      'Buy Side / Sell Side Liquidity mapped',
      'Liquidity Pool identified',
      'Liquidity Sweep completed',
      'Stop Hunt confirmed',
    ],
  },
  {
    step: 8,
    name: 'Draw Fibonacci',
    description: 'For SELL: Swing High → Swing Low. For BUY: Swing Low → Swing High. Display levels: 0, 0.5, 0.618, 0.705, 0.71, 0.786, 0.91, -0.21.',
    requirements: [
      'Fibonacci drawn correctly',
      'All levels displayed (0, 0.5, 0.618, 0.705, 0.71, 0.786, 0.91, -0.21)',
    ],
  },
  {
    step: 9,
    name: 'OTE Zone',
    description: 'Only accept retracement inside 0.705–0.71. This is the institutional Optimal Trade Entry. Too shallow → reject. Too deep → reject.',
    requirements: [
      'Price retraced to 0.705–0.71 zone',
      'Retracement not too shallow',
      'Retracement not too deep',
    ],
  },
  {
    step: 10,
    name: 'Order Block',
    description: 'Inside OTE, detect Bearish Order Block (Sell) or Bullish Order Block (Buy). Must be fresh, not mitigated, and align with higher timeframe.',
    requirements: [
      'Order Block detected inside OTE',
      'Order Block is fresh (not mitigated)',
      'Order Block aligns with HTF',
    ],
  },
  {
    step: 11,
    name: 'Entry Confirmation',
    description: 'Never enter immediately. Wait for ALL confirmations: Liquidity Sweep, OTE, Order Block Reaction, Strong Displacement Candle, Lower Timeframe BOS, Candle Close.',
    requirements: [
      '✓ Liquidity Sweep Completed',
      '✓ OTE Reached (0.705–0.71)',
      '✓ Order Block Reaction',
      '✓ Strong Displacement Candle',
      '✓ Lower Timeframe BOS',
      '✓ Candle Close Confirmation',
    ],
  },
] as const

// ============================================================
// TRADE EXECUTION FLOW
// ============================================================
export const SELL_FLOW = [
  'Higher Timeframe Bearish',
  '↓',
  'Internal Shift',
  '↓',
  'External BOS',
  '↓',
  'Liquidity Sweep',
  '↓',
  'OTE (0.705–0.71)',
  '↓',
  'Bearish Order Block',
  '↓',
  'Lower Timeframe BOS',
  '↓',
  'SELL',
] as const

export const BUY_FLOW = [
  'Higher Timeframe Bullish',
  '↓',
  'Internal Shift',
  '↓',
  'External BOS',
  '↓',
  'Liquidity Sweep',
  '↓',
  'OTE (0.705–0.71)',
  '↓',
  'Bullish Order Block',
  '↓',
  'Lower Timeframe BOS',
  '↓',
  'BUY',
] as const

// ============================================================
// STOP LOSS RULES
// ============================================================
export const STOP_LOSS_RULES = {
  SELL: 'Place Stop Loss above the institutional invalidation level. Never use random pip stops. Always based on market structure.',
  BUY: 'Place Stop Loss below the institutional invalidation level. Never use random pip stops. Always based on market structure.',
} as const

// ============================================================
// TAKE PROFIT SYSTEM — Only Two TPs
// ============================================================
export const TAKE_PROFIT_SYSTEM = {
  TP1: {
    BUY: 'Previous Swing High',
    SELL: 'Previous Swing Low',
    action: 'Secure partial profit. Move Stop Loss to Break Even if enabled.',
  },
  TP2: {
    BUY: 'Fibonacci Extension -0.21',
    SELL: 'Fibonacci Extension -0.21',
    action: 'Final institutional target. After TP2, trade closed.',
  },
} as const

// ============================================================
// RISK MANAGEMENT
// ============================================================
export const RISK_MANAGEMENT = {
  maxRiskPerTrade: 0.01, // 1% default
  maxDailyLoss: 0.03, // 3%
  maxConsecutiveLosses: 3,
  maxTradesPerSession: 2,
  rule: 'If any limit is reached, disable trading until next trading day.',
} as const

// ============================================================
// AI CONFIDENCE ENGINE
// ============================================================
export const CONFIDENCE_FACTORS = [
  'Higher Timeframe Trend',
  'Market Structure',
  'Liquidity Sweep',
  'OTE Quality',
  'Order Block Quality',
  'Session Quality',
  'News Safety',
  'Risk Reward',
  'Entry Confirmation',
] as const

export const TRADE_GRADES = ['A+', 'A', 'B', 'C'] as const

// ============================================================
// NOTIFICATION SYSTEM
// ============================================================
export const NOTIFICATION_TRIGGERS = [
  'Institutional Bias Changes',
  'Liquidity Sweep Detected',
  'OTE Zone Reached',
  'Entry Confirmed',
  'Stop Loss Hit',
  'TP1 Reached',
  'TP2 Reached',
  'High Impact News Incoming',
  'London Opens',
  'New York Opens',
] as const

export const NOTIFICATION_CHANNELS = [
  'Push Notification',
  'Telegram',
  'Discord',
  'Email',
  'SMS (Optional)',
] as const

// ============================================================
// FINAL DECISION CHECKLIST
// ============================================================
export const FINAL_DECISION_CHECKLIST = [
  '✅ Higher Timeframe Bias',
  '✅ Session Valid',
  '✅ No High Impact News',
  '✅ Swing High and Swing Low Confirmed',
  '✅ Internal Shift',
  '✅ External BOS',
  '✅ Liquidity Sweep',
  '✅ OTE (0.705–0.71)',
  '✅ Fresh Order Block',
  '✅ Lower Timeframe Confirmation',
  '✅ Risk Management Passed',
] as const

// ============================================================
// OUTPUT FORMATS
// ============================================================
export const TRADE_CONFIRMED_OUTPUT = `🟢 INSTITUTIONAL TRADE CONFIRMED

Direction: [BUY / SELL]
Entry Price: $XX,XXX.XX
Stop Loss: $XX,XXX.XX
TP1: $XX,XXX.XX (Previous Swing)
TP2: $XX,XXX.XX (Fibonacci -0.21 Extension)
Risk Reward Ratio: 1:R.X
Confidence Score: XX%
Trade Grade: [A+ / A / B / C]

Institutional Reasoning:
[Step-by-step explanation of why this trade qualifies]`

export const NO_TRADE_OUTPUT = `❌ NO TRADE — WAIT FOR INSTITUTIONAL CONFIRMATION

[Reason: which step(s) failed]

Capital preservation is the first priority. Never force a setup. Never chase price.`

// ============================================================
// FULL SYSTEM PROMPT FOR AI CHAT
// ============================================================
export const OTE_SYSTEM_PROMPT = `# APEXEAPRO INSTITUTIONAL OTE AI ENGINE (2026 EDITION)

You are the ApexEAPro Institutional AI Engine, a professional institutional-grade market analysis and trading system built around Smart Money Concepts (SMC), ICT methodology, Liquidity Engineering, Market Structure, and the Optimal Trade Entry (OTE) model.

Your mission is NOT to force trades. Your mission is to patiently wait for the highest-probability institutional setup. If every required condition is not satisfied, DO NOT generate a trade.

Instead display:

❌ NO TRADE – WAIT FOR INSTITUTIONAL CONFIRMATION

Capital preservation is the first priority.

---

SUPPORTED MARKETS
• XAUUSD
• EURUSD
• GBPUSD
• USDJPY
• BTCUSD
• NAS100
• US30
• SP500

Timeframes: Daily, H4, H1, M30, M15, M5, M1

---

STEP 1 — HIGHER TIMEFRAME BIAS
Always begin from Daily and H4. Determine overall trend, HH/HL/LH/LL, MSS, BOS, Premium/Discount. If Daily and H4 disagree → NO TRADE. Only trade with higher timeframe institutional order flow.

STEP 2 — SESSION FILTER
Only allow trades during institutional sessions.
Priority: ★★★★★ London, ★★★★★ New York, ★★★★ London-New York Overlap.
Reject Asian session trades unless specifically enabled.
Display: Current Session, Remaining Session Time, Session Strength.

STEP 3 — NEWS FILTER
Check economic calendar. Reject trades if major news is approaching (FOMC, CPI, NFP, PPI, GDP, Interest Rate, Powell Speech). If major news is less than 20 minutes away → NO TRADE.

STEP 4 — IDENTIFY SWINGS
Detect Swing High, Swing Low, Internal Swing, External Swing. Ignore weak swings. Only institutional swings are valid.

STEP 5 — INTERNAL SHIFT
Wait for Internal Market Structure Shift. Break of internal low (Sell) or internal high (Buy). If not present → reject.

STEP 6 — EXTERNAL SHIFT
Wait for external BOS. Institutional trend must change. If external BOS does not exist → reject.

STEP 7 — LIQUIDITY ENGINE
Detect Equal Highs, Equal Lows, Buy Side Liquidity, Sell Side Liquidity, Liquidity Pools, Liquidity Sweep, Stop Hunt. The liquidity sweep MUST occur before entry. If no sweep → reject.

STEP 8 — DRAW FIBONACCI
For SELL: Swing High → Swing Low. For BUY: Swing Low → Swing High.
Display: 0, 0.5, 0.618, 0.705, 0.71, 0.786, 0.91, -0.21.

STEP 9 — OTE ZONE
Only accept retracement inside 0.705–0.71. This is the institutional Optimal Trade Entry. Too shallow → reject. Too deep → reject.

STEP 10 — ORDER BLOCK
Inside OTE detect Bearish Order Block (Sell) or Bullish Order Block (Buy). Must be fresh, not mitigated, and align with higher timeframe.

STEP 11 — ENTRY CONFIRMATION
Never enter immediately. Wait for confirmation. Require ALL:
✓ Liquidity Sweep Completed
✓ OTE Reached
✓ Order Block Reaction
✓ Strong Displacement Candle
✓ Lower Timeframe BOS
✓ Candle Close Confirmation
If one condition is missing → reject trade.

---

ENTRY EXECUTION

SELL: HTF Bearish → Internal Shift → External BOS → Liquidity Sweep → OTE (0.705–0.71) → Bearish OB → Lower TF BOS → SELL

BUY: HTF Bullish → Internal Shift → External BOS → Liquidity Sweep → OTE (0.705–0.71) → Bullish OB → Lower TF BOS → BUY

---

STOP LOSS
SELL: Above institutional invalidation level.
BUY: Below institutional invalidation level.
Never use random pip stops. Always based on market structure.

---

TAKE PROFIT SYSTEM — Only Two TPs
TP1: Previous Swing High (BUY) / Previous Swing Low (SELL). Secure partial profit, move SL to BE.
TP2: Fibonacci Extension -0.21. Final institutional target. After TP2, trade closed.

---

RISK MANAGEMENT
Max Risk Per Trade: 1% (user configurable)
Max Daily Loss: 3%
Max Consecutive Losses: 3
Max Trades Per Session: 2
If any limit reached → disable trading until next trading day.

---

AI CONFIDENCE ENGINE
Calculate confidence from: HTF Trend, Market Structure, Liquidity Sweep, OTE Quality, OB Quality, Session Quality, News Safety, Risk Reward, Entry Confirmation.
Display: Confidence Score (%), Trade Grade (A+, A, B, C).
Only execute trades when confidence is above the user-defined threshold (e.g., 85%).

---

NOTIFICATION SYSTEM
Notify when: Bias Changes, Liquidity Sweep, OTE Reached, Entry Confirmed, SL Hit, TP1/TP2 Reached, High Impact News, London Opens, New York Opens.
Channels: Push, Telegram, Discord, Email, SMS.

---

FINAL DECISION
Before every trade verify:
✅ Higher Timeframe Bias
✅ Session Valid
✅ No High Impact News
✅ Swing High and Swing Low Confirmed
✅ Internal Shift
✅ External BOS
✅ Liquidity Sweep
✅ OTE (0.705–0.71)
✅ Fresh Order Block
✅ Lower Timeframe Confirmation
✅ Risk Management Passed

If ALL conditions are TRUE → Display:
🟢 INSTITUTIONAL TRADE CONFIRMED
Direction, Entry Price, Stop Loss, TP1, TP2, Risk Reward Ratio, Confidence Score, Institutional Reasoning

If ANY condition fails → Display only:
❌ NO TRADE — WAIT FOR INSTITUTIONAL CONFIRMATION

Never force a setup. Never chase price. Trade only when every institutional condition aligns exactly according to the ApexEAPro Institutional OTE Strategy.

---

IMPORTANT: This engine is for educational purposes and should not be considered financial advice. Trading involves substantial risk of loss.`
