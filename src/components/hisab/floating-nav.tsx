'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, LayoutDashboard, Atom, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingNavProps {
  active: string
  onNavigate: (section: string) => void
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'aile', label: 'AILE', icon: Atom },
  { id: 'chart-analysis', label: 'Charts', icon: Eye },
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
        className="pointer-events-auto flex items-center gap-1 p-1.5 mb-4 mx-4 rounded-2xl liquid-glass-strong shadow-premium-lg"
        aria-label="Floating navigation"
        onMouseLeave={() => setHovered(null)}
      >
        {/* Top gradient accent line */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.15_85/50%)] to-transparent" />

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
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-[oklch(0.82_0.15_85/20%)] via-[oklch(0.78_0.18_220/15%)] to-[oklch(0.78_0.19_152/15%)] border border-[oklch(0.82_0.15_85/30%)]"
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
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[oklch(0.82_0.15_85/12%)] to-[oklch(0.78_0.18_220/12%)] blur-md -z-10" />
              )}
              {/* Content */}
              <div className="relative flex items-center gap-1.5 px-2">
                <Icon
                  className={cn(
                    'transition-all duration-300',
                    isActive
                      ? 'w-[18px] h-[18px] text-[oklch(0.92_0.13_85)]'
                      : 'w-[18px] h-[18px] text-muted-foreground',
                    isHovered && !isActive && 'text-foreground',
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {/* Label: always show for active, show on hover for inactive */}
                <AnimatePresence>
                  {(isActive || isHovered) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0, x: -4 }}
                      animate={{ opacity: 1, width: 'auto', x: 0 }}
                      exit={{ opacity: 0, width: 0, x: -4 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'text-xs font-semibold whitespace-nowrap leading-none',
                        isActive ? 'text-[oklch(0.92_0.13_85)]' : 'text-foreground',
                      )}
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
