'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Home, LayoutDashboard, Atom, BellRing } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingNavProps {
  active: string
  onNavigate: (section: string) => void
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dashboard', label: 'Workspace', icon: LayoutDashboard },
  { id: 'aile', label: 'AILE', icon: Atom },
  { id: 'asne', label: 'Intelligence', icon: BellRing },
]

/**
 * FloatingNav — 2026 award-winning floating glass dock navigation.
 * Icons only (no text labels). Active state uses glow + color.
 */
export function FloatingNav({ active, onNavigate }: FloatingNavProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <nav
        className="pointer-events-auto flex items-center gap-1 p-1.5 mb-4 mx-4 rounded-2xl"
        aria-label="Floating navigation"
        style={{
          background: 'var(--card)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Top accent line */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-2/3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(22,122,255,0.4), transparent)' }} />

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="relative flex items-center justify-center w-11 h-11 rounded-xl"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active background glow */}
              {isActive && (
                <motion.div
                  layoutId="floating-nav-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'rgba(22, 119, 255, 0.15)',
                    border: '1px solid rgba(22, 119, 255, 0.25)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {/* Active outer glow */}
              {isActive && (
                <div className="absolute -inset-1 rounded-xl blur-md -z-10" style={{ background: 'rgba(22, 119, 255, 0.12)' }} />
              )}
              {/* Icon only — no text */}
              <Icon
                className={cn(
                  'relative w-[19px] h-[19px] transition-colors duration-300',
                  !isActive && 'text-muted-foreground',
                )}
                strokeWidth={isActive ? 2.5 : 2}
                style={isActive ? { color: '#1677FF' } : {}}
              />
            </motion.button>
          )
        })}
      </nav>
    </motion.div>
  )
}
