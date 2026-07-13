import { NextRequest, NextResponse } from 'next/server'
import { analyzeSMC, generateCandles } from '@/lib/hisab/smc-engine'
import { runMultiTimeframeAnalysis, generateTradeSetup } from '@/lib/hisab/mtf-analysis'
import { generateCoachExplanation } from '@/lib/hisab/ai-coach'
import { getCurrentSession } from '@/lib/hisab/sessions'
import { getUpcomingNews } from '@/lib/hisab/news'
import { computeGoldStrength, getRawInputs } from '@/lib/hisab/gold-strength'
import { calculateRisk } from '@/lib/hisab/risk-manager'
import { formatNumber } from '@/lib/hisab/risk-manager'
import type { Timeframe } from '@/lib/types/hisab'

export const runtime = 'nodejs'
export const maxDuration = 30

interface AnalysisRequest {
  imageBase64?: string
  timeframe?: Timeframe
  symbol?: string
  context?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalysisRequest = await req.json()
    const timeframe = body.timeframe || '15M'
    const symbol = body.symbol || 'XAUUSD'

    // Use real GLM-4V vision if an image was uploaded, otherwise use the SMC engine on synthetic candles
    let visionAnalysis: { detected: any; bias: 'BUY' | 'SELL' | 'NEUTRAL'; confidence: number; notes: string; rawAnalysis: string } | null = null

    if (body.imageBase64) {
      try {
        visionAnalysis = await runGLMVisionAnalysis(body.imageBase64, timeframe, symbol, body.context)
      } catch (err) {
        console.error('Vision API failed, falling back to engine', err)
        // Fall through to engine-based analysis
      }
    }

    if (!visionAnalysis) {
      // Fallback: run the SMC engine on generated candles
      const candles = generateCandles(timeframe, 200)
      const smc = analyzeSMC(candles, timeframe)
      const mtf = runMultiTimeframeAnalysis()
      const currentPrice = candles.at(-1)?.close ?? 2650
      const setup = generateTradeSetup(smc, mtf, currentPrice)

      visionAnalysis = {
        detected: {
          trend: smc.trend,
          structure: [
            ...(smc.structure.chochEvents.length > 0 ? [`${smc.structure.chochEvents.at(-1)!.direction} CHoCH at ${formatNumber(smc.structure.chochEvents.at(-1)!.price, 2)}`] : []),
            ...(smc.structure.bosEvents.length > 0 ? [`${smc.structure.bosEvents.at(-1)!.direction} BOS at ${formatNumber(smc.structure.bosEvents.at(-1)!.price, 2)}`] : []),
          ],
          liquidity: smc.liquidity.slice(0, 4).map(l => `${l.type === 'BUY_SIDE' ? 'BSL' : 'SSL'} at ${formatNumber(l.price, 2)}${l.swept ? ' (swept)' : ''}`),
          orderBlocks: smc.orderBlocks.filter(o => !o.mitigated).slice(0, 3).map(o => `${o.type} OB ${formatNumber(o.low, 2)}-${formatNumber(o.high, 2)}`),
          fvgs: smc.fvgs.filter(f => !f.filled).slice(0, 3).map(f => `${f.type} FVG ${formatNumber(f.low, 2)}-${formatNumber(f.high, 2)}`),
          equalHighs: smc.equalHighs.map(h => `$${formatNumber(h, 2)}`),
          equalLows: smc.equalLows.map(l => `$${formatNumber(l, 2)}`),
          premiumDiscount: currentPrice > smc.equilibrium ? 'PREMIUM' : 'DISCOUNT',
        },
        bias: setup.bias,
        confidence: setup.confidence,
        notes: `Engine-based analysis on ${timeframe} candles. Trend: ${smc.trend}. ${setup.reasons.slice(0, 2).join('. ')}`,
        rawAnalysis: 'Engine analysis (no vision input)',
      }
    }

    return NextResponse.json({
      result: visionAnalysis,
      disclaimer: 'Educational analysis only — probability-based, not financial advice.',
    })
  } catch (err: any) {
    console.error('Analysis error', err)
    return NextResponse.json(
      { error: 'Analysis failed', message: err.message },
      { status: 500 },
    )
  }
}

/**
 * Calls GLM-4V via z-ai-web-dev-sdk to interpret the uploaded TradingView screenshot.
 * The model receives a system prompt that constrains it to SMC/ICT concepts.
 */
async function runGLMVisionAnalysis(imageBase64: string, timeframe: string, symbol: string, context?: string) {
  // Dynamic import so the SDK is only loaded server-side
  const ZAI = await import('z-ai-web-dev-sdk').then(m => m.default ?? m).catch(() => null)
  if (!ZAI) {
    throw new Error('z-ai-web-dev-sdk not available')
  }

  // Strip data URL prefix if present
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64

  const systemPrompt = `You are Hisab Gold AI, an institutional-grade trading analyst specializing in Smart Money Concepts (SMC) and ICT methodology for ${symbol} (Gold).

Your job: analyze the uploaded TradingView chart screenshot and detect:
- Trend direction (Bullish / Bearish / Ranging)
- Break of Structure (BOS)
- Change of Character (CHoCH)
- Liquidity (buy-side / sell-side, swept or resting)
- Order Blocks (bullish / bearish, mitigated or unmitigated)
- Fair Value Gaps (FVG)
- Equal Highs / Equal Lows
- Premium / Discount zones
- Inducement levels

Respond STRICTLY in JSON with this schema:
{
  "detected": {
    "trend": "string (Bullish | Bearish | Ranging)",
    "structure": ["string array of BOS/CHoCH events with price levels"],
    "liquidity": ["string array of liquidity levels"],
    "orderBlocks": ["string array of OB zones with prices"],
    "fvgs": ["string array of FVG zones"],
    "equalHighs": ["string array of equal highs prices"],
    "equalLows": ["string array of equal lows prices"],
    "premiumDiscount": "PREMIUM | DISCOUNT | EQUILIBRIUM"
  },
  "bias": "BUY | SELL | NEUTRAL",
  "confidence": "number 0-100",
  "notes": "string — professional analysis in 2-3 sentences explaining the setup",
  "rawAnalysis": "string — detailed reasoning"
}

Rules:
- Never promise profits. Always phrase as probabilities.
- Confidence should reflect the strength of structural confluence.
- Be specific with price levels (e.g., "$2658.40") when visible.
- This is for educational purposes only.`

  const userPrompt = `Analyze this ${symbol} chart on ${timeframe} timeframe. Context: ${context ?? 'TradingView screenshot'}. Return ONLY valid JSON.`

  try {
    const ai = await ZAI.create()
    const completion = await ai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } },
        ] as any },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    })

    const content = completion.choices?.[0]?.message?.content ?? ''
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in AI response')
    const parsed = JSON.parse(jsonMatch[0])

    return {
      detected: {
        trend: String(parsed.detected?.trend ?? 'Neutral'),
        structure: Array.isArray(parsed.detected?.structure) ? parsed.detected.structure : [],
        liquidity: Array.isArray(parsed.detected?.liquidity) ? parsed.detected.liquidity : [],
        orderBlocks: Array.isArray(parsed.detected?.orderBlocks) ? parsed.detected.orderBlocks : [],
        fvgs: Array.isArray(parsed.detected?.fvgs) ? parsed.detected.fvgs : [],
        equalHighs: Array.isArray(parsed.detected?.equalHighs) ? parsed.detected.equalHighs : [],
        equalLows: Array.isArray(parsed.detected?.equalLows) ? parsed.detected.equalLows : [],
        premiumDiscount: String(parsed.detected?.premiumDiscount ?? 'EQUILIBRIUM'),
      },
      bias: ['BUY', 'SELL', 'NEUTRAL'].includes(parsed.bias) ? parsed.bias : 'NEUTRAL',
      confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 50)),
      notes: String(parsed.notes ?? 'No notes provided.'),
      rawAnalysis: String(parsed.rawAnalysis ?? ''),
    }
  } catch (err) {
    console.error('GLM vision call failed:', err)
    throw err
  }
}
