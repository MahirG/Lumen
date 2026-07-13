'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, LayoutDashboard, Brain, BellRing, Eye, Newspaper,
  BarChart3, Clock, BookOpen, Crown, Globe, Sun, Moon,
  LogIn, Zap, X, Atom, Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'
import { LANGUAGES } from '@/lib/i18n/types'
import { useTheme } from 'next-themes'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (section: string) => void
  activeSection: string
}

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dashboard', label: 'AI Intelligence Workspace', icon: LayoutDashboard },
  { id: 'aile', label: 'Apex AI', icon: Atom, badge: 'PRO' },
  { id: 'asne', label: 'Market Intelligence Center', icon: BellRing, badge: 'NEW' },
  { id: 'chart-analysis', label: 'Institutional Intelligence', icon: Eye },
  { id: 'news', label: 'Global Market Events', icon: Newspaper },
  { id: 'alerts', label: 'Market Intelligence Feed', icon: Activity },
  { id: 'decision-engine', label: 'AI Market Intelligence', icon: Brain },
  { id: 'mtf', label: 'Multi-Timeframe Intelligence', icon: BarChart3 },
  { id: 'sessions', label: 'Session Intelligence', icon: Clock },
  { id: 'journal', label: 'Performance Intelligence', icon: BookOpen },
  { id: 'coach', label: 'Apex Academy', icon: BookOpen },
]

export function MobileNav({ isOpen, onClose, onNavigate, activeSection }: MobileNavProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useI18n()

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleNavigate = (section: string) => {
    onNavigate(section)
    onClose()
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const cycleLanguage = () => {
    const langs = LANGUAGES.map(l => l.code)
    const idx = langs.indexOf(language)
    setLanguage(langs[(idx + 1) % langs.length])
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] lg:hidden"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          />

          {/* Full-screen menu */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[61] lg:hidden flex flex-col"
            style={{
              background: 'var(--popover)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1677FF, #7C5CFC)' }}>
                  <Crown className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-base font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-display)' }}>ApexEAPro</span>
              </div>

              <motion.button
                onClick={onClose}
                className="w-11 h-11 rounded-full flex items-center justify-center border"
                style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close menu"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <X className="w-5 h-5 text-foreground" />
                </motion.div>
              </motion.button>
            </div>

            {/* Navigation items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <nav className="space-y-1" aria-label="Main navigation">
                {NAV_ITEMS.map((item, i) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl transition-colors"
                      style={{
                        background: isActive ? 'rgba(22, 119, 255, 0.08)' : 'transparent',
                      }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          background: isActive ? 'rgba(22, 119, 255, 0.15)' : 'var(--muted)',
                          border: isActive ? '1px solid rgba(22, 119, 255, 0.25)' : '1px solid var(--border)',
                        }}
                      >
                        <Icon
                          className="w-[18px] h-[18px]"
                          style={{ color: isActive ? '#1677FF' : 'var(--muted-foreground)' }}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </div>

                      <span
                        className="flex-1 text-left text-[15px] font-medium tracking-tight"
                        style={{ color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                      >
                        {item.label}
                      </span>

                      {item.badge && (
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                          style={{
                            background: item.badge === 'PRO' ? 'rgba(245, 185, 66, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                            color: item.badge === 'PRO' ? '#F5B942' : '#10B981',
                            border: `1px solid ${item.badge === 'PRO' ? 'rgba(245,185,66,0.25)' : 'rgba(16,185,129,0.25)'}`,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </nav>
            </div>

            {/* Bottom controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + NAV_ITEMS.length * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
              className="px-6 py-5 space-y-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {/* Language + Theme */}
              <div className="flex items-center gap-3">
                <button
                  onClick={cycleLanguage}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-colors hover:opacity-80"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                  aria-label="Change language"
                >
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground/80">{LANGUAGES.find(l => l.code === language)?.nativeName || language}</span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-colors hover:opacity-80"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4" style={{ color: '#F5B942' }} />
                      <span className="text-foreground/80">Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4" style={{ color: '#1677FF' }} />
                      <span className="text-foreground/80">Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sign In */}
              <button
                onClick={() => { handleNavigate('home'); onClose() }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors hover:opacity-80"
                style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                <LogIn className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground/80">Sign In</span>
              </button>

              {/* Launch CTA */}
              <motion.button
                onClick={() => handleNavigate('dashboard')}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #1677FF, #7C5CFC)',
                  boxShadow: '0 8px 24px rgba(22, 119, 255, 0.3)',
                }}
              >
                <Zap className="w-4 h-4" />
                Launch AI Intelligence Workspace
              </motion.button>

              <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                Educational only — not financial advice.<br />
                Powered by <a href="https://hisabtechnologies.com" target="_blank" rel="noopener noreferrer" className="text-[#1677FF] hover:underline">HisabTech</a>
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * AnimatedHamburger — morphing icon, theme-aware.
 */
export function AnimatedHamburger({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="lg:hidden fixed top-4 right-4 z-[62] w-11 h-11 rounded-full flex items-center justify-center"
      style={{
        background: 'var(--card)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid var(--border)',
      }}
      whileTap={{ scale: 0.9 }}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      <div className="relative w-5 h-4 flex flex-col justify-between items-center">
        <motion.div
          animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-full h-[2px] rounded-full bg-foreground origin-center"
        />
        <motion.div
          animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-full h-[2px] rounded-full bg-foreground origin-center"
        />
        <motion.div
          animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-full h-[2px] rounded-full bg-foreground origin-center"
        />
      </div>
    </motion.button>
  )
}
