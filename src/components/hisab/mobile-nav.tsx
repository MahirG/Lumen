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

/**
 * MobileNav — Apple-inspired full-screen mobile navigation.
 *
 * Features:
 * - Animated hamburger → X morph (spring-based, 300ms)
 * - Full-screen overlay with blur background
 * - Staggered menu item entrance (fade + slide up)
 * - Language selector, theme switcher, Sign In, Launch CTA
 * - Locks background scroll when open
 * - Closes on Escape key
 * - 44×44px minimum touch targets
 * - Hardware-accelerated 60fps animations
 * - Accessible: ARIA labels, keyboard nav, focus indicators
 */
export function MobileNav({ isOpen, onClose, onNavigate, activeSection }: MobileNavProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useI18n()

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
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
          {/* Backdrop with blur */}
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
              background: 'rgba(10, 10, 12, 0.98)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}>
                  <Crown className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>ApexEAPro</span>
              </div>

              {/* Close button — animated X */}
              <motion.button
                onClick={onClose}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close menu"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <X className="w-5 h-5 text-[#F5F5F7]" />
                </motion.div>
              </motion.button>
            </div>

            {/* Navigation items — scrollable */}
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
                      transition={{
                        delay: 0.05 + i * 0.04,
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl group transition-colors"
                      style={{
                        background: isActive ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
                      }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          background: isActive ? 'rgba(0, 122, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                          border: isActive ? '1px solid rgba(0, 122, 255, 0.25)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <Icon
                          className="w-[18px] h-[18px]"
                          style={{ color: isActive ? '#0A84FF' : 'rgba(235,235,245,0.5)' }}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </div>

                      {/* Label */}
                      <span
                        className="flex-1 text-left text-[15px] font-medium tracking-tight"
                        style={{ color: isActive ? '#F5F5F7' : 'rgba(235,235,245,0.7)' }}
                      >
                        {item.label}
                      </span>

                      {/* Badge */}
                      {item.badge && (
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                          style={{
                            background: item.badge === 'PRO' ? 'rgba(255, 214, 10, 0.12)' : 'rgba(52, 199, 89, 0.12)',
                            color: item.badge === 'PRO' ? '#FFD60A' : '#34C759',
                            border: `1px solid ${item.badge === 'PRO' ? 'rgba(255,214,10,0.25)' : 'rgba(52,199,89,0.25)'}`,
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

            {/* Bottom section — controls + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + NAV_ITEMS.length * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
              className="px-6 py-5 space-y-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Controls row */}
              <div className="flex items-center gap-3">
                {/* Language selector */}
                <button
                  onClick={cycleLanguage}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-colors hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  aria-label="Change language"
                >
                  <Globe className="w-4 h-4 text-[#F5F5F7]/50" />
                  <span className="text-[#F5F5F7]/70">{LANGUAGES.find(l => l.code === language)?.nativeName || language}</span>
                </button>

                {/* Theme switcher */}
                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-colors hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-[#FFD60A]" />
                      <span className="text-[#F5F5F7]/70">Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-[#007AFF]" />
                      <span className="text-[#F5F5F7]/70">Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sign In */}
              <button
                onClick={() => { handleNavigate('home'); onClose() }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <LogIn className="w-4 h-4 text-[#F5F5F7]/50" />
                <span className="text-[#F5F5F7]/70">Sign In</span>
              </button>

              {/* Launch CTA — primary */}
              <motion.button
                onClick={() => handleNavigate('dashboard')}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #007AFF, #AF52DE)',
                  boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3)',
                }}
              >
                <Zap className="w-4 h-4" />
                Launch AI Intelligence Workspace
              </motion.button>

              {/* Disclaimer */}
              <p className="text-[10px] text-center text-[#F5F5F7]/30 leading-relaxed">
                Educational only — not financial advice.<br />
                Powered by <a href="https://hisabtechnologies.com" target="_blank" rel="noopener noreferrer" className="text-[#007AFF] hover:underline">HisabTech</a>
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * AnimatedHamburger — Apple-style animated hamburger icon.
 * Three lines that morph into an X with spring physics.
 * 300ms animation, 44×44px touch target.
 */
export function AnimatedHamburger({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="lg:hidden fixed top-4 right-4 z-[62] w-11 h-11 rounded-full flex items-center justify-center"
      style={{
        background: 'rgba(18, 18, 20, 0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      whileTap={{ scale: 0.9 }}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      <div className="relative w-5 h-4 flex flex-col justify-between items-center">
        {/* Top line */}
        <motion.div
          animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-full h-[2px] rounded-full bg-[#F5F5F7] origin-center"
        />
        {/* Middle line */}
        <motion.div
          animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-full h-[2px] rounded-full bg-[#F5F5F7] origin-center"
        />
        {/* Bottom line */}
        <motion.div
          animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-full h-[2px] rounded-full bg-[#F5F5F7] origin-center"
        />
      </div>
    </motion.button>
  )
}

/**
 * StickyHeader — Apple-style glass header that becomes more opaque on scroll.
 * Shows logo on left, optional page title in center.
 */
export function StickyHeader({ title, onMenuClick }: { title?: string; onMenuClick: () => void }) {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className="lg:hidden sticky top-0 z-40 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10, 10, 12, 0.9)' : 'rgba(10, 10, 12, 0.5)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="flex items-center justify-between px-5 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007AFF, #AF52DE)' }}>
            <Crown className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>ApexEAPro</span>
        </div>

        {/* Page title (center) */}
        {title && (
          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-[#F5F5F7]/60 truncate max-w-[140px]">
            {title}
          </span>
        )}

        {/* Hamburger handled by AnimatedHamburger component (fixed positioned) */}
        <div className="w-11" /> {/* Spacer for fixed hamburger */}
      </div>
    </header>
  )
}
