'use client'

import * as React from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

/* ============================================
   LIQUID GLASS CARD 2.0
   ============================================ */

interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gold' | 'electric' | 'strong'
  hover?: boolean
  glow?: boolean
  children: React.ReactNode
}

export const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  ({ className, variant = 'default', hover = false, glow = false, children, ...props }, ref) => {
    const base = 'rounded-2xl border transition-all duration-300 ease-out'
    const variants = {
      default: 'liquid-glass border-white/[8%]',
      gold: 'liquid-glass-gold',
      electric: 'liquid-glass-electric',
      strong: 'liquid-glass border-white/[10%]',
    }
    const hoverClass = hover
      ? 'hover-lift hover:border-white/[14%] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]'
      : ''
    const glowClass = glow
      ? (variant === 'gold' ? 'glow-gold' : variant === 'electric' ? 'glow-electric' : 'glow-soft')
      : ''
    return (
      <div
        ref={ref}
        className={cn(
          base,
          variants[variant],
          hoverClass,
          glowClass,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
LiquidGlassCard.displayName = 'LiquidGlassCard'

/* ============================================
   GLOW BUTTON — Premium with ripple + shine
   ============================================ */

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'electric' | 'emerald' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  shine?: boolean
  children: React.ReactNode
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant = 'gold', size = 'md', glow = false, shine = true, children, onClick, ...props }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    React.useImperativeHandle(ref, () => buttonRef.current!)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current
      if (button) {
        const ripple = document.createElement('span')
        const rect = button.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2
        ripple.style.width = ripple.style.height = `${size}px`
        ripple.style.left = `${x}px`
        ripple.style.top = `${y}px`
        ripple.className = 'ripple'
        button.appendChild(ripple)
        setTimeout(() => ripple.remove(), 600)
      }
      onClick?.(e)
    }

    const variants = {
      gold: 'text-[#0B0F19] hover:shadow-[0_8px_32px_rgba(245,185,66,0.3)]',
      electric: 'text-white hover:shadow-[0_8px_32px_rgba(22,119,255,0.3)]',
      emerald: 'text-white hover:shadow-[0_8px_32px_rgba(16,185,129,0.3)]',
      ghost: 'bg-transparent hover:bg-foreground/[6%] text-foreground border border-border hover:border-foreground/20',
      outline: 'bg-transparent border border-border hover:border-foreground/25 hover:bg-foreground/[4%] text-foreground',
      danger: 'text-white hover:shadow-[0_8px_32px_rgba(239,68,68,0.3)]',
    }
    const gradientBg: Record<string, string> = {
      gold: 'linear-gradient(135deg, #F5C542, #E09B2E)',
      electric: 'linear-gradient(135deg, #F5C542, #0958D6)',
      emerald: 'linear-gradient(135deg, #00E676, #059669)',
      danger: 'linear-gradient(135deg, #FF5252, #DC2626)',
    }
    const sizes = {
      sm: 'h-8 px-3.5 text-xs rounded-lg gap-1.5',
      md: 'h-10 px-5 text-sm rounded-xl gap-2',
      lg: 'h-12 px-6 text-base rounded-xl gap-2',
      xl: 'h-14 px-8 text-base lg:text-lg rounded-2xl gap-2.5',
    }
    return (
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={cn(
          'relative inline-flex items-center justify-center font-semibold transition-all duration-300',
          'active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
          'overflow-hidden hover-scale',
          shine && 'btn-shine shine-on-hover',
          variants[variant],
          sizes[size],
          glow && (variant === 'gold' ? 'glow-gold' : variant === 'electric' ? 'glow-electric' : variant === 'emerald' ? 'glow-emerald' : ''),
          className,
        )}
        style={gradientBg[variant] ? { background: gradientBg[variant] } : undefined}
        {...props}
      >
        {children}
      </button>
    )
  }
)
GlowButton.displayName = 'GlowButton'

/* ============================================
   ANIMATED COUNTER — counts up to value
   ============================================ */

interface AnimatedCounterProps {
  value: number
  decimals?: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  format?: 'number' | 'currency' | 'percent'
}

export function AnimatedCounter({
  value, decimals = 0, duration = 1.2, prefix = '', suffix = '', className, format = 'number',
}: AnimatedCounterProps) {
  const springValue = useSpring(0, { duration: duration * 1000, bounce: 0 })
  const display = useMotionValue('0')
  const [text, setText] = React.useState('0')

  React.useEffect(() => {
    springValue.set(value)
  }, [value, springValue])

  React.useEffect(() => {
    return springValue.on('change', (latest) => {
      let formatted: string
      if (format === 'currency') {
        formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(latest)
      } else if (format === 'percent') {
        formatted = `${latest.toFixed(decimals)}%`
      } else {
        formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(latest)
      }
      setText(formatted)
    })
  }, [springValue, format, decimals])

  return (
    <span className={cn('tabular', className)}>
      {prefix}{text}{suffix}
    </span>
  )
}

/* ============================================
   STATUS DOT — Live indicator
   ============================================ */

interface StatusDotProps {
  color?: 'green' | 'gold' | 'blue' | 'red' | 'gray'
  pulse?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export function StatusDot({ color = 'green', pulse = true, size = 'sm', label, className }: StatusDotProps) {
  const colors = {
    green: 'bg-[#00E676]',
    gold: 'bg-[#F5C542]',
    blue: 'bg-[#F5C542]',
    red: 'bg-[#FF5252]',
    gray: 'bg-[#1A1A1A]',
  }
  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('relative rounded-full', sizes[size], colors[color])}>
        {pulse && (
          <span className={cn('absolute inset-0 rounded-full animate-ping opacity-60', colors[color])} />
        )}
      </span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  )
}

/* ============================================
   PREMIUM BADGE
   ============================================ */

interface PremiumBadgeProps {
  variant?: 'bull' | 'bear' | 'neutral' | 'gold' | 'electric' | 'emerald' | 'danger' | 'info' | 'platinum'
  size?: 'xs' | 'sm' | 'md'
  glow?: boolean
  children: React.ReactNode
  className?: string
}

export function PremiumBadge({ variant = 'neutral', size = 'sm', glow = false, children, className }: PremiumBadgeProps) {
  const variants = {
    bull: 'bg-[rgba(0, 200, 83, 0.15)] text-[#00E676] border-[rgba(0, 200, 83, 0.3)]',
    bear: 'bg-[rgba(255, 82, 82, 0.15)] text-[#FF5252] border-[rgba(255, 82, 82, 0.3)]',
    neutral: 'bg-[rgba(245, 197, 66, 0.12)] text-[#FFC83D] border-[rgba(245, 197, 66, 0.25)]',
    gold: 'bg-[rgba(245, 197, 66, 0.12)] text-[#FFC83D] border-[rgba(245, 197, 66, 0.28)]',
    electric: 'bg-[rgba(245, 197, 66, 0.12)] text-[#FFC83D] border-[rgba(245, 197, 66, 0.28)]',
    emerald: 'bg-[rgba(0, 200, 83, 0.12)] text-[#00E676] border-[rgba(0, 200, 83, 0.28)]',
    danger: 'bg-[rgba(255, 82, 82, 0.15)] text-[#FF5252] border-[rgba(255, 82, 82, 0.3)] animate-pulse',
    info: 'bg-[rgba(245, 197, 66, 0.12)] text-[#FFC83D] border-[rgba(245, 197, 66, 0.28)]',
    platinum: 'bg-white/[8%] text-platinum border-white/20',
  }
  const sizes = {
    xs: 'text-[9px] px-1.5 py-0.5',
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-mono font-semibold tracking-wide uppercase',
        variants[variant],
        sizes[size],
        glow && (variant === 'gold' ? 'glow-gold' : variant === 'electric' ? 'glow-electric' : ''),
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ============================================
   PREMIUM PROGRESS BAR
   ============================================ */

interface PremiumProgressProps {
  value: number // 0-100
  color?: 'gold' | 'electric' | 'emerald' | 'bear' | 'neutral' | 'platinum'
  height?: number
  showLabel?: boolean
  label?: string
  animated?: boolean
  className?: string
}

export function PremiumProgress({ value, color = 'gold', height = 8, showLabel, label, animated = true, className }: PremiumProgressProps) {
  const colors = {
    gold: 'from-[#F5C542] to-[#FFC83D]',
    electric: 'from-[#1A1A1A] to-[#FFC83D]',
    emerald: 'from-[#00C853] to-[#00E676]',
    bear: 'from-[#CC3333] to-[#FF5252]',
    neutral: 'from-[#1A1A1A] to-[#FFC83D]',
    platinum: 'from-[#1A1A1A] to-[#FFFFFF]',
  }
  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">{label}</span>
          {showLabel && <span className="text-[11px] font-mono font-semibold tabular">{value.toFixed(0)}%</span>}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-white/[5%] relative"
        style={{ height }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn('h-full rounded-full bg-gradient-to-r relative overflow-hidden', colors[color])}
        >
          <div className="absolute inset-0 shimmer opacity-50" />
        </motion.div>
      </div>
    </div>
  )
}

/* ============================================
   SECTION HEADING
   ============================================ */

interface SectionHeadingProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  badge?: React.ReactNode
}

export function SectionHeading({ title, subtitle, icon, action, badge }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-3 mb-5">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="w-10 h-10 rounded-xl glass-gold flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl lg:text-2xl font-bold font-display tracking-tight text-gradient-platinum">{title}</h2>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/* ============================================
   SKELETON LOADER — Premium shimmer
   ============================================ */

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rect' | 'circle'
}

export function Skeleton({ className, variant = 'rect' }: SkeletonProps) {
  const base = 'relative overflow-hidden rounded-lg bg-white/[4%]'
  const variants = {
    text: 'h-3',
    rect: 'h-20',
    circle: 'rounded-full',
  }
  return (
    <div className={cn(base, variants[variant], className)}>
      <div className="absolute inset-0 shimmer" />
    </div>
  )
}

/* ============================================
   STAT CARD — Premium KPI display
   ============================================ */

interface StatCardProps {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  delay?: number
  accent?: 'gold' | 'electric' | 'emerald' | 'neutral'
}

export function StatCard({ label, value, sub, icon, trend = 'neutral', delay = 0, accent = 'neutral' }: StatCardProps) {
  const trendColor = trend === 'up'
    ? 'text-[#00E676]'
    : trend === 'down'
    ? 'text-[#FF5252]'
    : 'text-foreground'

  const accents = {
    gold: 'glow-gold',
    electric: 'glow-electric',
    emerald: 'glow-emerald',
    neutral: '',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <LiquidGlassCard hover className={cn('p-5 h-full', accents[accent])}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">{label}</span>
          {icon && (
            <div className="w-8 h-8 rounded-lg glass flex items-center justify-center text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
        <div className={cn('text-2xl lg:text-3xl font-mono font-bold tabular leading-none', trendColor)}>
          {value}
        </div>
        {sub && <div className="text-[11px] text-muted-foreground mt-2">{sub}</div>}
      </LiquidGlassCard>
    </motion.div>
  )
}

/* ============================================
   TILTABLE CARD — Apple Vision Pro style 3D tilt
   ============================================ */

interface TiltableCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

export function TiltableCard({ children, className, intensity = 8 }: TiltableCardProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-50, 50], [intensity, -intensity]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-50, 50], [-intensity, intensity]), { stiffness: 200, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set(e.clientX - rect.left - rect.width / 2)
    y.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={cn('relative', className)}
    >
      {children}
    </motion.div>
  )
}

/* ============================================
   PREMIUM TOOLTIP — glass with glow
   ============================================ */

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [show, setShow] = React.useState(false)
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9, y: side === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: side === 'top' ? 4 : -4 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'absolute z-50 px-2.5 py-1.5 rounded-lg glass-strong text-[11px] text-foreground whitespace-nowrap pointer-events-none',
              side === 'top' && 'bottom-full mb-2 left-1/2 -translate-x-1/2',
              side === 'bottom' && 'top-full mt-2 left-1/2 -translate-x-1/2',
              side === 'left' && 'right-full mr-2 top-1/2 -translate-y-1/2',
              side === 'right' && 'left-full ml-2 top-1/2 -translate-y-1/2',
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

/* ============================================
   DIVIDER — Premium with optional label
   ============================================ */

// Backward-compatibility aliases — old sections still use these names
export const StatusBadge = PremiumBadge
export const GlassCard = LiquidGlassCard
export const ProgressBar = PremiumProgress

export function Divider({ label, className }: { label?: string; className?: string }) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3 my-4', className)}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{label}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    )
  }
  return <div className={cn('h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4', className)} />
}
