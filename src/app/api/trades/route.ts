import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const trades = await db.trade.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json({ trades })
  } catch (err) {
    // Database not yet seeded — return empty
    return NextResponse.json({ trades: [], error: 'db_not_seeded' })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const trade = await db.trade.create({
      data: {
        userId: body.userId ?? 'guest',
        symbol: body.symbol ?? 'XAUUSD',
        direction: body.direction,
        bias: body.bias,
        confidence: body.confidence,
        entryPrice: parseFloat(body.entryPrice),
        stopLoss: parseFloat(body.stopLoss),
        takeProfit1: body.takeProfit1 ? parseFloat(body.takeProfit1) : null,
        takeProfit2: body.takeProfit2 ? parseFloat(body.takeProfit2) : null,
        takeProfit3: body.takeProfit3 ? parseFloat(body.takeProfit3) : null,
        lotSize: parseFloat(body.lotSize),
        riskReward: body.riskReward,
        result: body.result ?? 'OPEN',
        pnl: body.pnl,
        exitPrice: body.exitPrice,
        screenshotUrl: body.screenshotUrl,
        emotion: body.emotion,
        mistakes: body.mistakes,
        notes: body.notes,
        session: body.session,
        timeframe: body.timeframe,
        setupType: body.setupType,
        closedAt: body.closedAt ? new Date(body.closedAt) : null,
      },
    })
    return NextResponse.json({ trade })
  } catch (err: any) {
    console.error('Failed to create trade', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await db.trade.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
