'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Check,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandLogo } from './brand-logo'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type Mode = 'signin' | 'signup'
type SocialProvider = 'google' | 'apple' | 'microsoft'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = React.useState<Mode>('signin')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [remember, setRemember] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [socialLoading, setSocialLoading] = React.useState<SocialProvider | null>(null)
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape to close
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Reset on close
  React.useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setEmail('')
        setPassword('')
        setShowPassword(false)
        setErrors({})
        setLoading(false)
        setSocialLoading(null)
        setMode('signin')
      }, 300)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  const validate = () => {
    const e: { email?: string; password?: string } = {}
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Minimum 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Simulated auth — wire to OAuth/backend later
    await new Promise(r => setTimeout(r, 1400))
    setLoading(false)
    onClose()
  }

  const handleSocial = async (provider: SocialProvider) => {
    setSocialLoading(provider)
    // Simulated OAuth — wire to real OAuth later
    await new Promise(r => setTimeout(r, 1400))
    setSocialLoading(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(12px) saturate(120%)',
              WebkitBackdropFilter: 'blur(12px) saturate(120%)',
            }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl"
            style={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255,255,255,0.04)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.7 }}
          >
            {/* Subtle top accent line */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-24 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, #F5C542, #F5C542, transparent)' }}
            />

            {/* Close button — icon only, no container */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C542] rounded-lg"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>

            <div className="px-7 sm:px-9 pt-10 pb-8">
              {/* Brand mark */}
              <div className="flex items-center gap-2.5 mb-7">
                <BrandLogo
                  height={26}
                  className="h-[24px] w-auto"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(245, 197, 66, 0.2))' }}
                />
              </div>

              {/* Title + subtitle */}
              <h2
                id="auth-title"
                className="text-2xl sm:text-[28px] font-bold tracking-tight text-foreground mb-1.5"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
              >
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
                {mode === 'signin'
                  ? 'Sign in to access your institutional trading intelligence.'
                  : 'Join thousands of professional traders using AI-driven market intelligence.'}
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Email */}
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-medium text-foreground/70 mb-1.5 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground pointer-events-none" strokeWidth={2} />
                    <input
                      id="auth-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })) }}
                      placeholder="you@example.com"
                      className={cn(
                        'w-full h-12 pl-11 pr-4 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60',
                        'transition-all duration-200 outline-none',
                        'focus:ring-2 focus:ring-[#F5C542]/40',
                        errors.email ? 'border-[#FF5252]/60' : 'border-border',
                      )}
                      style={{
                        background: 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'auth-email-error' : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="auth-email-error" className="text-xs text-[#FF5252] mt-1.5 ml-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="auth-password" className="block text-xs font-medium text-foreground/70 mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground pointer-events-none" strokeWidth={2} />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })) }}
                      placeholder={mode === 'signin' ? 'Enter your password' : 'Create a password (min 6 chars)'}
                      className={cn(
                        'w-full h-12 pl-11 pr-12 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60',
                        'transition-all duration-200 outline-none',
                        'focus:ring-2 focus:ring-[#F5C542]/40',
                        errors.password ? 'border-[#FF5252]/60' : 'border-border',
                      )}
                      style={{
                        background: 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? 'auth-password-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-md"
                    >
                      {showPassword ? <EyeOff className="w-[17px] h-[17px]" strokeWidth={2} /> : <Eye className="w-[17px] h-[17px]" strokeWidth={2} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="auth-password-error" className="text-xs text-[#FF5252] mt-1.5 ml-1">{errors.password}</p>
                  )}
                </div>

                {/* Remember + Forgot (signin only) */}
                {mode === 'signin' && (
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setRemember(r => !r)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span
                        className={cn(
                          'w-[18px] h-[18px] rounded-[6px] flex items-center justify-center transition-all duration-200',
                          remember ? 'bg-[#F5C542] border-[#F5C542]' : 'border border-border bg-transparent',
                        )}
                        style={{ background: remember ? '#F5C542' : 'transparent' }}
                      >
                        {remember && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </span>
                      <span className="text-foreground/70">Remember me</span>
                    </button>
                    <button
                      type="button"
                      className="text-[#F5C542] hover:text-[#FFC83D] transition-colors font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white',
                    'transition-shadow duration-300',
                    loading && 'opacity-80',
                  )}
                  style={{
                    background: 'linear-gradient(135deg, #F5C542, #F5C542)',
                    boxShadow: '0 8px 24px rgba(245, 197, 66, 0.32)',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-[18px] h-[18px] animate-spin" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">or continue with</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              {/* Social login */}
              <div className="space-y-2.5">
                <SocialButton
                  provider="google"
                  label="Continue with Google"
                  loading={socialLoading === 'google'}
                  disabled={!!socialLoading || loading}
                  onClick={() => handleSocial('google')}
                />
                <SocialButton
                  provider="apple"
                  label="Continue with Apple"
                  loading={socialLoading === 'apple'}
                  disabled={!!socialLoading || loading}
                  onClick={() => handleSocial('apple')}
                />
                <SocialButton
                  provider="microsoft"
                  label="Continue with Microsoft"
                  loading={socialLoading === 'microsoft'}
                  disabled={!!socialLoading || loading}
                  onClick={() => handleSocial('microsoft')}
                />
              </div>

              {/* Switch mode */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setErrors({}) }}
                  className="text-[#F5C542] hover:text-[#FFC83D] font-semibold transition-colors"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>

              {/* Terms */}
              <p className="text-center text-[11px] text-muted-foreground/80 mt-5 leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="#" className="text-foreground/70 hover:text-foreground underline underline-offset-2">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-foreground/70 hover:text-foreground underline underline-offset-2">Privacy Policy</a>.
              </p>

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-1.5 mt-5 text-[10px] text-muted-foreground/70">
                <Shield className="w-3 h-3" strokeWidth={2} />
                <span>Bank-grade encryption · SOC 2 compliant</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ============================================
   SocialButton — branded OAuth buttons
   ============================================ */

function SocialButton({
  provider,
  label,
  loading,
  disabled,
  onClick,
}: {
  provider: SocialProvider
  label: string
  loading: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        'w-full h-11 rounded-xl flex items-center justify-center gap-3 text-sm font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        color: 'var(--foreground)',
      }}
      aria-label={label}
    >
      {loading ? (
        <Loader2 className="w-[18px] h-[18px] animate-spin text-muted-foreground" />
      ) : (
        <ProviderIcon provider={provider} />
      )}
      <span className="text-foreground/85">{label}</span>
    </motion.button>
  )
}

/* ============================================
   ProviderIcon — official brand icons
   ============================================ */

function ProviderIcon({ provider }: { provider: SocialProvider }) {
  if (provider === 'google') {
    // Official Google "G" — multi-color, works on both light & dark
    return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    )
  }
  if (provider === 'apple') {
    return (
      <svg
        className="w-[18px] h-[18px]"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ color: 'var(--foreground)' }}
        aria-hidden="true"
      >
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    )
  }
  // microsoft
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
      <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
      <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
    </svg>
  )
}
