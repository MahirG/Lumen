'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gold' | 'strong'
  hover?: boolean
  children: React.ReactNode
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const base = 'rounded-xl border transition-all duration-300'
    const variants = {
      default: 'glass border-border/50',
      gold: 'glass-gold',
      strong: 'glass-strong border-border/50',
    }
    return (
      <div
        ref={ref}
        className={cn(base, variants[variant], hover && 'hover:border-[oklch(0.82_0.15_85/30%)] hover:shadow-[0_0_24px_oklch(0.82_0.15_85/8%)]', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = 'GlassCard'

interface StatCardProps {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  delay?: number
}

export function StatCard({ label, value, sub, icon, trend = 'neutral', delay = 0 }: StatCardProps) {
  const trendColor = trend === 'up'
    ? 'text-[oklch(0.72_0.18_145)]'
    : trend === 'down'
    ? 'text-[oklch(0.66_0.22_25)]'
    : 'text-foreground'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <GlassCard className="p-4" hover>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </span>
          {icon && <span className="text-muted-foreground/70">{icon}</span>}
        </div>
        <div className={cn('text-xl lg:text-2xl font-semibold font-mono tabular-nums', trendColor)}>
          {value}
        </div>
        {sub && (
          <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
        )}
      </GlassCard>
    </motion.div>
  )
}

interface SectionHeadingProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function SectionHeading({ title, subtitle, icon, action }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="w-9 h-9 rounded-lg glass-gold flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-lg lg:text-xl font-semibold font-display tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

interface BadgeProps {
  variant?: 'bull' | 'bear' | 'neutral' | 'gold' | 'danger' | 'info'
  children: React.ReactNode
  className?: string
}

export function StatusBadge({ variant = 'neutral', children, className }: BadgeProps) {
  const variants = {
    bull: 'bg-[oklch(0.72_0.18_145/15%)] text-[oklch(0.85_0.15_145)] border-[oklch(0.72_0.18_145/30%)]',
    bear: 'bg-[oklch(0.66_0.22_25/15%)] text-[oklch(0.85_0.15_25)] border-[oklch(0.66_0.22_25/30%)]',
    neutral: 'bg-[oklch(0.75_0.02_60/15%)] text-[oklch(0.85_0.02_60)] border-[oklch(0.75_0.02_60/30%)]',
    gold: 'bg-[oklch(0.78_0.16_85/15%)] text-[oklch(0.92_0.14_85)] border-[oklch(0.82_0.15_85/30%)]',
    danger: 'bg-[oklch(0.66_0.22_25/15%)] text-[oklch(0.85_0.15_25)] border-[oklch(0.66_0.22_25/30%)] animate-pulse',
    info: 'bg-[oklch(0.7_0.13_230/15%)] text-[oklch(0.85_0.13_230)] border-[oklch(0.7_0.13_230/30%)]',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-mono font-medium tracking-wide',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

interface ProgressBarProps {
  value: number // 0-100
  color?: 'gold' | 'bull' | 'bear' | 'neutral'
  height?: number
  showLabel?: boolean
  label?: string
}

export function ProgressBar({ value, color = 'gold', height = 8, showLabel, label }: ProgressBarProps) {
  const colors = {
    gold: 'from-[oklch(0.78_0.16_85)] to-[oklch(0.92_0.14_85)]',
    bull: 'from-[oklch(0.65_0.2_145)] to-[oklch(0.85_0.18_145)]',
    bear: 'from-[oklch(0.55_0.25_25)] to-[oklch(0.75_0.22_25)]',
    neutral: 'from-[oklch(0.65_0.05_60)] to-[oklch(0.85_0.05_60)]',
  }
  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</span>
          {showLabel && (
            <span className="text-[11px] font-mono font-medium tabular-nums">{value.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-white/5"
        style={{ height }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn('h-full rounded-full bg-gradient-to-r', colors[color])}
        />
      </div>
    </div>
  )
}
