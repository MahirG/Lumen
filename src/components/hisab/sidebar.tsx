'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, LayoutDashboard, Brain, Clock, Newspaper, Gauge,
  Calculator, BookOpen, Bell, GraduationCap, Eye,
  Activity, X, Sparkles, Zap, Crown, Layers, BellRing,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StatusDot } from './primitives'

export interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  badge?: string
  category: 'home' | 'analysis' | 'intelligence'
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, description: 'Platform overview', category: 'home' },
  { id: 'dashboard', label: 'Intelligence Workspace', icon: LayoutDashboard, description: 'Institutional command center', category: 'analysis' },
  { id: 'chart-analysis', label: 'Institutional Intelligence', icon: Eye, description: 'AI Vision + SMC detection', category: 'analysis' },
  { id: 'decision-engine', label: 'AI Market Intelligence', icon: Brain, description: 'Bias · entry · SL · TP', category: 'analysis' },
  { id: 'aile', label: 'AILE Engine', icon: Layers, description: '12-phase institutional liquidity', badge: 'PRO', category: 'analysis' },
  { id: 'mtf', label: 'Multi-Timeframe', icon: Activity, description: '8-timeframe bias matrix', category: 'analysis' },
  { id: 'sessions', label: 'Session Intelligence', icon: Clock, description: 'ICT kill zones', category: 'intelligence' },
  { id: 'news', label: 'Global Market Events', icon: Newspaper, description: 'Economic events & protection', category: 'intelligence' },
  { id: 'gold-strength', label: 'Gold Strength Index', icon: Gauge, description: 'DXY · yields · volatility', category: 'intelligence' },
  { id: 'risk', label: 'Risk Intelligence', icon: Calculator, description: 'Position sizing & R:R', category: 'intelligence' },
  { id: 'journal', label: 'Performance Intelligence', icon: BookOpen, description: 'Trade log · stats · analytics', category: 'intelligence' },
  { id: 'alerts', label: 'Priority Intelligence', icon: Bell, description: 'SMC event notifications', category: 'intelligence' },
  { id: 'asne', label: 'Market Intelligence Center', icon: BellRing, description: 'AI notification engine', badge: 'NEW', category: 'intelligence' },
  { id: 'coach', label: 'Apex Academy', icon: GraduationCap, description: 'AI mentor & education', category: 'intelligence' },
]

interface SidebarProps {
  active: string
  onSelect: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

const CATEGORY_LABELS: Record<NavItem['category'], string> = {
  home: 'Overview',
  analysis: 'Institutional Intelligence',
  intelligence: 'Market Intelligence',
}

export function Sidebar({ active, onSelect, isOpen, onClose }: SidebarProps) {
  const categories = Array.from(new Set(NAV_ITEMS.map(n => n.category)))

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed lg:sticky top-0 z-50 lg:z-30',
          'h-screen w-[290px] shrink-0',
          'transition-transform duration-300 ease-out',
          'flex flex-col',
          // Desktop: left sticky sidebar (lg:translate-x-0, lg:left-0).
          // Mobile: right-side drawer (right-0, translate-x-full when closed).
          'right-0 lg:right-auto lg:left-0',
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
        )}
        style={{
          background: 'linear-gradient(180deg, rgba(13, 17, 38, 0.98), rgba(8, 12, 28, 0.98))',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: isOpen ? '-12px 0 40px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/[6%]">
          <Link href="/" onClick={() => onSelect('home')} className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[oklch(0.95_0.10_85)] via-[oklch(0.82_0.16_85)] to-[oklch(0.65_0.20_75)] flex items-center justify-center glow-gold shrink-0 overflow-hidden">
              <Crown className="w-5 h-5 text-[oklch(0.07_0.018_265)]" strokeWidth={2.5} />
              <div className="absolute inset-0 shimmer opacity-40" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-none font-display tracking-tight text-gradient-gold">
                Apex EA Pro
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1.5 font-medium">
                AI Forex · Gold
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
        <nav className="flex-1 overflow-y-auto p-3 space-y-5 no-scrollbar" aria-label="Main navigation">
          {categories.map((category) => (
            <div key={category}>
              <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-semibold">
                {CATEGORY_LABELS[category]}
              </div>
              <div className="space-y-1">
                {NAV_ITEMS.filter(n => n.category === category).map((item) => {
                  const Icon = item.icon
                  const isActive = active === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onSelect(item.id); onClose() }}
                      className={cn(
                        'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
                        'transition-all duration-300',
                        isActive
                          ? 'bg-gradient-to-r from-[oklch(0.82_0.15_85/12%)] via-[oklch(0.82_0.15_85/6%)] to-transparent text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/[4%]',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[oklch(0.95_0.10_85)] to-[oklch(0.65_0.20_75)] rounded-r-full glow-gold"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0',
                        isActive
                          ? 'bg-gradient-to-br from-[oklch(0.82_0.15_85/20%)] to-[oklch(0.82_0.15_85/8%)] border border-[oklch(0.82_0.15_85/25%)]'
                          : 'bg-white/[4%] group-hover:bg-white/[8%]',
                      )}>
                        <Icon className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-[oklch(0.92_0.13_85)]' : 'text-muted-foreground group-hover:text-foreground',
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          'text-sm font-medium leading-none',
                          isActive && 'text-foreground',
                        )}>
                          {item.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 truncate">
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <Sparkles className="w-3 h-3 text-[oklch(0.92_0.13_85)]" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Upgrade card */}
        <div className="p-3 border-t border-white/[6%]">
          <div className="rounded-xl p-3.5 glass-gold relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-[oklch(0.92_0.13_85)]" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-[oklch(0.92_0.13_85)]">AI Engine</span>
              <StatusDot color="gold" pulse size="sm" className="ml-auto" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Real-time SMC + ICT analysis powered by institutional-grade AI.
            </p>
            <div className="mt-2.5 pt-2.5 border-t border-white/[8%]">
              <p className="text-[10px] text-muted-foreground/80 italic leading-relaxed">
                Educational tool · Not financial advice
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
