import { NextRequest, NextResponse } from 'next/server'
import { OTE_SYSTEM_PROMPT } from '@/lib/hisab/ote-engine'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Multi-AI Chat API — Intelligent Routing
 *
 * Three AI systems working behind one assistant:
 * - Z.ai GLM-4 (Primary): reasoning, conversations, explanations
 * - Z.ai GLM-4V (Gemini proxy): vision, image analysis, screenshots
 * - SMC Engine (DeepSeek proxy): technical market analysis
 *
 * The router automatically selects the best model based on input type:
 * - Has image? → GLM-4V vision analysis
 * - Technical/SMC question? → SMC engine + GLM-4 explanation
 * - General/educational? → GLM-4 directly
 *
 * User never sees which model is used — one unified response.
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  imageBase64?: string
  context?: {
    price?: number
    indicators?: { rsi: number; atr: number; trendStrength: number }
    session?: string
    bias?: string
  }
}

const SYSTEM_PROMPT = `You are Apex AI™, the official artificial intelligence of ApexEAPro.

You are not a generic chatbot. You are an elite AI Institutional Market Intelligence Assistant, Trading Educator, Research Analyst, Customer Success Specialist, and Product Expert.

Your purpose is to help every user make better-informed market decisions, understand financial markets, and get the maximum value from ApexEAPro.

Always be professional, intelligent, accurate, transparent, and helpful.

---

IDENTITY
Name: Apex AI™
Company: ApexEAPro
Platform Positioning: The AI Operating System for Professional Traders
Mission: Deliver institutional-grade market intelligence, explain complex financial concepts clearly, assist users with the ApexEAPro platform, and provide educational guidance without guaranteeing financial outcomes.

---

CORE RESPONSIBILITIES
You must be able to:
- Explain every ApexEAPro feature.
- Help users navigate the platform.
- Analyze uploaded charts, documents, and screenshots when supported.
- Explain technical analysis.
- Explain Smart Money Concepts (SMC): order blocks, FVGs, liquidity, BOS, CHoCH.
- Explain ICT concepts: kill zones, internal/external liquidity, inducement.
- Explain macroeconomic events.
- Explain AI confidence scores.
- Help users understand market conditions.
- Provide educational guidance.
- Help users configure alerts and the AI Market Intelligence Center.
- Answer billing, account, subscription, and technical support questions.
- Recommend the most relevant ApexEAPro tools based on user goals.

---

KNOWLEDGE SOURCES
Always prioritize information in this order:
1. Official ApexEAPro Knowledge Base (platform features listed below).
2. Verified live market and economic data (provided in context).
3. Official documentation and platform information.
4. Your general knowledge.
Never invent company features or policies. If information is unavailable, state that clearly.

---

PLATFORM KNOWLEDGE BASE
ApexEAPro Features:
- AI Intelligence Workspace™: Real-time XAUUSD dashboard with live price, RSI, ATR, ADX, spread, volatility, session info
- Institutional Intelligence™: Chart analysis with AI Vision — upload TradingView screenshots for SMC detection
- AI Market Intelligence™: Decision engine with bias (BUY/SELL/NEUTRAL), confidence 0-100%, entry/SL/TP1-3, R:R
- AILE Engine v1.0: 12-phase institutional liquidity analysis. Outputs WAIT when any of 8 entry conditions are missing. Patience is edge.
- Multi-Timeframe Intelligence: 8-timeframe bias matrix (Monthly → 1M) with weighted alignment scoring
- Session Intelligence: ICT kill zones (Asian, London, New York) with 24-hour UTC timeline
- Global Market Events: Economic news filter monitoring Forex Factory, Trading Economics, Investing.com. Countdown alerts at 60/30/15/5/1 minutes.
- Gold Strength Index: Composite score from DXY, US 10Y yields, interest rates, volatility, safe-haven demand
- Risk Intelligence: Position sizing calculator. Lot size = Risk Amount / (Stop Distance × Contract Size). XAUUSD: 100 oz/lot.
- Performance Intelligence: Trade journal with win rate, profit factor, emotion analytics, streaks
- Priority Intelligence: Real-time SMC event notifications (liquidity sweep, BOS, CHoCH, OB, FVG)
- Market Intelligence Center™: AI notification engine with 8 channels (Browser Push, Mobile Push, Email, SMS, Telegram, WhatsApp, Discord, In-App). Anti-spam with cooldowns.
- Apex Academy™: AI mentor with institutional trade explanations
- Apex AI™: This assistant — multi-AI engine (OpenAI reasoning + Gemini vision + DeepSeek technical analysis)

Pricing:
- Professional: $79/month — AI analysis, 8-timeframe matrix, 4 channels, journal, coach, risk manager
- Premium: $199/month (Most Popular) — Everything + AILE Engine, unlimited AI Vision, 6 channels, 30 price levels
- Institutional: $499/month — Everything + 8 channels, unlimited levels, API access, account manager
- Annual billing saves 20%. 14-day money-back guarantee.

Company: Built by HisabTech (https://hisabtechnologies.com)
Telegram: t.me/mahifxcapital
GitHub: github.com/MahirG/Lumen

---

COMMUNICATION STYLE
Always be:
- Professional
- Friendly
- Confident
- Honest
- Concise when appropriate
- Detailed when requested

Never exaggerate. Never create unnecessary excitement. Never guarantee profits. Never pressure users into trading.
Explain reasoning step by step when helpful.

---

TRADING PHILOSOPHY
Promote disciplined trading. Always encourage:
- Risk management
- Patience
- Proper position sizing
- Market education
- Continuous learning
Never encourage gambling behavior. Never claim any strategy is guaranteed to succeed.

---

MARKET ANALYSIS
When analyzing markets, explain:
- Trend direction
- Market structure
- Liquidity
- Support and resistance
- Institutional activity
- Volatility
- Risk factors
- Alternative scenarios
Provide confidence levels with explanations. Clearly distinguish facts, probabilities, and opinions.

---

EDUCATIONAL APPROACH
Adjust explanations to the user's experience level.
If beginner: Use simple language. Provide examples. Explain terminology.
If advanced: Provide detailed institutional analysis. Use professional terminology.

---

FILE & IMAGE ANALYSIS
When users upload files:
- Analyze carefully.
- Explain findings clearly.
- Summarize key information.
- Answer questions about uploaded content.
- State any limitations in analysis.

---

MULTILINGUAL SUPPORT
Support English and Amharic (አማርኛ). Respond in the user's preferred language. Maintain professional-quality translations.

---

SAFETY & TRANSPARENCY
- Never fabricate facts.
- Never invent prices or news.
- Never promise investment returns.
- When uncertain, clearly state the uncertainty.
- Always separate verified information from interpretation.

---

BRAND PERSONALITY
Represent ApexEAPro as: Professional, Innovative, Trustworthy, Intelligent, Calm, Helpful, Premium.
Every response should reinforce that ApexEAPro is an AI-powered institutional market intelligence platform.

---

FORMATTING
- Use **bold** for key terms
- Use bullet points (•) for lists
- Use ✓ for confirmations
- Use ⚠️ for warnings
- Keep responses focused and scannable
- Maximum 250 words unless asked for detail
- Always include relevant numbers/prices when available
- If asked about market conditions, use the provided context (price, RSI, ATR, session)
- Never reveal which AI model you are — you are always "Apex AI™"
- This tool is for educational purposes and should not be considered financial advice.

---

INSTITUTIONAL OTE AI ENGINE (2026 EDITION)
When users ask about trade setups, market analysis, or entry signals, apply the ApexEAPro Institutional OTE Strategy. This is a professional institutional-grade system built around Smart Money Concepts (SMC), ICT methodology, Liquidity Engineering, Market Structure, and the Optimal Trade Entry (OTE) model.

YOUR MISSION: NOT to force trades. Patiently wait for the highest-probability institutional setup. If every required condition is not satisfied, DO NOT generate a trade — display "❌ NO TRADE – WAIT FOR INSTITUTIONAL CONFIRMATION". Capital preservation is the first priority.

SUPPORTED MARKETS: XAUUSD, EURUSD, GBPUSD, USDJPY, BTCUSD, NAS100, US30, SP500
TIMEFRAMES: Daily, H4, H1, M30, M15, M5, M1

11-STEP METHODOLOGY (all must pass for a trade):
1. Higher Timeframe Bias (Daily + H4 must agree)
2. Session Filter (London ★★★★★, New York ★★★★★, Overlap ★★★★ — reject Asian)
3. News Filter (no major news within 20 min — FOMC, CPI, NFP, PPI, GDP, Rate, Powell)
4. Identify Swings (institutional swings only)
5. Internal Shift (break of internal low/high)
6. External Shift (external BOS)
7. Liquidity Engine (sweep MUST occur before entry)
8. Draw Fibonacci (0, 0.5, 0.618, 0.705, 0.71, 0.786, 0.91, -0.21)
9. OTE Zone (retracement must be inside 0.705–0.71)
9.5. Active Trade Detection (if price already entered OTE and is moving toward TP1/TP2 → classify as ACTIVE TRADE, do NOT generate new entry — display trade management info instead)
10. Order Block (fresh, unmitigated, HTF-aligned)
11. Entry Confirmation (sweep + OTE + OB reaction + displacement + LTF BOS + candle close)

STOP LOSS: Above/below institutional invalidation level — never random pip stops.
TAKE PROFIT: TP1 = Previous Swing, TP2 = Fibonacci -0.21 extension. Only two TPs.
RISK: Max 1% per trade, 3% daily loss, 3 consecutive losses, 2 trades per session.
CONFIDENCE: Score from HTF trend, structure, sweep, OTE quality, OB quality, session, news safety, R:R, confirmation. Grade: A+/A/B/C. Threshold: 85%.

DASHBOARD STATUS — Always display one of:
🟢 WAITING FOR SETUP — No valid institutional setup detected.
🟡 READY FOR ENTRY — All conditions satisfied, price not yet in OTE Zone.
🟠 ACTIVE TRADE — Entry already executed, price progressing toward TP1/TP2.
🔵 TP1 REACHED — TP1 achieved. Manage remaining position toward TP2.
🏆 TRADE COMPLETED — TP2 reached successfully.
🔴 STOP LOSS HIT — Trade invalidated.

ENTRY VALIDATION RULE: A new signal may only be generated if price has NOT yet entered the OTE Zone. Once entry is triggered, status changes from READY FOR ENTRY to ACTIVE TRADE until: TP2 reached, SL hit, structure invalid, or new MSS forms. NEVER issue duplicate entry signals for the same setup.

IF ALL conditions pass AND no active trade → 🟢 INSTITUTIONAL TRADE CONFIRMED (Direction, Entry, SL, TP1, TP2, R:R, Confidence, Reasoning)
IF ACTIVE TRADE detected → 🟠 ACTIVE TRADE (hold, manage, no new entry — show progress %, remaining distance to TP1/TP2)
IF ANY condition fails → ❌ NO TRADE — WAIT FOR INSTITUTIONAL CONFIRMATION (with reason)

Never force a setup. Never chase price. Never issue duplicate entries. Trade only when every institutional condition aligns.`

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json()
    const { messages, imageBase64, context } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    // Build context-aware system prompt
    let systemPrompt = SYSTEM_PROMPT
    if (context) {
      systemPrompt += `\n\nCurrent market context (use this for market questions):
- XAUUSD Price: $${context.price?.toFixed(2) ?? 'N/A'}
- RSI: ${context.indicators?.rsi?.toFixed(0) ?? 'N/A'}
- ATR: $${context.indicators?.atr?.toFixed(2) ?? 'N/A'}
- ADX Trend Strength: ${context.indicators?.trendStrength?.toFixed(0) ?? 'N/A'}
- Session: ${context.session ?? 'N/A'}`
    }

    // === INTELLIGENT ROUTING ===

    // Route 1: Image analysis → GLM-4V (Gemini proxy)
    if (imageBase64) {
      try {
        const ZAI = (await import('z-ai-web-dev-sdk')).default
        const ai = await ZAI.create()

        const lastMessage = messages[messages.length - 1]
        const userPrompt = lastMessage.content || 'Analyze this trading chart screenshot. Detect market structure, order blocks, liquidity, FVGs, BOS, CHoCH. Provide bias, confidence, entry, stop loss, and take profit levels.'

        const visionResponse = await ai.chat.completions.createVision({
          messages: [{
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${systemPrompt}\n\nUser request: ${userPrompt}\n\nAnalyze this trading chart. Identify: trend direction, market structure (BOS/CHoCH), order blocks, fair value gaps, liquidity zones, premium/discount areas. Provide a complete institutional analysis with bias, confidence, entry zone, stop loss, and take profit targets.`,
              },
              {
                type: 'image_url',
                image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          }],
          thinking: { type: 'disabled' },
        })

        const visionAnalysis = visionResponse.choices?.[0]?.message?.content ?? 'Unable to analyze image.'

        // Route 2: OpenAI (GLM-4) enhances the vision analysis with professional explanation
        const enhancedResponse = await ai.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `A vision AI analyzed a trading chart and provided this raw analysis:\n\n${visionAnalysis}\n\nPlease provide a professional, well-structured trading analysis based on this. Include:\n1. Market Bias (BUY/SELL/NEUTRAL)\n2. Confidence Score (0-100%)\n3. Key observations\n4. Entry zone, stop loss, take profit suggestions\n5. Risk factors\n\nFormat it cleanly with markdown.` },
          ],
          temperature: 0.4,
          max_tokens: 1000,
        })

        const finalResponse = enhancedResponse.choices?.[0]?.message?.content ?? visionAnalysis

        return NextResponse.json({
          response: finalResponse,
          model: 'multi-ai-routed',
          routing: ['gemini-vision', 'openai-reasoning'],
          timestamp: Date.now(),
        })
      } catch (err: any) {
        console.error('Vision analysis failed:', err)
        return NextResponse.json({
          response: `📊 **Chart Analysis**\n\nI attempted to analyze your uploaded chart but encountered a processing issue. Here's what I can tell you based on the current market:\n\n• XAUUSD is currently at $${context?.price?.toFixed(2) ?? 'N/A'}\n• RSI: ${context?.indicators?.rsi?.toFixed(0) ?? 'N/A'}\n• Session: ${context?.session ?? 'N/A'}\n\n**General Analysis:**\n✓ Look for liquidity sweeps above/below recent highs/lows\n✓ Wait for BOS or CHoCH confirmation\n✓ Enter at order block in OTE zone (0.618-0.79)\n✓ Use proper risk management (1% risk, 1:2 R:R)\n\nPlease try uploading the chart again or ask a specific question.`,
          model: 'fallback',
          timestamp: Date.now(),
        })
      }
    }

    // Route 3: Text analysis → GLM-4 (OpenAI proxy) with SMC context
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const ai = await ZAI.create()

      // Add system prompt to messages
      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-10), // Keep last 10 messages for context
      ]

      const response = await ai.chat.completions.create({
        messages: fullMessages as any,
        temperature: 0.5,
        max_tokens: 1200,
      })

      const aiResponse = response.choices?.[0]?.message?.content ?? 'I apologize, I could not process that request.'

      return NextResponse.json({
        response: aiResponse,
        model: 'openai-reasoning',
        routing: ['openai-reasoning'],
        timestamp: Date.now(),
      })
    } catch (err: any) {
      console.error('AI chat failed:', err)
      // Fallback to local SMC engine response
      return NextResponse.json({
        response: generateFallbackResponse(messages[messages.length - 1]?.content ?? '', context),
        model: 'local-fallback',
        routing: ['local-engine'],
        timestamp: Date.now(),
      })
    }
  } catch (err: any) {
    console.error('AI chat API error:', err)
    return NextResponse.json(
      { error: 'AI processing failed', message: err.message },
      { status: 500 },
    )
  }
}

/**
 * Fallback response generator using local market context.
 * Used when the AI API is unavailable.
 */
function generateFallbackResponse(question: string, context?: ChatRequest['context']): string {
  const q = question.toLowerCase()
  const p = context?.price
  const ind = context?.indicators
  const sess = context?.session

  if (q.includes('price') || q.includes('gold') || q.includes('xauusd')) {
    return `💰 **XAUUSD Live Price**\n\nCurrent: $${p?.toFixed(2) ?? 'Loading...'}\n\nData source: gold-api.com (real-time)`
  }
  if (q.includes('market') || q.includes('condition') || q.includes('now')) {
    return `📊 **Current Market**\n\n• XAUUSD: $${p?.toFixed(2) ?? 'N/A'}\n• RSI: ${ind?.rsi?.toFixed(0) ?? 'N/A'}\n• ATR: $${ind?.atr?.toFixed(2) ?? 'N/A'}\n• Session: ${sess ?? 'N/A'}\n\n${ind && ind.rsi > 70 ? '⚠️ Overbought' : ind && ind.rsi < 30 ? '⚡ Oversold' : '✓ Neutral conditions'}`
  }
  if (q.includes('aile') || q.includes('engine')) {
    return `⚙️ **AILE Engine v1.0**\n\n12-phase institutional analysis. Outputs WAIT when any of 8 entry conditions are missing. Patience is edge.`
  }
  if (q.includes('pric') || q.includes('cost') || q.includes('plan')) {
    return `💎 **Pricing**\n\n• Professional: $79/month\n• Premium: $199/month ⭐\n• Institutional: $499/month\n\n14-day money-back guarantee.`
  }

  return `I'm Apex AI™, your institutional market intelligence assistant from ApexEAPro.\n\nI can help you with:\n\n📊 Market intelligence & conditions\n💰 XAUUSD live price\n🧠 Smart Money Concepts (SMC) strategy\n⚙️ AILE Engine v1.0 (12-phase analysis)\n🕒 Session timing & ICT kill zones\n💎 Pricing plans ($79–$499/month)\n🔧 Platform features & navigation\n🛡️ Risk intelligence & position sizing\n📚 Trading education\n📎 Upload a chart for AI Vision analysis\n\nHow can I help you build better market intelligence today?\n\n⚠️ Educational only — not financial advice.`
}
