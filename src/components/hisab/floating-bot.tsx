'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles, TrendingUp, DollarSign, Clock, Brain, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMarketStore } from '@/lib/hisab/market-store'

interface Message {
  role: 'user' | 'bot'
  text: string
  timestamp: number
}

interface FloatingBotProps {
  onNavigate?: (section: string) => void
}

/**
 * FloatingAI Bot — AI assistant that floats on every page.
 * Answers questions about:
 * - Current market conditions (live price, bias, session)
 * - Trading strategy (SMC, ICT, AILE engine)
 * - The platform features
 * - Pricing and subscription
 * - The developer (HisabTech)
 * - Price levels, news, sessions
 */
export function FloatingAIBot({ onNavigate }: FloatingBotProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: 'bot',
      text: "Hi! I'm ApexBot, your AI trading assistant. Ask me about market conditions, trading strategy, the platform, pricing, or anything else. How can I help?",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const price = useMarketStore(s => s.price)
  const indicators = useMarketStore(s => s.indicators)
  const session = useMarketStore(s => s.session)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const generateResponse = React.useCallback((question: string): string => {
    const q = question.toLowerCase()
    const p = price
    const ind = indicators
    const sess = session

    // Market conditions
    if (q.includes('market') && (q.includes('condition') || q.includes('now') || q.includes('today') || q.includes('current'))) {
      return `📊 **Current Market Conditions**\n\n• XAUUSD: $${p ? p.last.toFixed(2) : 'Loading...'} ${p ? (p.change >= 0 ? `▲ +${p.changePct.toFixed(2)}%` : `▼ ${p.changePct.toFixed(2)}%`) : ''}\n• RSI: ${ind?.rsi.toFixed(0) ?? '—'} ${ind && ind.rsi > 70 ? '(Overbought)' : ind && ind.rsi < 30 ? '(Oversold)' : '(Neutral)'}\n• ATR: $${ind?.atr.toFixed(2) ?? '—'}\n• Trend Strength (ADX): ${ind?.trendStrength.toFixed(0) ?? '—'}\n• Session: ${sess?.name.replace('_', ' ') ?? '—'} ${sess?.isKillZone ? '(KILL ZONE 🔥)' : sess?.isActive ? '(Active)' : ''}\n\n${ind && ind.rsi > 70 ? '⚠️ Overbought — potential reversal risk.' : ind && ind.rsi < 30 ? '⚡ Oversold — potential bounce ahead.' : 'Market is in equilibrium. Waiting for institutional setup.'}`
    }

    // Price
    if (q.includes('price') || q.includes('gold') && q.includes('how much') || q.includes('xauusd') && (q.includes('price') || q.includes('now'))) {
      return `💰 **XAUUSD Live Price**\n\nCurrent: $${p ? p.last.toFixed(2) : 'Loading...'}\nChange: ${p ? (p.change >= 0 ? '+' : '') + p.change.toFixed(2) : '—'} (${p ? (p.change >= 0 ? '+' : '') + p.changePct.toFixed(2) + '%' : '—'})\nDay High: $${p ? p.high.toFixed(2) : '—'}\nDay Low: $${p ? p.low.toFixed(2) : '—'}\nSpread: ${p ? (p.ask - p.bid).toFixed(2) : '—'}\n\nData source: gold-api.com (real-time, refreshed every 20 seconds)`
    }

    // Strategy / SMC
    if (q.includes('strateg') || q.includes('smc') || q.includes('smart money') || q.includes('ict')) {
      return `🧠 **Smart Money Concepts (SMC) Strategy**\n\nApexEAPro uses ICT/SMC methodology:\n\n1. **Liquidity** — Buy-side (above highs) and sell-side (below lows) where stops rest\n2. **Order Blocks** — Last candle before strong move; institutional order placement zones\n3. **Fair Value Gaps (FVGs)** — 3-candle imbalances markets tend to fill\n4. **BOS** — Break of Structure confirms trend continuation\n5. **CHoCH** — Change of Character signals reversal\n6. **Premium/Discount** — Upper half favors shorts, lower half favors longs\n7. **Fibonacci OTE** — Optimal Trade Entry zone: 0.618–0.79 retracement\n\nThe AILE Engine v1.0 implements all of this in 12 phases. Would you like to explore it?`
    }

    // AILE Engine
    if (q.includes('aile') || q.includes('12-phase') || q.includes('liquidity engine')) {
      return `⚙️ **AILE Engine v1.0 — Apex Institutional Liquidity Engine**\n\nA 12-phase institutional analysis system:\n\n1. HTF Context (Monthly→1H bias)\n2. Key Level Validation\n3. Fibonacci Framework (OTE 0.618-0.79)\n4. Liquidity Confirmation (sweep required)\n5. Structure Confirmation (BOS/CHoCH)\n6. Order Block Detection (A+/A/B ranked)\n7. Entry Conditions (ALL 8 must be met)\n8. Stop Loss (below/above sweep)\n9. Take Profits (TP1/TP2/TP3)\n10. Trade Management (BE after TP1)\n11. Confidence Score (0-100)\n12. Output (BUY/SELL/**WAIT**)\n\nIf ANY condition is missing → WAIT. Patience is edge.`
    }

    // Session
    if (q.includes('session') || q.includes('kill zone') || q.includes('london') || q.includes('new york') || q.includes('asian')) {
      return `🕒 **Trading Sessions**\n\nCurrent: ${sess?.name.replace('_', ' ') ?? '—'} ${sess?.isKillZone ? '🔥 KILL ZONE' : sess?.isActive ? '(Active)' : '(Closed)'}\n\n• **Asian**: 00:00–07:00 UTC (accumulation)\n• **London**: 07:00–16:00 UTC (KZ: 07:00–10:00) — highest volatility for gold\n• **New York**: 12:00–21:00 UTC (KZ: 12:00–15:00) — major moves & reversals\n\nKill zones are ICT-defined high-probability windows where institutional liquidity is highest. Trades during kill zones have significantly higher probability.`
    }

    // News
    if (q.includes('news') || q.includes('cpi') || q.includes('nfp') || q.includes('fed') || q.includes('economic')) {
      return `📰 **Economic News Filter**\n\nApexEAPro monitors Forex Factory, Trading Economics, and Investing.com for high-impact events.\n\nAlerts sent at: 60, 30, 15, 5, and 1 minute before releases.\n\nAffected markets: Gold, USD, EURUSD, GBPUSD, US30, NASDAQ\n\n⚠️ **Recommendation**: Avoid opening new positions 15-30 minutes before high-impact news. The ASNE Engine will send you a Critical alert if news overlaps your setup.`
    }

    // Pricing
    if (q.includes('pric') || q.includes('subscription') || q.includes('plan') || q.includes('cost') || q.includes('how much') && !q.includes('gold')) {
      return `💎 **Pricing Plans**\n\n**Professional** — $79/month\n• AI Market Analysis, 8-timeframe matrix, 4 notification channels, Trade Journal, AI Coach, Risk Manager\n\n**Premium** — $199/month ⭐ Most Popular\n• Everything in Pro + AILE Engine v1.0, Unlimited AI Vision, 6 channels, 30 price levels, Priority Support\n\n**Institutional** — $499/month\n• Everything in Premium + 8 channels, unlimited price levels, API access, Dedicated Account Manager\n\nAnnual billing saves 20%. 14-day money-back guarantee on all plans.`
    }

    // Features / what's included
    if (q.includes('feature') || q.includes('what') && (q.includes('include') || q.includes('offer') || q.includes('do')) || q.includes('tool')) {
      return `🔧 **Platform Features**\n\n1. Live Dashboard (real-time XAUUSD data)\n2. Chart Analysis + AI Vision (upload TradingView screenshots)\n3. AI Decision Engine (bias, confidence, entry/SL/TP)\n4. AILE Engine v1.0 (12-phase institutional analysis)\n5. Multi-Timeframe Matrix (8 timeframes)\n6. Session Detector (ICT kill zones)\n7. Economic News Filter (countdown alerts)\n8. Gold Strength Meter (DXY, yields, volatility)\n9. AI Risk Manager (position sizing, R:R)\n10. Trade Journal (emotion analytics, win rate)\n11. Smart Alerts (SMC event notifications)\n12. ASNE Engine (8-channel smart notifications)\n13. AI Coach (mentor-style explanations)\n\nAll educational — never financial advice.`
    }

    // Developer / HisabTech
    if (q.includes('developer') || q.includes('who') && (q.includes('built') || q.includes('made') || q.includes('created')) || q.includes('hisabtech') || q.includes('company')) {
      return `🏢 **About HisabTech**\n\nApexEAPro is built by **HisabTech**, a financial technology company specializing in AI-powered trading intelligence.\n\n🌐 Website: https://hisabtechnologies.com\n💬 Telegram: t.me/mahifxcapital\n🐙 GitHub: github.com/MahirG/Lumen\n\nOur team combines expertise in AI, financial markets, Smart Money Concepts, ICT methodology, and software engineering. We use the same tools we build — ApexEAPro is our daily trading companion.`
    }

    // Risk management
    if (q.includes('risk') || q.includes('stop loss') || q.includes('position size') || q.includes('lot size')) {
      return `🛡️ **Risk Management**\n\nApexEAPro includes a full AI Risk Manager:\n\n• **Position Sizing**: Lot Size = Risk Amount / (Stop Distance × Contract Size)\n• **XAUUSD**: 100 oz per lot, $1 per $0.01 move per lot\n• **Default Risk**: 1% of account balance per trade\n• **Min R:R**: 1:2 (required by AILE Engine)\n• **Stop Loss**: Placed below/above the liquidity sweep — never random\n• **Trade Management**: Move to break-even after TP1, partial at TP2, runner to TP3\n\nThe ASNE Engine also sends Risk Alerts when conditions are unfavorable.`
    }

    // Notification / alerts
    if (q.includes('notif') || q.includes('alert') || q.includes('asne')) {
      return `🔔 **ASNE — AI Smart Notification Engine**\n\n8 alert categories:\n• Trade Setups (BUY/SELL confirmed)\n• Price Levels (key level, OB, FVG, premium/discount)\n• Market Structure (BOS, CHoCH)\n• Smart Money (liquidity sweep, OB, FVG)\n• Sessions (kill zone alerts)\n• Economic News (60/30/15/5/1 min countdowns)\n• Volatility (ATR expansion, spread)\n• Risk (news overlap, off-session)\n\n8 delivery channels: Browser, Mobile, Email, SMS, Telegram, WhatsApp, Discord, In-App\n\nAnti-spam: no duplicates, cooldowns, priority filtering. Only Critical + High trigger push by default.`
    }

    // How does it work
    if (q.includes('how') && (q.includes('work') || q.includes('function'))) {
      return `⚙️ **How ApexEAPro Works**\n\n1. **Data**: Real-time prices from gold-api.com (XAUUSD), CoinGecko (BTC), open.er-api.com (forex)\n2. **Analysis**: AILE Engine runs 12-phase SMC analysis across 8 timeframes\n3. **Detection**: AI detects order blocks, FVGs, liquidity sweeps, BOS, CHoCH\n4. **Validation**: 8 entry conditions must ALL be met — otherwise WAIT\n5. **Notification**: ASNE sends alerts via your chosen channels\n6. **Coaching**: AI Coach explains every setup in plain English\n7. **Management**: Full trade plan with entry, SL, TP1-3, and management rules\n\nThe system never executes trades, never guarantees profits. All analysis is probability-based and educational.`
    }

    // Can it guarantee profits
    if (q.includes('profit') || q.includes('guarantee') || q.includes('accurate') || q.includes('win')) {
      return `⚠️ **Important Disclaimer**\n\nApexEAPro NEVER guarantees profits and NEVER claims to be 100% accurate.\n\nAll analysis is probability-based and explicitly educational. Trading forex, gold, and crypto involves substantial risk of loss. Past performance is not indicative of future results.\n\nThe AILE Engine outputs WAIT when institutional conditions are not met — teaching patience over frequency. The objective is fewer but significantly more valuable trades.\n\nThis tool is for educational purposes and should not be considered financial advice.`
    }

    // Bias
    if (q.includes('bias') || q.includes('buy') || q.includes('sell') || q.includes('direction')) {
      const rsi = ind?.rsi ?? 50
      const trend = ind?.trendStrength ?? 25
      let bias = 'NEUTRAL'
      let conf = 50
      if (rsi < 40 && trend > 30) { bias = 'BUY'; conf = 72 }
      else if (rsi > 60 && trend > 30) { bias = 'SELL'; conf = 68 }
      else if (rsi < 35) { bias = 'BUY'; conf = 65 }
      else if (rsi > 65) { bias = 'SELL'; conf = 62 }
      return `📊 **AI Market Bias**\n\nCurrent Bias: **${bias}**\nConfidence: ${conf}%\n\nFactors:\n• RSI: ${rsi.toFixed(0)} ${rsi > 70 ? '(Overbought → bearish)' : rsi < 30 ? '(Oversold → bullish)' : '(Neutral)'}\n• ADX Trend Strength: ${trend.toFixed(0)} ${trend > 40 ? '(Strong trend)' : trend > 25 ? '(Trending)' : '(Ranging)'}\n• Session: ${sess?.name ?? '—'} ${sess?.isKillZone ? '🔥' : ''}\n\n${bias === 'WAIT' ? 'No high-probability setup detected. The AILE Engine recommends waiting for institutional confirmation.' : `For a full ${bias} setup with entry, SL, and TP, open the AI Decision Engine.`}`
    }

    // Default
    return `I can help with:\n\n📊 Market conditions (ask "what's the market doing?")\n💰 Gold price (ask "what's the price?")\n🧠 Trading strategy (ask about SMC, ICT)\n⚙️ AILE Engine (ask "what is AILE?")\n🕒 Sessions (ask "what session is it?")\n📰 News (ask "any news coming?")\n💎 Pricing (ask "how much?")\n🔧 Features (ask "what's included?")\n🛡️ Risk management (ask "how do you manage risk?")\n🏢 About HisabTech (ask "who built this?")\n\nWhat would you like to know?`
  }, [price, indicators, session])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = generateResponse(input)
      setMessages(prev => [...prev, { role: 'bot', text: response, timestamp: Date.now() }])
      setIsTyping(false)
    }, 800 + Math.random() * 600)
  }

  const quickQuestions = [
    "What's the market doing?",
    "What's the gold price?",
    "What is the AILE Engine?",
    "How much does it cost?",
  ]

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#60A5FA] to-[#10B981] flex items-center justify-center shadow-[0_8px_32px_rgba(37,99,235,0.4)] group"
        aria-label="Open AI assistant"
      >
        {/* Pulsing glow */}
        <div className="absolute inset-0 rounded-2xl bg-[#2563EB] animate-ping opacity-20" />
        {isOpen ? (
          <X className="w-6 h-6 text-white relative z-10" />
        ) : (
          <Bot className="w-6 h-6 text-white relative z-10" />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] border-2 border-[#050816] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </span>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-44 right-4 lg:bottom-24 lg:right-6 z-50 w-[calc(100vw-2rem)] max-w-[400px] h-[500px] max-h-[70vh] flex flex-col rounded-2xl overflow-hidden shadow-premium-lg border border-white/[10%]"
            style={{
              background: 'linear-gradient(135deg, rgba(13, 17, 38, 0.98), rgba(8, 12, 28, 0.98))',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/[8%] bg-gradient-to-r from-[#2563EB]/10 to-[#10B981]/10">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#050816]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold">ApexBot</span>
                  <Sparkles className="w-3 h-3 text-[#F59E0B]" />
                </div>
                <div className="text-[10px] text-[#10B981] font-mono">● Online · AI Trading Assistant</div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-2', msg.role === 'user' && 'justify-end')}
                >
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[80%] p-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-[#2563EB]/20 border border-[#2563EB]/30 rounded-br-sm'
                      : 'bg-white/[6%] border border-white/[8%] rounded-bl-sm text-foreground/90',
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white/[6%] border border-white/[8%] rounded-2xl rounded-bl-sm p-3 flex gap-1">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickQuestions.map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); setTimeout(handleSend, 100) }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/[5%] border border-white/[8%] hover:border-[#2563EB]/30 hover:bg-[#2563EB]/8 text-foreground/70 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/[8%] flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Ask about market, strategy, pricing..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/[4%] border border-white/[8%] text-xs focus:outline-none focus:border-[#2563EB]/40 placeholder:text-muted-foreground/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center shrink-0 disabled:opacity-30 hover:scale-105 active:scale-95 transition-transform"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
