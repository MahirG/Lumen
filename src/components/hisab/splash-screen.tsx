'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BrandLogo } from './brand-logo'

/**
 * SplashScreen — shows the ApexEAPro brand logo centered with a fade-in.
 *
 * Behavior:
 * - FIRST VISIT (no localStorage 'apex_splash_seen'): shows full logo with tagline
 * - SUBSEQUENT VISITS: shows only the mark (letter A icon)
 * - Background matches current theme (dark #0B0F19 or light #FFFFFF)
 * - Auto-dismisses after 1.8s
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Check if this is the first visit
    try {
      const seen = localStorage.getItem('apex_splash_seen')
      setIsFirstVisit(!seen)
      // Mark as seen for next visit
      localStorage.setItem('apex_splash_seen', '1')
    } catch {
      // localStorage might not be available
    }

    // Check current theme
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDark()

    // Hide after 1.8s
    const timer = setTimeout(() => setVisible(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  const bgColor = isDark ? '#0B0F19' : '#FFFFFF'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: bgColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {isFirstVisit ? (
              /* First visit: full logo with tagline */
              <BrandLogo
                height={72}
                className="h-[56px] sm:h-[72px] w-auto"
                style={{
                  filter: 'drop-shadow(0 4px 24px rgba(245, 197, 66, 0.3))',
                }}
              />
            ) : (
              /* Returning visit: mark only (letter A icon) */
              <BrandLogo
                markOnly
                height={72}
                className="h-[56px] sm:h-[72px] w-auto"
                style={{
                  filter: 'drop-shadow(0 4px 24px rgba(245, 197, 66, 0.3))',
                }}
              />
            )}
          </motion.div>

          {/* Subtle pulse glow behind logo */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(245, 197, 66, 0.12), transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
