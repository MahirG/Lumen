import { NextResponse } from 'next/server'
import { computeGoldStrength, getRawInputs, getStrengthLabel, getStrengthColor } from '@/lib/hisab/gold-strength'

export const runtime = 'nodejs'

export async function GET() {
  const raw = getRawInputs()
  const strength = computeGoldStrength(raw)
  return NextResponse.json({
    score: strength.score,
    label: strength.label,
    labelDisplay: getStrengthLabel(strength.label),
    direction: strength.direction,
    color: getStrengthColor(strength.score),
    components: strength.components,
    summary: strength.summary,
    raw,
    timestamp: Date.now(),
  })
}
