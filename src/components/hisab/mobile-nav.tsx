'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, LayoutDashboard, LineChart, Atom, BellRing, Eye,
  Newspaper, Activity, Brain, BarChart3, Clock, BookOpen,
  Globe, Sun, Moon, LogIn, X, ChevronRight,
  Twitter, Github, Linkedin, MessageCircle, HelpCircle, Phone,
  Settings, User,
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
  onAuthClick?: () => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

/* Compact, premium nav items — concise labels for mobile drawer */
const NAV_ITEMS: NavItem[] = [
  { id: 'home',              label: 'Home',                icon: Home },
  { id: 'dashboard',         label: 'Workspace',           icon: LayoutDashboard },
  { id: 'trading',           label: 'Trading',             icon: LineChart, badge: 'NEW' },
  { id: 'aile',              label: 'Apex AI',             icon: Atom, badge: 'PRO' },
  { id: 'asne',              label: 'Intelligence Center', icon: BellRing, badge: 'NEW' },
  { id: 'chart-analysis',    label: 'Institutional',       icon: Eye },
  { id: 'news',              label: 'Market Events',       icon: Newspaper },
  { id: 'alerts',            label: 'Alerts',              icon: Activity },
  { id: 'decision-engine',   label: 'AI Analysis',         icon: Brain },
  { id: 'mtf',               label: 'Multi-Timeframe',     icon: BarChart3 },
  { id: 'sessions',          label: 'Sessions',            icon: Clock },
  { id: 'journal',           label: 'Journal',             icon: BookOpen },
  { id: 'coach',             label: 'Academy',             icon: BookOpen },
]

const APP_VERSION = 'v2.6.0'
const COPYRIGHT = `© ${new Date().getFullYear()} ApexEAPro`

const SOCIAL_LINKS = [
  { icon: Twitter,   label: 'Twitter / X',   href: 'https://twitter.com' },
  { icon: Github,    label: 'GitHub',        href: 'https://github.com' },
  { icon: Linkedin,  label: 'LinkedIn',      href: 'https://linkedin.com' },
  { icon: MessageCircle, label: 'Discord',   href: 'https://discord.com' },
]

export function MobileNav({ isOpen, onClose, onNavigate, activeSection, onAuthClick }: MobileNavProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const { language, setLanguage } = useI18n()

  React.useEffect(() => { setMounted(true) }, [])

  // Lock body scroll
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape to close
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleNavigate = (section: string) => {
    onNavigate(section)
    onClose()
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

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
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] lg:hidden"
            style={{
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            aria-hidden="true"
          />

          {/* Side drawer — slides in from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36, mass: 0.8 }}
            className="fixed top-0 right-0 bottom-0 z-[61] lg:hidden flex flex-col w-[88vw] max-w-[380px]"
            style={{
              background: 'var(--popover)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-24px 0 80px rgba(0, 0, 0, 0.4)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* ===== HEADER ===== */}
            <div
              className="flex items-center justify-between px-5 h-14 shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <button
                onClick={() => handleNavigate('home')}
                className="flex items-center gap-2 group"
                aria-label="ApexEAPro home"
              >
                <img
                  src="/brand/png/apexeapro_logo_horizontal_dark_transparent.png"
                  alt="ApexEAPro"
                  height={26}
                  className="h-[22px] w-auto transition-transform duration-200 group-hover:scale-[1.03]"
                />
              </button>

              <button
                onClick={onClose}
                aria-label="Close menu"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all duration-200"
              >
                <X className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
            </div>

            {/* ===== NAV ITEMS (scrollable) ===== */}
            <div className="flex-1 overflow-y-auto py-3 px-3 overscroll-contain">
              <nav className="space-y-0.5" aria-label="Primary navigation">
                {NAV_ITEMS.map((item, i) => (
                  <NavRow
                    key={item.id}
                    item={item}
                    isActive={activeSection === item.id}
                    onClick={() => handleNavigate(item.id)}
                    index={i}
                  />
                ))}
              </nav>

              {/* Divider */}
              <div className="my-3 h-px" style={{ background: 'var(--border)' }} />

              {/* Secondary items */}
              <div className="space-y-0.5">
                <SecondaryRow
                  icon={Settings}
                  label="Settings"
                  onClick={onClose}
                />
                <SecondaryRow
                  icon={HelpCircle}
                  label="Help & Support"
                  onClick={onClose}
                />
                <SecondaryRow
                  icon={Phone}
                  label="Contact Us"
                  onClick={onClose}
                />
              </div>
            </div>

            {/* ===== BOTTOM SECTION ===== */}
            <div
              className="shrink-0 px-5 py-4 space-y-3"
              style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}
            >
              {/* Quick toggles: Language + Theme */}
              <div className="flex items-center gap-2">
                <button
                  onClick={cycleLanguage}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[12px] font-medium transition-colors hover:bg-foreground/5"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                  aria-label="Change language"
                >
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                  <span>{LANGUAGES.find(l => l.code === language)?.nativeName || language}</span>
                </button>

                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[12px] font-medium transition-colors hover:bg-foreground/5"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                  aria-label="Toggle theme"
                >
                  {mounted && theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5" style={{ color: '#F5C542' }} strokeWidth={2} />
                  ) : (
                    <Moon className="w-3.5 h-3.5" style={{ color: '#F5C542' }} strokeWidth={2} />
                  )}
                  <span>{mounted && theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
              </div>

              {/* Sign In button */}
              <button
                onClick={() => { onClose(); onAuthClick?.() }}
                className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 hover:opacity-95 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #F5C542, #F5C542)',
                  boxShadow: '0 4px 16px rgba(245, 197, 66, 0.28)',
                }}
              >
                <LogIn className="w-[15px] h-[15px]" strokeWidth={2.2} />
                <span>Sign In / Sign Up</span>
              </button>

              {/* Social icons */}
              <div className="flex items-center justify-center gap-1 pt-1">
                {SOCIAL_LINKS.map(s => {
                  const Icon = s.icon
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200"
                    >
                      <Icon className="w-[15px] h-[15px]" strokeWidth={2} />
                    </a>
                  )
                })}
              </div>

              {/* Version + copyright */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/70 font-mono">
                <span>{APP_VERSION}</span>
                <span>·</span>
                <span>{COPYRIGHT}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ============================================
   NavRow — primary navigation item
   Compact: 40px height, 14px text, icon 17px
   ============================================ */
function NavRow({
  item, isActive, onClick, index,
}: {
  item: NavItem
  isActive: boolean
  onClick: () => void
  index: number
}) {
  const Icon = item.icon

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 + index * 0.025, type: 'spring', stiffness: 400, damping: 28 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'w-full flex items-center gap-3 h-10 px-3 rounded-lg transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542]',
      )}
      style={{
        background: isActive ? 'var(--accent)' : 'transparent',
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        className="w-[17px] h-[17px] shrink-0 transition-transform duration-200"
        style={{ color: isActive ? '#F5C542' : 'var(--muted-foreground)' }}
        strokeWidth={isActive ? 2.4 : 2}
      />
      <span
        className={cn(
          'flex-1 text-left text-[14px] tracking-tight transition-colors duration-200',
        )}
        style={{
          color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
          fontWeight: isActive ? 600 : 500,
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
        }}
      >
        {item.label}
      </span>
      {item.badge && (
        <span
          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
          style={{
            background: item.badge === 'PRO' ? 'rgba(245, 197, 66, 0.12)' : 'rgba(0, 230, 118, 0.12)',
            color: item.badge === 'PRO' ? '#F5C542' : '#00E676',
            border: `1px solid ${item.badge === 'PRO' ? 'rgba(245,185,66,0.25)' : 'rgba(16,185,129,0.25)'}`,
          }}
        >
          {item.badge}
        </span>
      )}
      {isActive && (
        <ChevronRight className="w-3.5 h-3.5 text-[#F5C542]" strokeWidth={2.4} />
      )}
    </motion.button>
  )
}

/* ============================================
   SecondaryRow — settings, help, contact
   ============================================ */
function SecondaryRow({
  icon: Icon, label, onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 h-10 px-3 rounded-lg transition-all duration-200 hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542]"
    >
      <Icon className="w-[17px] h-[17px] shrink-0 text-muted-foreground" strokeWidth={2} />
      <span
        className="flex-1 text-left text-[14px] text-muted-foreground"
        style={{ fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.3 }}
      >
        {label}
      </span>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" strokeWidth={2} />
    </button>
  )
}

/**
 * AnimatedHamburger — deprecated, kept for backward compat.
 * The new premium hamburger is integrated inside the Header component.
 */
export function AnimatedHamburger({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return null
}
