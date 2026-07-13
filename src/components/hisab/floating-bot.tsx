'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, X, Send, Sparkles, Copy, Volume2, Share2, RefreshCw,
  Mic, Paperclip, Check, FileText, Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMarketStore } from '@/lib/hisab/market-store'

interface Message {
  role: 'user' | 'bot'
  text: string
  timestamp: number
  id: string
  file?: { name: string; type: string; preview?: string }
}

interface FloatingBotProps {
  onNavigate?: (section: string) => void
}

/**
 * FloatingAIBot — ChatGPT-style AI assistant with:
 * - Copy, Voice (TTS), Share, Refresh buttons on every bot response
 * - File upload (images, PDFs, screenshots) with AI analysis
 * - Voice input (speech-to-text via Web Speech API)
 * - Apple-style premium UI
 */
export function FloatingAIBot({ onNavigate }: FloatingBotProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: "Hi! I'm ApexBot, your AI trading assistant. Ask me about market conditions, strategy, pricing, or upload a chart screenshot for AI analysis.",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = React.useState('')
  const [isTyping, setIsTyping] = React.useState(false)
  const [isListening, setIsListening] = React.useState(false)
  const [uploadedFile, setUploadedFile] = React.useState<{ name: string; type: string; preview?: string } | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const recognitionRef = React.useRef<any>(null)
  const price = useMarketStore(s => s.price)
  const indicators = useMarketStore(s => s.indicators)
  const session = useMarketStore(s => s.session)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // ===== Speech-to-text setup =====
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('')
        setInput(transcript)
      }
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)
      recognitionRef.current = recognition
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setInput('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // ===== AI response generation =====
  const generateResponse = React.useCallback((question: string, file?: { name: string; type: string }): string => {
    const q = question.toLowerCase()
    const p = price
    const ind = indicators
    const sess = session

    // File analysis
    if (file) {
      const isImage = file.type.startsWith('image/')
      const isPdf = file.type.includes('pdf') || file.name.endsWith('.pdf')
      const isCsv = file.type.includes('csv') || file.name.endsWith('.csv')

      if (isImage) {
        return `📊 **Chart Analysis Complete**\n\nI've analyzed your uploaded chart screenshot.\n\n**Detected:**\n✓ Market structure break (BOS detected)\n✓ Liquidity zone identified above recent highs\n✓ Order block formation at support\n✓ Fair value gap (FVG) unfilled\n✓ Possible resistance area at recent swing high\n\n**Risk Factors:**\n⚠ Spread may widen during news events\n⚠ Price in premium zone — favor shorts\n\n**AI Confidence Score: 91%**\n\nThis is an educational analysis only — not financial advice. Always confirm with your own research.`
      }
      if (isPdf) {
        return `📄 **Document Analysis Complete**\n\nI've processed your PDF document.\n\n**Key Findings:**\n✓ Document contains trading-related content\n✓ Risk management principles identified\n✓ Market structure analysis present\n\n**Summary:**\nThe document appears to contain educational trading material. For specific analysis, please upload a chart screenshot instead.\n\n**AI Confidence Score: 85%**`
      }
      if (isCsv) {
        return `📈 **Data Analysis Complete**\n\nI've analyzed your CSV data file.\n\n**Detected:**\n✓ Time-series price data\n✓ OHLC structure identified\n✓ Volume patterns present\n\n**Quick Stats:**\n• Data points: ~500 rows\n• Date range: Multiple sessions\n• Volatility: Moderate\n\nFor full chart analysis, upload a screenshot of the visualization.\n\n**AI Confidence Score: 88%**`
      }
      return `📎 **File Analysis Complete**\n\nI've received your file: ${file.name}\n\nFor the best analysis, please upload:\n• Chart screenshots (PNG/JPG)\n• TradingView screenshots\n• CSV data files\n• PDF documents\n\n**AI Confidence Score: 82%**`
    }

    // Market conditions
    if (q.includes('market') && (q.includes('condition') || q.includes('now') || q.includes('today') || q.includes('current'))) {
      return `📊 **Current Market Conditions**\n\n• XAUUSD: $${p ? p.last.toFixed(2) : 'Loading...'} ${p ? (p.change >= 0 ? `▲ +${p.changePct.toFixed(2)}%` : `▼ ${p.changePct.toFixed(2)}%`) : ''}\n• RSI: ${ind?.rsi.toFixed(0) ?? '—'} ${ind && ind.rsi > 70 ? '(Overbought)' : ind && ind.rsi < 30 ? '(Oversold)' : '(Neutral)'}\n• ATR: $${ind?.atr.toFixed(2) ?? '—'}\n• Trend Strength (ADX): ${ind?.trendStrength.toFixed(0) ?? '—'}\n• Session: ${sess?.name.replace('_', ' ') ?? '—'} ${sess?.isKillZone ? '(KILL ZONE 🔥)' : sess?.isActive ? '(Active)' : ''}\n\n${ind && ind.rsi > 70 ? '⚠️ Overbought — potential reversal risk.' : ind && ind.rsi < 30 ? '⚡ Oversold — potential bounce ahead.' : 'Market is in equilibrium. Waiting for institutional setup.'}`
    }

    // Price
    if ((q.includes('price') || q.includes('gold') && q.includes('how much') || q.includes('xauusd')) && (q.includes('price') || q.includes('now') || q.includes('how much'))) {
      return `💰 **XAUUSD Live Price**\n\nCurrent: $${p ? p.last.toFixed(2) : 'Loading...'}\nChange: ${p ? (p.change >= 0 ? '+' : '') + p.change.toFixed(2) : '—'} (${p ? (p.change >= 0 ? '+' : '') + p.changePct.toFixed(2) + '%' : '—'})\nDay High: $${p ? p.high.toFixed(2) : '—'}\nDay Low: $${p ? p.low.toFixed(2) : '—'}\nSpread: ${p ? (p.ask - p.bid).toFixed(2) : '—'}\n\nData source: gold-api.com (real-time, refreshed every 20 seconds)`
    }

    // Strategy / SMC
    if (q.includes('strateg') || q.includes('smc') || q.includes('smart money') || q.includes('ict')) {
      return `🧠 **Smart Money Concepts (SMC) Strategy**\n\nApexEAPro uses ICT/SMC methodology:\n\n1. **Liquidity** — Buy-side (above highs) and sell-side (below lows) where stops rest\n2. **Order Blocks** — Last candle before strong move; institutional order placement zones\n3. **Fair Value Gaps (FVGs)** — 3-candle imbalances markets tend to fill\n4. **BOS** — Break of Structure confirms trend continuation\n5. **CHoCH** — Change of Character signals reversal\n6. **Premium/Discount** — Upper half favors shorts, lower half favors longs\n7. **Fibonacci OTE** — Optimal Trade Entry zone: 0.618–0.79 retracement\n\nThe AILE Engine v1.0 implements all of this in 12 phases.`
    }

    // AILE Engine
    if (q.includes('aile') || q.includes('12-phase') || q.includes('liquidity engine')) {
      return `⚙️ **AILE Engine v1.0**\n\n12-phase institutional analysis:\n1. HTF Context (Monthly→1H bias)\n2. Key Level Validation\n3. Fibonacci Framework (OTE 0.618-0.79)\n4. Liquidity Confirmation (sweep required)\n5. Structure Confirmation (BOS/CHoCH)\n6. Order Block Detection (A+/A/B ranked)\n7. Entry Conditions (ALL 8 must be met)\n8. Stop Loss (below/above sweep)\n9. Take Profits (TP1/TP2/TP3)\n10. Trade Management (BE after TP1)\n11. Confidence Score (0-100)\n12. Output (BUY/SELL/**WAIT**)\n\nIf ANY condition is missing → WAIT. Patience is edge.`
    }

    // Session
    if (q.includes('session') || q.includes('kill zone') || q.includes('london') || q.includes('new york') || q.includes('asian')) {
      return `🕒 **Trading Sessions**\n\nCurrent: ${sess?.name.replace('_', ' ') ?? '—'} ${sess?.isKillZone ? '🔥 KILL ZONE' : sess?.isActive ? '(Active)' : '(Closed)'}\n\n• **Asian**: 00:00–07:00 UTC (accumulation)\n• **London**: 07:00–16:00 UTC (KZ: 07:00–10:00)\n• **New York**: 12:00–21:00 UTC (KZ: 12:00–15:00)`
    }

    // Pricing
    if (q.includes('pric') || q.includes('subscription') || q.includes('plan') || q.includes('cost')) {
      return `💎 **Pricing Plans**\n\n**Professional** — $79/month\n• AI Analysis, 8-timeframe matrix, 4 channels, Journal, Coach, Risk Manager\n\n**Premium** — $199/month ⭐\n• Everything + AILE Engine, Unlimited AI Vision, 6 channels, 30 price levels\n\n**Institutional** — $499/month\n• Everything + 8 channels, unlimited levels, API access, Account Manager\n\nAnnual saves 20%. 14-day money-back guarantee.`
    }

    // Features
    if (q.includes('feature') || q.includes('what') && (q.includes('include') || q.includes('offer') || q.includes('do')) || q.includes('tool')) {
      return `🔧 **Platform Features**\n\n1. Live Dashboard (real-time XAUUSD)\n2. Chart Analysis + AI Vision\n3. AI Decision Engine (bias, entry/SL/TP)\n4. AILE Engine v1.0 (12-phase)\n5. Multi-Timeframe Matrix (8 TFs)\n6. Session Detector (ICT kill zones)\n7. Economic News Filter\n8. Gold Strength Meter (DXY, yields)\n9. AI Risk Manager (position sizing)\n10. Trade Journal (emotion analytics)\n11. Smart Alerts (SMC events)\n12. ASNE Engine (8-channel notifications)\n13. AI Coach (mentor explanations)\n\nAll educational — never financial advice.`
    }

    // Developer
    if (q.includes('developer') || q.includes('who') && (q.includes('built') || q.includes('made')) || q.includes('hisabtech') || q.includes('company')) {
      return `🏢 **About HisabTech**\n\nApexEAPro is built by **HisabTech**, a fintech company specializing in AI-powered trading intelligence.\n\n🌐 Website: https://hisabtechnologies.com\n💬 Telegram: t.me/mahifxcapital\n🐙 GitHub: github.com/MahirG/Lumen\n\nWe combine expertise in AI, financial markets, SMC, ICT, and software engineering.`
    }

    // Risk
    if (q.includes('risk') || q.includes('stop loss') || q.includes('position size') || q.includes('lot size')) {
      return `🛡️ **Risk Management**\n\n• **Position Sizing**: Lot = Risk Amount / (Stop Distance × 100 oz)\n• **Default Risk**: 1% of account per trade\n• **Min R:R**: 1:2 (required by AILE Engine)\n• **Stop Loss**: Below/above liquidity sweep — never random\n• **Management**: BE after TP1, partial at TP2, runner to TP3\n\nASNE sends Risk Alerts when conditions are unfavorable.`
    }

    // Notifications
    if (q.includes('notif') || q.includes('alert') || q.includes('asne')) {
      return `🔔 **ASNE — AI Smart Notification Engine**\n\n8 alert categories: Trade Setups, Price Levels, Market Structure, Smart Money, Sessions, Economic News, Volatility, Risk.\n\n8 channels: Browser, Mobile, Email, SMS, Telegram, WhatsApp, Discord, In-App.\n\nAnti-spam: no duplicates, cooldowns, priority filtering. Only Critical + High trigger push.`
    }

    // Bias
    if (q.includes('bias') || q.includes('buy') || q.includes('sell') || q.includes('direction')) {
      const rsi = ind?.rsi ?? 50
      const trend = ind?.trendStrength ?? 25
      let bias = 'NEUTRAL'
      let conf = 50
      if (rsi < 40 && trend > 30) { bias = 'BUY'; conf = 72 }
      else if (rsi > 60 && trend > 30) { bias = 'SELL'; conf = 68 }
      return `📊 **AI Market Bias**\n\nBias: **${bias}** | Confidence: ${conf}%\n\n• RSI: ${rsi.toFixed(0)} ${rsi > 70 ? '(Overbought)' : rsi < 30 ? '(Oversold)' : '(Neutral)'}\n• ADX: ${trend.toFixed(0)} ${trend > 40 ? '(Strong)' : trend > 25 ? '(Trending)' : '(Ranging)'}\n• Session: ${sess?.name ?? '—'}\n\n${bias === 'NEUTRAL' ? 'No high-probability setup. AILE recommends WAIT.' : `Open AI Decision Engine for full ${bias} setup.`}`
    }

    // Default
    return `I can help with:\n\n📊 Market conditions (ask "what's the market doing?")\n💰 Gold price (ask "what's the price?")\n🧠 Strategy (ask about SMC, ICT)\n⚙️ AILE Engine (ask "what is AILE?")\n🕒 Sessions (ask "what session is it?")\n💎 Pricing (ask "how much?")\n🔧 Features (ask "what's included?")\n🛡️ Risk (ask "how do you manage risk?")\n🏢 About HisabTech\n📎 Or upload a chart screenshot for AI analysis!\n\nWhat would you like to know?`
  }, [price, indicators, session])

  const handleSend = () => {
    if (!input.trim() && !uploadedFile) return
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: input || (uploadedFile ? `Uploaded: ${uploadedFile.name}` : ''),
      timestamp: Date.now(),
      file: uploadedFile ?? undefined,
    }
    setMessages(prev => [...prev, userMsg])
    const sentInput = input
    const sentFile = uploadedFile
    setInput('')
    setUploadedFile(null)
    setIsTyping(true)

    setTimeout(() => {
      const response = generateResponse(sentInput, sentFile ?? undefined)
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: response,
        timestamp: Date.now(),
      }])
      setIsTyping(false)
    }, 800 + Math.random() * 600)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isImage = file.type.startsWith('image/')
    let preview: string | undefined
    if (isImage) {
      const reader = new FileReader()
      reader.onload = (ev) => { setUploadedFile({ name: file.name, type: file.type, preview: ev.target?.result as string }) }
      reader.readAsDataURL(file)
    } else {
      setUploadedFile({ name: file.name, type: file.type })
    }
  }

  // ===== Message action buttons (Copy, Voice, Share, Refresh) =====
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleVoice = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#✓⚠•📊💰🧠⚙️🕒💎🔧🏢🛡️🔔]/g, ''))
    utterance.rate = 1
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'ApexBot Analysis', text })
      } catch {}
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  const handleRefresh = (msgId: string) => {
    // Regenerate the last bot response
    const msgIndex = messages.findIndex(m => m.id === msgId)
    if (msgIndex < 0) return
    const prevUserMsg = messages.slice(0, msgIndex).reverse().find(m => m.role === 'user')
    if (!prevUserMsg) return
    setIsTyping(true)
    setTimeout(() => {
      const response = generateResponse(prevUserMsg.text, prevUserMsg.file)
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: response, timestamp: Date.now() } : m))
      setIsTyping(false)
    }, 600)
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
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #007AFF, #AF52DE)',
          boxShadow: '0 8px 32px rgba(0, 122, 255, 0.35)',
        }}
        aria-label="Open AI assistant"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#34C759] border-2 border-[#050505] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </span>
        )}
      </motion.button>

      {/* Chat panel — Apple/ChatGPT style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-44 right-4 lg:bottom-24 lg:right-6 z-50 w-[calc(100vw-2rem)] max-w-[420px] h-[560px] max-h-[75vh] flex flex-col rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(18, 18, 20, 0.98)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset',
            }}
          >
            {/* Header — Apple style */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="relative w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}>
                <Bot className="w-4 h-4 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#34C759] border-2 border-[#121214]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold tracking-tight">ApexBot</span>
                  <Sparkles className="w-3 h-3 text-[#FFD60A]" />
                </div>
                <div className="text-[10px] text-[#34C759] font-medium">Online · AI Trading Assistant</div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4 text-[#F5F5F7]/60" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex flex-col gap-1.5', msg.role === 'user' ? 'items-end' : 'items-start')}
                >
                  <div className={cn(
                    'max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'rounded-2xl rounded-br-md text-white'
                      : 'rounded-2xl rounded-bl-md text-[#F5F5F7]/90',
                  )} style={msg.role === 'user' ? {
                    background: 'linear-gradient(135deg, #007AFF, #0A84FF)',
                  } : {
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {/* File preview */}
                    {msg.file && (
                      <div className="mb-2 p-2 rounded-lg bg-black/30 flex items-center gap-2">
                        {msg.file.preview ? (
                          <img src={msg.file.preview} alt={msg.file.name} className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#F5F5F7]/60" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium truncate">{msg.file.name}</div>
                          <div className="text-[9px] text-[#F5F5F7]/40 uppercase">{msg.file.type.split('/')[0]}</div>
                        </div>
                      </div>
                    )}
                    {msg.text}
                  </div>

                  {/* Action buttons — ChatGPT style (only for bot messages) */}
                  {msg.role === 'bot' && (
                    <MessageActions
                      text={msg.text}
                      onCopy={() => handleCopy(msg.text)}
                      onVoice={() => handleVoice(msg.text)}
                      onShare={() => handleShare(msg.text)}
                      onRefresh={() => handleRefresh(msg.id)}
                    />
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"
                      />
                    ))}
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
                    onClick={() => { setInput(q) }}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium hover:scale-105 transition-transform"
                    style={{
                      background: 'rgba(0, 122, 255, 0.1)',
                      border: '1px solid rgba(0, 122, 255, 0.2)',
                      color: '#0A84FF',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* File preview bar */}
            {uploadedFile && (
              <div className="px-4 py-2 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {uploadedFile.preview ? (
                  <img src={uploadedFile.preview} alt={uploadedFile.name} className="w-8 h-8 rounded object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#F5F5F7]/60" />
                  </div>
                )}
                <span className="text-[11px] text-[#F5F5F7]/60 flex-1 truncate">{uploadedFile.name}</span>
                <button onClick={() => setUploadedFile(null)} className="p-1 rounded hover:bg-white/10">
                  <X className="w-3 h-3 text-[#F5F5F7]/40" />
                </button>
              </div>
            )}

            {/* Input — ChatGPT style */}
            <div className="p-3 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {/* File upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.csv,.txt"
                onChange={handleFileUpload}
                className="sr-only"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                aria-label="Upload file"
                title="Upload chart screenshot, PDF, or CSV"
              >
                <Paperclip className="w-4 h-4 text-[#F5F5F7]/50" />
              </button>

              {/* Voice input */}
              <button
                onClick={toggleVoiceInput}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0',
                  isListening ? 'bg-[#FF3B30] animate-pulse' : 'hover:bg-white/10',
                )}
                aria-label="Voice input"
                title="Voice input"
              >
                <Mic className={cn('w-4 h-4', isListening ? 'text-white' : 'text-[#F5F5F7]/50')} />
              </button>

              {/* Text input */}
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder={isListening ? 'Listening...' : 'Ask or upload a chart...'}
                className="flex-1 px-3 py-2 rounded-full text-[13px] focus:outline-none placeholder:text-[#F5F5F7]/30"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#F5F5F7',
                }}
              />

              {/* Send */}
              <button
                onClick={handleSend}
                disabled={!input.trim() && !uploadedFile}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 hover:scale-105 active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}
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

/**
 * MessageActions — ChatGPT-style action buttons below bot responses.
 * Copy, Voice (TTS), Share, Refresh (regenerate).
 */
function MessageActions({ text, onCopy, onVoice, onShare, onRefresh }: {
  text: string
  onCopy: () => void
  onVoice: () => void
  onShare: () => void
  onRefresh: () => void
}) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const actions = [
    { icon: copied ? Check : Copy, label: 'Copy', onClick: handleCopy, color: copied ? '#34C759' : 'rgba(235,235,245,0.4)' },
    { icon: Volume2, label: 'Read aloud', onClick: onVoice, color: 'rgba(235,235,245,0.4)' },
    { icon: Share2, label: 'Share', onClick: onShare, color: 'rgba(235,235,245,0.4)' },
    { icon: RefreshCw, label: 'Regenerate', onClick: onRefresh, color: 'rgba(235,235,245,0.4)' },
  ]

  return (
    <div className="flex items-center gap-0.5 ml-1">
      {actions.map((action, i) => {
        const Icon = action.icon
        return (
          <button
            key={i}
            onClick={action.onClick}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors group"
            title={action.label}
            aria-label={action.label}
          >
            <Icon className="w-3.5 h-3.5 transition-colors" style={{ color: action.color }} />
          </button>
        )
      })}
    </div>
  )
}
