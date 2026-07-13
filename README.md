# Hisab Gold AI — XAUUSD Smart Money Trading Assistant

> **⚠ Educational tool — not financial advice.** This is a probability-based analysis platform that never guarantees profits and never executes trades. Always do your own research and risk management.

An award-winning, production-grade AI Trading Assistant for XAUUSD (Gold) that combines **Smart Money Concepts (SMC)**, **ICT methodology**, **Price Action**, and **Risk Management** into a single beautiful, responsive web application.

![Hisab Gold AI](https://img.shields.io/badge/XAUUSD-SMC%20%2B%20ICT%20%2B%20AI-brightgold) ![Next.js 16](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS%204-38bdf8) ![PWA](https://img.shields.io/badge/PWA-Ready-purple)

---

## ✨ Features

### 1. Live Dashboard
Real-time XAUUSD price ticker, RSI, ATR, ADX trend strength, volume, spread, volatility, current session, and countdown to next high-impact news.

### 2. Chart Analysis + AI Vision
- Upload TradingView screenshots — the AI reads candlestick structure and detects SMC elements
- Live lightweight-charts candlestick visualization with SMC overlays
- Detects: Trend, BOS, CHoCH, Liquidity, Order Blocks, FVGs, Equal Highs/Lows, Inducement, Premium/Discount zones

### 3. AI Decision Engine
Outputs probability-based trade setups:
- **Market Bias**: BUY / SELL / NEUTRAL
- **Confidence Score**: 0–100%
- **Entry Zone, Stop Loss, TP1, TP2, TP3**
- **Risk:Reward Ratio**
- **Trade Invalidation** conditions
- **Expected Session** (Asian / London / New York)

### 4. Multi-Timeframe Analysis
Simultaneous bias matrix across Monthly → Weekly → Daily → 4H → 1H → 15M → 5M → 1M with weighted alignment scoring.

### 5. Session Detector
ICT kill zone highlighting for Asian, London, and New York sessions with 24-hour UTC timeline visualization.

### 6. Economic News Filter
Aggregates high-impact USD news from Forex Factory, Trading Economics, and Investing.com with 18-minute warning window.

### 7. Gold Strength Meter
Composite score from DXY, US10Y yields, interest rate outlook, volatility (VIX), and safe-haven demand.

### 8. AI Risk Manager
Position sizing calculator for XAUUSD — input account balance, risk %, entry, SL, TP, and leverage to compute lot size, max loss, max profit, R:R, margin requirement.

### 9. Trade Journal
Log trades with entry/exit/P&L/screenshot/emotion/mistakes/notes. Tracks win rate, profit factor, current streak, longest streaks, and emotion-based win-rate analytics. Persists to localStorage.

### 10. Smart Alerts
Real-time SMC event notifications: Liquidity Sweep, BOS, CHoCH, Order Block, Mitigation, FVG Fill, Premium/Discount zone entries, Inducement, Equal Highs/Lows.

### 11. AI Coach
Professional mentor-style explanations of every trade setup — walks through higher-timeframe context, liquidity narrative, CHoCH/BOS, order block entry logic, FVG confluence, premium/discount, session recommendation, and risk warnings.

### 12. Beautiful UI
- Dark mode first with gold accent system
- Glassmorphism cards with backdrop blur
- Framer Motion animations (60 FPS)
- Mobile-first responsive layout
- PWA manifest
- Custom scrollbar, pulse dots, ticker flash animations
- Premium typography (Outfit display + Geist sans/mono)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Charts | lightweight-charts v5 (TradingView) |
| State | Zustand (client) + TanStack Query (server) |
| Animations | Framer Motion |
| Database | Prisma ORM + SQLite |
| Realtime | Socket.IO (mini-service on port 3003) |
| AI Vision | z-ai-web-dev-sdk (GLM-4V) |
| Auth | NextAuth.js v4 |
| Icons | lucide-react |
| Forms | react-hook-form + zod |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze-chart/      # AI Vision + SMC engine endpoint
│   │   ├── dashboard/          # Aggregated dashboard data
│   │   ├── gold-strength/      # Gold strength meter API
│   │   ├── news/               # News filter API
│   │   ├── risk/               # Risk calculator API
│   │   └── trades/             # Trade journal CRUD
│   ├── globals.css             # Gold theme + glassmorphism utilities
│   ├── layout.tsx              # Root layout with ThemeProvider
│   └── page.tsx                # Main app shell with section router
├── components/
│   ├── hisab/
│   │   ├── sections/           # 11 feature sections (dashboard, chart, ...)
│   │   ├── header.tsx          # Live ticker header
│   │   ├── sidebar.tsx         # Navigation sidebar
│   │   ├── smc-chart.tsx       # TradingView chart with SMC overlays
│   │   └── primitives.tsx      # GlassCard, StatCard, ProgressBar, etc.
│   └── providers/              # ThemeProvider
└── lib/
    ├── hisab/
    │   ├── smc-engine.ts       # BOS/CHoCH/OB/FVG/Liquidity detection
    │   ├── mtf-analysis.ts     # Multi-timeframe bias aggregation
    │   ├── sessions.ts         # ICT kill zone session logic
    │   ├── news.ts             # Economic news generation
    │   ├── gold-strength.ts    # DXY/yields/volatility scoring
    │   ├── risk-manager.ts     # Position size & R:R math
    │   ├── ai-coach.ts         # Mentor-style explanation generator
    │   ├── journal-stats.ts    # Trade journal analytics
    │   ├── alerts.ts           # Smart alert generator
    │   ├── market-store.ts     # Zustand live market store
    │   └── use-realtime.ts     # WebSocket client hook
    └── types/
        └── hisab.ts            # Full domain type system

mini-services/
└── realtime-service/           # Socket.IO server on port 3003
    ├── index.ts                # Live price ticks + alert broadcasts
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ or Bun
- npm/bun package manager

### Installation

```bash
# Clone the repo
git clone https://github.com/MahirG/Lumen.git
cd Lumen

# Install dependencies
bun install
cd mini-services/realtime-service && bun install && cd ../..

# Set up the database
bun run db:push

# Start the realtime service (in background)
cd mini-services/realtime-service && bun run dev &

# Start the dev server
bun run dev
```

Open `http://localhost:3000` to view the app.

### Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start Next.js dev server (port 3000) |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to SQLite |
| `bun run db:generate` | Regenerate Prisma Client |
| `bun run build` | Production build |
| `bun run start` | Start production server |

---

## 🧠 SMC / ICT Concepts Implemented

| Concept | Description |
|---------|-------------|
| **BOS (Break of Structure)** | Price closes beyond prior swing high/low, confirming trend continuation |
| **CHoCH (Change of Character)** | First sign of trend reversal — price breaks opposite-side structure |
| **Order Block** | Last down/up candle before strong impulsive move — institutional order placement zone |
| **Fair Value Gap (FVG)** | 3-candle imbalance where wicks of candle 1 and 3 don't overlap |
| **Liquidity Sweep** | Price briefly penetrates beyond key high/low (where stops rest) and reverses |
| **Equal Highs/Lows** | Multiple swing points at the same price — liquidity pools |
| **Inducement** | Minor liquidity resting above/below an OB — trap for retail traders |
| **Premium/Discount** | Upper/lower halves of the swing range — equilibrium at 50% |
| **Kill Zones** | ICT-defined high-probability windows: Asian, London, NY AM |

---

## 🛡 Risk Management

The AI Risk Manager computes:
- **Lot size** = riskAmount / (stopDistance × contractSize)
- **Max loss** = accountBalance × riskPercent
- **Max profit** = profitDistance × contractSize × lotSize
- **R:R** = maxProfit / maxLoss
- **Margin required** = (entryPrice × contractSize × lotSize) / leverage

XAUUSD specifications:
- Contract size: 100 oz per 1.0 lot
- Pip value: $1 per $0.01 move per lot
- Default leverage: 1:100

---

## 📡 Realtime WebSocket Service

A separate Socket.IO mini-service runs on port 3003 to push:
- Live XAUUSD price ticks (every 1.2s)
- SMC alert notifications (random 4% chance per tick)
- Session change notifications (every 30s)

The frontend connects via `io('/?XTransformPort=3003')` which Caddy proxies to the service.

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze-chart` | POST | AI Vision + SMC engine analysis (accepts imageBase64) |
| `/api/dashboard` | GET | Aggregated dashboard data |
| `/api/news` | GET | Upcoming economic news with filter |
| `/api/gold-strength` | GET | Gold strength composite score |
| `/api/risk` | POST | Position size & R:R calculation |
| `/api/trades` | GET, POST, DELETE | Trade journal CRUD |

---

## ⚖ Disclaimer

**This tool is for educational purposes and should not be considered financial advice.**

- The AI never guarantees profits
- The AI never says "100% accurate"
- All analysis is probability-based
- Always explain WHY a setup is being recommended
- Never risk more than you can afford to lose
- Always confirm with your own research

---

## 📝 License

MIT License — see LICENSE file for details.

---

## 🙏 Credits

Built with ❤ by **MahirG** using Next.js, Tailwind CSS, TradingView Lightweight Charts, and the Z.ai SDK.

Smart Money Concepts & ICT methodology inspired by the work of Michael J. Huddleston (ICT).
