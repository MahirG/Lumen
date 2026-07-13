'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Brain, Clock, Newspaper, Gauge,
  Calculator, BookOpen, Bell, GraduationCap, Eye,
  Activity, Trophy, X, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard, description: 'Real-time price, indicators & session' },
  { id: 'chart-analysis', label: 'Chart Analysis', icon: Eye, description: 'SMC + AI Vision chart breakdown' },
  { id: 'decision-engine', label: 'AI Decision Engine', icon: Brain, description: 'Bias, confidence, entry/SL/TP' },
  { id: 'mtf', label: 'Multi-Timeframe', icon: Activity, description: '8-timeframe bias matrix' },
  { id: 'sessions', label: 'Session Detector', icon: Clock, description: 'Kill zones & session timing' },
  { id: 'news', label: 'News Filter', icon: Newspaper, description: 'Economic events & warnings' },
  { id: 'gold-strength', label: 'Gold Strength', icon: Gauge, description: 'DXY, yields, volatility' },
  { id: 'risk', label: 'Risk Manager', icon: Calculator, description: 'Position size & R:R calculator' },
  { id: 'journal', label: 'Trade Journal', icon: BookOpen, description: 'Trade log & statistics' },
  { id: 'alerts', label: 'Smart Alerts', icon: Bell, description: 'SMC event notifications' },
  { id: 'coach', label: 'AI Coach', icon: GraduationCap, description: 'Mentor-style explanations' },
]

interface SidebarProps {
  active: string
  onSelect: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ active, onSelect, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 lg:z-30',
          'h-screen w-[280px] shrink-0',
          'glass-strong border-r border-border/50',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-border/30">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.92_0.14_85)] to-[oklch(0.72_0.18_75)] flex items-center justify-center glow-gold shrink-0">
                <Trophy className="w-5 h-5 text-[oklch(0.16_0.012_240)]" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold leading-none font-display tracking-tight text-gradient-gold">
                  Hisab Gold AI
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                  XAUUSD • SMC
                </span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id)
                    onClose()
                  }}
                  className={cn(
                    'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
                    'transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-[oklch(0.82_0.15_85/15%)] to-transparent text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-gradient-to-b from-[oklch(0.92_0.14_85)] to-[oklch(0.72_0.18_75)] rounded-r-full"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <Icon className={cn(
                    'w-[18px] h-[18px] shrink-0 transition-colors',
                    isActive ? 'text-[oklch(0.92_0.14_85)]' : 'text-muted-foreground group-hover:text-foreground',
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'text-sm font-medium leading-none',
                      isActive && 'text-foreground',
                    )}>
                      {item.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 truncate">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <Sparkles className="w-3 h-3 text-[oklch(0.92_0.14_85)] animate-pulse" />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Disclaimer */}
          <div className="p-3 border-t border-border/30">
            <div className="rounded-lg glass-gold p-3">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.66_0.22_25)] mt-1.5 pulse-dot" />
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  Educational tool. <span className="text-[oklch(0.92_0.14_85)]">Not financial advice.</span> Probability-based analysis only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
