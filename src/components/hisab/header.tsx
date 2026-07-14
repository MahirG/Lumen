'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick: () => void
  onAuthClick: () => void
  activeSection: string
  onNavigate: (section: string) => void
  title: string
  subtitle?: string
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
   Header — 2026 premium unified sticky bar
   Layout: Logo (left) | Nav (center) | Controls (right)
   ============================================ */
export function Header({ onMenuClick, onAuthClick, activeSection, onNavigate, title, subtitle }: HeaderProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'color-mix(in oklch, var(--background) 78%, transparent)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">
          {/* ===== LEFT: Logo (logo_transparent.png on dark navy header) ===== */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1677FF] rounded-xl px-1 py-1"
              aria-label="ApexEAPro home"
            >
              <img
                src="/logo_transparent.png"
                alt="ApexEAPro"
                height={34}
                className="h-[28px] sm:h-[34px] w-auto transition-transform duration-300 group-hover:scale-[1.03]"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(22, 119, 255, 0.15))' }}
              />
            </button>
          </div>

          {/* ===== CENTER: Navigation (desktop only) ===== */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {NAV_ITEMS.map(item => {
              const active = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'relative px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1677FF]',
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
            {/* Theme Toggle — icon only, no container */}
            <ThemeToggle />

            {/* User Account — icon only, no container */}
            <UserAccountButton onClick={onAuthClick} />

            {/* Hamburger — mobile only, no container */}
            <PremiumHamburger onClick={onMenuClick} />
          </div>
        </div>
      </div>
    </header>
  )
}

/* ============================================
   ThemeToggle — icon-only, smooth rotation/fade
   No background, no container
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
      className="relative w-10 h-10 flex items-center justify-center rounded-lg text-foreground/70 hover:text-foreground transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1677FF]"
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
            <Moon className="w-[19px] h-[19px]" strokeWidth={2} />
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
            <Sun className="w-[19px] h-[19px]" strokeWidth={2} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

/* ============================================
   UserAccountButton — icon only, no container
   Premium scale hover effect
   ============================================ */
function UserAccountButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      aria-label="Sign in to your account"
      className="relative w-10 h-10 flex items-center justify-center rounded-lg text-foreground/70 hover:text-foreground transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1677FF]"
    >
      <User className="w-[19px] h-[19px]" strokeWidth={2} />
    </motion.button>
  )
}

/* ============================================
   PremiumHamburger — 3 lines, middle shorter
   Morphs to X, no container, large touch target
   Mobile/tablet only (below lg)
   ============================================ */
function PremiumHamburger({ onClick }: { onClick: () => void }) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClick = () => {
    setIsOpen(o => !o)
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Open menu"
      aria-expanded={isOpen}
      className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg text-foreground/70 hover:text-foreground transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1677FF]"
    >
      <div className="relative w-[20px] h-[14px] flex flex-col justify-between items-center">
        {/* Top line — full width */}
        <motion.span
          className="block h-[2px] rounded-full bg-current"
          style={{ width: '20px', transformOrigin: 'center' }}
          animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
        />
        {/* Middle line — SHORTER (14px vs 20px) */}
        <motion.span
          className="block h-[2px] rounded-full bg-current self-center"
          style={{ width: '14px', transformOrigin: 'center' }}
          animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.15 }}
        />
        {/* Bottom line — full width */}
        <motion.span
          className="block h-[2px] rounded-full bg-current"
          style={{ width: '20px', transformOrigin: 'center' }}
          animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 24 }}
        />
      </div>
    </button>
  )
}
