import { NextRequest, NextResponse } from 'next/server'
import { calculateRisk } from '@/lib/hisab/risk-manager'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = calculateRisk({
      accountBalance: parseFloat(body.accountBalance),
      riskPercent: parseFloat(body.riskPercent),
      entryPrice: parseFloat(body.entryPrice),
      stopLoss: parseFloat(body.stopLoss),
      takeProfit: body.takeProfit ? parseFloat(body.takeProfit) : undefined,
      leverage: body.leverage ? parseInt(body.leverage) : undefined,
    })
    return NextResponse.json({ result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
