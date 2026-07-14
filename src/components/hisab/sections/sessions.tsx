'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap, AlertTriangle } from 'lucide-react'
import { GlassCard, SectionHeading, StatusBadge } from '../primitives'
import { getAllSessions, getCurrentSession, getSessionColor } from '@/lib/hisab/sessions'
import type { SessionInfo } from '@/lib/types/hisab'
import { cn } from '@/lib/utils'

export function SessionDetector() {
  const [now, setNow] = React.useState(new Date())
  const currentSession = React.useMemo(() => getCurrentSession(now), [now])
  const allSessions = React.useMemo(() => getAllSessions(now), [now])

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Compute next session countdown
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60
  const nextSession = allSessions.find(s => !s.isActive)
  let minutesToNext = 0
  if (nextSession) {
    const startHour = parseInt(nextSession.startTime.split(':')[0])
    minutesToNext = Math.round(((startHour - utcHours + 24) % 24) * 60)
  }

  return (
    <div className="space-y-5">
      {/* Current session highlight */}
      <GlassCard variant="strong" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div
              className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: `${getSessionColor(currentSession.name)}20`, border: `1px solid ${getSessionColor(currentSession.name)}40` }}
            >
              <Clock className="w-7 h-7" style={{ color: getSessionColor(currentSession.name) }} />
              {currentSession.isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00E676]">
                  <div className="absolute inset-0 rounded-full bg-[#00E676] animate-ping" />
                </div>
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Current Session</div>
              <div className="text-3xl font-bold font-display">{currentSession.name.replace('_', ' ')}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {currentSession.isActive ? `${currentSession.startTime} → ${currentSession.endTime}` : 'Markets closed'}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {currentSession.isKillZone && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(245, 197, 66, 0.15)] border border-[rgba(245, 197, 66, 0.3)]"
              >
                <Zap className="w-4 h-4 text-[#FFC83D]" />
                <span className="text-sm font-semibold text-[#FFC83D]">KILL ZONE ACTIVE</span>
              </motion.div>
            )}
            {nextSession && (
              <div className="text-xs text-muted-foreground">
                Next: <span className="text-foreground font-mono">{nextSession.name.replace('_', ' ')}</span> in
                <span className="text-[#FFC83D] font-mono ml-1">{minutesToNext}m</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white/5 border border-border/30">
          <p className="text-sm text-foreground/90 leading-relaxed">{currentSession.description}</p>
        </div>

        {currentSession.killZoneStart && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[rgba(245, 197, 66, 0.05)] border border-[rgba(245, 197, 66, 0.20)]">
              <div className="text-[10px] uppercase text-muted-foreground">Kill Zone Window</div>
              <div className="text-sm font-mono font-semibold mt-1 text-[#FFC83D]">
                {currentSession.killZoneStart} → {currentSession.killZoneEnd}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-border/30">
              <div className="text-[10px] uppercase text-muted-foreground">Recommendation</div>
              <div className="text-sm font-medium mt-1">
                {currentSession.isKillZone ? 'High-probability window — active trading' : 'Wait for kill zone for entries'}
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Session cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {allSessions.map((s, i) => (
          <SessionCard key={s.name} session={s} delay={i * 0.1} />
        ))}
      </div>

      {/* 24h timeline */}
      <GlassCard className="p-5">
        <h3 className="text-base font-semibold font-display mb-4">24-Hour Session Timeline (UTC)</h3>
        <div className="relative h-12 rounded-lg bg-white/5 overflow-hidden">
          {/* Hour markers */}
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 border-l border-white/5"
              style={{ left: `${(h / 24) * 100}%` }}
            />
          ))}
          {/* Session bands */}
          {allSessions.map(s => {
            const startH = parseInt(s.startTime.split(':')[0])
            const endH = parseInt(s.endTime.split(':')[0])
            const width = ((endH - startH + 24) % 24) / 24 * 100
            const left = startH / 24 * 100
            return (
              <motion.div
                key={s.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: s.isActive ? 1 : 0.4 }}
                className="absolute top-1 bottom-1 rounded-md flex items-center justify-center text-[10px] font-bold"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  background: `${getSessionColor(s.name)}30`,
                  border: `1px solid ${getSessionColor(s.name)}50`,
                  color: getSessionColor(s.name),
                }}
              >
                {s.name.replace('_', ' ')}
              </motion.div>
            )
          })}
          {/* Current time indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#FFC83D] shadow-[0_0_8px_rgba(245, 197, 66, 0.6)]"
            style={{ left: `${(utcHours / 24) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
        </div>
      </GlassCard>
    </div>
  )
}

function SessionCard({ session, delay }: { session: SessionInfo; delay: number }) {
  const color = getSessionColor(session.name)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <GlassCard
        className={cn('p-5 transition-all', session.isActive && 'border-[rgba(245, 197, 66, 0.40)] glow-gold')}
        hover
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}
          >
            <Clock className="w-5 h-5" style={{ color }} />
          </div>
          {session.isActive ? (
            <StatusBadge variant="gold">ACTIVE</StatusBadge>
          ) : (
            <StatusBadge variant="neutral">INACTIVE</StatusBadge>
          )}
        </div>
        <h4 className="text-lg font-semibold font-display" style={{ color }}>{session.name.replace('_', ' ')}</h4>
        <div className="text-xs text-muted-foreground mt-1 font-mono">{session.startTime} → {session.endTime}</div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{session.description}</p>
        {session.killZoneStart && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Zap className="w-3 h-3 text-[#FFC83D]" />
              <span className="text-muted-foreground">Kill zone:</span>
              <span className="font-mono text-[#FFC83D]">{session.killZoneStart} - {session.killZoneEnd}</span>
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
