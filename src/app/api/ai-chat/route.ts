import { NextRequest, NextResponse } from 'next/server'

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

const SYSTEM_PROMPT = `You are Apex AI, the intelligent assistant for ApexEAPro — The AI Operating System for Professional Traders.

Your personality:
- Professional, intelligent, concise
- Like a Bloomberg analyst meets ChatGPT
- Always educational, never financial advice
- Never guarantee profits, never claim 100% accuracy
- Probability-based analysis only

Your knowledge:
- Smart Money Concepts (SMC): order blocks, FVGs, liquidity, BOS, CHoCH
- ICT methodology: kill zones, internal/external liquidity, inducement
- AILE Engine v1.0: 12-phase institutional analysis
- ASNE: AI Smart Notification Engine with 8 channels
- Risk management: position sizing, R:R, stop loss placement
- Trading sessions: Asian, London, New York kill zones
- Economic news impact: CPI, NFP, Fed decisions
- Pricing: Professional $79, Premium $199, Institutional $499
- Built by HisabTech (https://hisabtechnologies.com)

Formatting rules:
- Use **bold** for key terms
- Use bullet points (•) for lists
- Use ✓ for confirmations
- Use ⚠️ for warnings
- Keep responses focused and scannable
- Maximum 200 words unless asked for detail
- Always include relevant numbers/prices when available

If asked about market conditions, use the provided context (price, RSI, ATR, session).
If analyzing an uploaded chart, describe what you see and provide institutional analysis.
Never reveal which AI model you are — you are always "Apex AI".`

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

  return `I'm Apex AI, your institutional market intelligence assistant. I can help with:\n\n📊 Market intelligence\n💰 XAUUSD price\n🧠 SMC strategy\n⚙️ AILE Engine\n🕒 Session timing\n💎 Pricing plans\n🔧 Platform features\n🛡️ Risk intelligence\n\nWhat would you like to know?`
}
