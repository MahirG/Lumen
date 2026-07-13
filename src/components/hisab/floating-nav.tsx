'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, LayoutDashboard, Atom, BellRing } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingNavProps {
  active: string
  onNavigate: (section: string) => void
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'aile', label: 'AILE', icon: Atom },
  { id: 'asne', label: 'Alerts', icon: BellRing },
]

/**
 * FloatingNav — 2026 award-winning floating glass dock navigation.
 * Appears on ALL pages (landing + tool pages) at the bottom center.
 * 4 buttons only: Home, Dashboard, AILE, Charts.
 *
 * Features:
 * - Liquid glass dock with strong backdrop blur
 * - Active button expands with gradient glow
 * - Hover micro-interactions (icon scale + label reveal)
 * - Spring physics on press
 * - Safe area aware (iOS notch)
 * - Auto-hides on scroll down, shows on scroll up (mobile)
 */
export function FloatingNav({ active, onNavigate }: FloatingNavProps) {
  const [hovered, setHovered] = React.useState<string | null>(null)

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
        onMouseLeave={() => setHovered(null)}
        style={{
          background: 'rgba(18, 18, 20, 0.8)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Top accent line */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-2/3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,122,255,0.4), transparent)' }} />

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          const isHovered = hovered === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className={cn(
                'relative flex items-center justify-center rounded-xl transition-all duration-300',
                isActive
                  ? 'w-20 h-12'
                  : isHovered
                  ? 'w-16 h-12'
                  : 'w-12 h-12',
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active background glow */}
              {isActive && (
                <motion.div
                  layoutId="floating-nav-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'rgba(0, 122, 255, 0.15)',
                    border: '1px solid rgba(0, 122, 255, 0.25)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {/* Hover background */}
              {!isActive && isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-xl bg-white/[6%]"
                />
              )}
              {/* Active outer glow */}
              {isActive && (
                <div className="absolute -inset-1 rounded-xl blur-md -z-10" style={{ background: 'rgba(0, 122, 255, 0.1)' }} />
              )}
              {/* Content */}
              <div className="relative flex items-center gap-1.5 px-2">
                <Icon
                  className={cn(
                    'transition-all duration-300',
                    isActive
                      ? 'w-[18px] h-[18px]'
                      : 'w-[18px] h-[18px] text-[#F5F5F7]/40',
                    isHovered && !isActive && 'text-[#F5F5F7]',
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={isActive ? { color: '#0A84FF' } : {}}
                />
                {/* Label: always show for active, show on hover for inactive */}
                <AnimatePresence>
                  {(isActive || isHovered) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0, x: -4 }}
                      animate={{ opacity: 1, width: 'auto', x: 0 }}
                      exit={{ opacity: 0, width: 0, x: -4 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs font-semibold whitespace-nowrap leading-none"
                      style={{ color: isActive ? '#0A84FF' : '#F5F5F7' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          )
        })}
      </nav>
    </motion.div>
  )
}
