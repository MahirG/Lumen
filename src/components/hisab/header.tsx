'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, User, Search, Bell, Globe, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { BrandLogo } from './brand-logo'
import { useI18n } from '@/lib/i18n/context'
import { LANGUAGES } from '@/lib/i18n/types'

interface HeaderProps {
  onMenuClick: () => void
  onAuthClick: () => void
  activeSection: string
  onNavigate: (section: string) => void
  title: string
  subtitle?: string
  mobileNavOpen?: boolean
}

/* ============================================
   NAV ITEMS — center desktop navigation
   ============================================ */
const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'dashboard', label: 'Workspace' },
  { id: 'trading', label: 'Trading' },
  { id: 'aile', label: 'Apex AI' },
  { id: 'asne', label: 'Intelligence' },
]

/* ============================================
   Header — 2026 premium desktop sticky bar
   Layout: Logo (left) | Nav (center) | Controls (right)
   Desktop controls: Search | Language | Theme | Notifications | Account
   ============================================ */
export function Header({ onMenuClick, onAuthClick, activeSection, onNavigate, title, subtitle, mobileNavOpen }: HeaderProps) {
  const [mounted, setMounted] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-40 overflow-x-hidden transition-all duration-300"
      style={{
        background: scrolled
          ? 'color-mix(in oklch, var(--background) 85%, transparent)'
          : 'color-mix(in oklch, var(--background) 70%, transparent)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          {/* ===== LEFT: Logo ===== */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542] rounded-xl px-1 py-1"
              aria-label="ApexEAPro home"
            >
              <BrandLogo
                height={48}
                className="h-[40px] sm:h-[48px] w-auto transition-transform duration-300 group-hover:scale-[1.03]"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(245, 197, 66, 0.15))' }}
              />
            </button>
          </div>

          {/* ===== CENTER: Navigation (desktop only, lg+) ===== */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {NAV_ITEMS.map(item => {
              const active = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542]',
                  )}
                  style={{
                    color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-lg -z-10"
                      style={{ background: 'var(--accent)' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </nav>

          {/* ===== RIGHT: Controls ===== */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Search — desktop only */}
            <SearchButton />

            {/* Language Selector — desktop only */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications — desktop only */}
            <NotificationsButton />

            {/* User Account */}
            <UserAccountButton onClick={onAuthClick} />

            {/* Hamburger — mobile/tablet only */}
            <PremiumHamburger onClick={onMenuClick} isOpen={mobileNavOpen ?? false} />
          </div>
        </div>
      </div>
    </header>
  )
}

/* ============================================
   SearchButton — premium search trigger
   ============================================ */
function SearchButton() {
  return (
    <button
      aria-label="Search"
      className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-lg text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-foreground/[5%] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542]"
    >
      <Search className="w-[16px] h-[16px]" strokeWidth={2} />
      <span className="text-xs font-medium">Search</span>
      <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-muted border border-border text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  )
}

/* ============================================
   LanguageSelector — premium dropdown
   ============================================ */
function LanguageSelector() {
  const { language, setLanguage } = useI18n()
  const [open, setOpen] = React.useState(false)
  const current = LANGUAGES.find(l => l.code === language)

  return (
    <div className="relative hidden lg:block">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Select language"
        className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-foreground/[5%] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542]"
      >
        <Globe className="w-[16px] h-[16px]" strokeWidth={2} />
        <span className="text-xs font-medium uppercase">{current?.code || 'EN'}</span>
        <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-full mt-2 w-44 rounded-xl p-1.5 z-50"
              style={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              }}
            >
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150',
                    language === lang.code
                      ? 'text-foreground bg-foreground/[5%]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[5%]'
                  )}
                >
                  <span>{lang.nativeName}</span>
                  <span className="font-mono text-[10px] uppercase opacity-60">{lang.code}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============================================
   NotificationsButton — bell with badge
   ============================================ */
function NotificationsButton() {
  const [hasUnread] = React.useState(true)
  return (
    <button
      aria-label="Notifications"
      className="hidden lg:flex relative w-9 h-9 items-center justify-center rounded-lg text-foreground/70 hover:text-foreground transition-colors duration-200 hover:bg-foreground/[5%] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542]"
    >
      <Bell className="w-[17px] h-[17px]" strokeWidth={2} />
      {hasUnread && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F5C542] ring-2 ring-background" />
      )}
    </button>
  )
}

/* ============================================
   ThemeToggle — icon-only, smooth rotation/fade
   ============================================ */
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-9 h-9 flex items-center justify-center rounded-lg text-foreground/70 hover:text-foreground transition-colors duration-200 hover:bg-foreground/[5%] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542]"
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && theme === 'dark' ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute"
          >
            <Moon className="w-[17px] h-[17px]" strokeWidth={2} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute"
          >
            <Sun className="w-[17px] h-[17px]" strokeWidth={2} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

/* ============================================
   UserAccountButton — icon only, premium scale hover
   ============================================ */
function UserAccountButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      aria-label="Sign in to your account"
      className="relative w-9 h-9 flex items-center justify-center rounded-lg text-foreground/70 hover:text-foreground transition-colors duration-200 hover:bg-foreground/[5%] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542]"
    >
      <User className="w-[17px] h-[17px]" strokeWidth={2} />
    </motion.button>
  )
}

/* ============================================
   PremiumHamburger — 3 lines, top two equal & longer, bottom shorter
   Morphs to X when open, smooth spring transition
   Mobile/tablet only (below lg)
   ============================================ */
function PremiumHamburger({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  const handleClick = () => {
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      className="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-lg text-foreground/70 hover:text-foreground transition-colors duration-200 hover:bg-foreground/[5%] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542]"
    >
      <div className="relative w-[22px] h-[14px] flex flex-col justify-between items-center">
        {/* Top line — full width (22px) */}
        <motion.span
          className="block h-[2px] rounded-full bg-current"
          style={{ width: '22px', transformOrigin: 'center' }}
          animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22, duration: 0.3 }}
        />
        {/* Middle line — full width (22px), equal to top */}
        <motion.span
          className="block h-[2px] rounded-full bg-current self-center"
          style={{ width: '22px', transformOrigin: 'center' }}
          animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22, duration: 0.25 }}
        />
        {/* Bottom line — SHORTER (14px) */}
        <motion.span
          className="block h-[2px] rounded-full bg-current self-center"
          style={{ width: '14px', transformOrigin: 'center' }}
          animate={isOpen ? { rotate: -45, y: -6, width: '22px' } : { rotate: 0, y: 0, width: '14px' }}
          transition={{ type: 'spring', stiffness: 350, damping: 22, duration: 0.3 }}
        />
      </div>
    </button>
  )
}
