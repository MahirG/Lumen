/**
 * Hisab Gold AI — Session Detector & Kill Zones
 *
 * Trading sessions in UTC. Kill zones are ICT-defined high-probability windows.
 * Educational only — not financial advice.
 */

import type { SessionInfo, TradingSession } from '@/lib/types/hisab'

interface SessionSpec {
  name: TradingSession
  startUTC: number // hours
  endUTC: number
  killZoneStart?: number
  killZoneEnd?: number
  description: string
  killZoneDescription?: string
}

// ICT-style kill zones (UTC)
const SESSIONS: SessionSpec[] = [
  {
    name: 'ASIAN',
    startUTC: 0,
    endUTC: 7,
    killZoneStart: 0,
    killZoneEnd: 4,
    description: 'Tokyo session — typically ranges. Builds accumulation range for London sweep.',
    killZoneDescription: 'Asian Kill Zone — accumulation phase',
  },
  {
    name: 'LONDON',
    startUTC: 7,
    endUTC: 16,
    killZoneStart: 7,
    killZoneEnd: 10,
    description: 'London session — highest volatility for XAUUSD. Often sweeps Asian range.',
    killZoneDescription: 'London Kill Zone — primary liquidity sweep window',
  },
  {
    name: 'NEW_YORK',
    startUTC: 12,
    endUTC: 21,
    killZoneStart: 12,
    killZoneEnd: 15,
    description: 'New York session — overlaps London. Major moves & reversals.',
    killZoneDescription: 'New York Kill Zone — AM session, high momentum',
  },
]

export function getCurrentSession(date = new Date()): SessionInfo {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60
  const day = date.getUTCDay() // 0 = Sunday
  const isWeekend = day === 0 || day === 6

  let active: SessionSpec | undefined
  let nextSession: SessionSpec | undefined
  let minHoursUntil = 25

  for (const s of SESSIONS) {
    const start = s.startUTC
    const end = s.endUTC
    let inSession = false
    if (start < end) inSession = utcHours >= start && utcHours < end
    else inSession = utcHours >= start || utcHours < end
    if (inSession && !isWeekend) {
      active = s
    }
    // Compute next start
    let hoursUntil: number
    if (utcHours <= start) hoursUntil = start - utcHours
    else hoursUntil = 24 - utcHours + start
    if (hoursUntil < minHoursUntil) {
      minHoursUntil = hoursUntil
      nextSession = s
    }
  }

  const sessionName = active?.name ?? 'OFF_SESSION'
  let isKillZone = false
  let killZoneStart: string | undefined
  let killZoneEnd: string | undefined

  if (active?.killZoneStart !== undefined && active.killZoneEnd !== undefined) {
    const inKZ = utcHours >= active.killZoneStart && utcHours < active.killZoneEnd
    isKillZone = inKZ && !isWeekend
    killZoneStart = `${active.killZoneStart.toString().padStart(2, '0')}:00 UTC`
    killZoneEnd = `${active.killZoneEnd.toString().padStart(2, '0')}:00 UTC`
  }

  // Find next session
  const nextSessionName: TradingSession = nextSession?.name ?? 'LONDON'
  const nextSessionStart = nextSession
    ? `${nextSession.startUTC.toString().padStart(2, '0')}:00 UTC`
    : undefined

  const formatHour = (h: number) => {
    const hh = Math.floor(h).toString().padStart(2, '0')
    const mm = Math.round((h - Math.floor(h)) * 60).toString().padStart(2, '0')
    return `${hh}:${mm}`
  }

  return {
    name: sessionName,
    startTime: active ? `${formatHour(active.startUTC)} UTC` : '—',
    endTime: active ? `${formatHour(active.endUTC)} UTC` : '—',
    isActive: !!active && !isWeekend,
    isKillZone,
    killZoneStart,
    killZoneEnd,
    description: active?.description ?? 'Markets closed — weekend/off-session',
    nextSession: nextSessionName,
    nextSessionStart,
  }
}

export function getAllSessions(date = new Date()): SessionInfo[] {
  return SESSIONS.map(s => {
    const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60
    const day = date.getUTCDay()
    const isWeekend = day === 0 || day === 6
    let inSession = false
    if (s.startUTC < s.endUTC) inSession = utcHours >= s.startUTC && utcHours < s.endUTC
    else inSession = utcHours >= s.startUTC || utcHours < s.endUTC
    const inKZ = s.killZoneStart !== undefined && s.killZoneEnd !== undefined &&
      utcHours >= s.killZoneStart! && utcHours < s.killZoneEnd!
    return {
      name: s.name,
      startTime: `${s.startUTC.toString().padStart(2, '0')}:00 UTC`,
      endTime: `${s.endUTC.toString().padStart(2, '0')}:00 UTC`,
      isActive: inSession && !isWeekend,
      isKillZone: inKZ && !isWeekend,
      killZoneStart: s.killZoneStart !== undefined ? `${s.killZoneStart.toString().padStart(2, '0')}:00 UTC` : undefined,
      killZoneEnd: s.killZoneEnd !== undefined ? `${s.killZoneEnd.toString().padStart(2, '0')}:00 UTC` : undefined,
      description: s.description,
    }
  })
}

export function getSessionColor(name: TradingSession): string {
  switch (name) {
    case 'ASIAN': return '#F7A707'
    case 'LONDON': return '#F7A707'
    case 'NEW_YORK': return '#00E676'
    default: return '#E69500'
  }
}
