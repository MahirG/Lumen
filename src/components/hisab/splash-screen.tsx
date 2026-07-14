'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * SplashScreen — shows the ApexEAPro brand logo centered on the dark app
 * background with a subtle fade-in + fade-out animation.
 *
 * Uses apexeapro_logo_horizontal_dark_transparent.png because the surrounding
 * area is the app's dark background (#0B0F19).
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Hide after 1.8s (enough for fade-in + brief hold + fade-out start)
    const timer = setTimeout(() => setVisible(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: '#0B0F19' }}
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
            <img
              src="/brand/png/apexeapro_logo_horizontal_dark_transparent.png"
              alt="ApexEAPro"
              height={44}
              className="h-[36px] sm:h-[44px] w-auto"
              style={{
                filter: 'drop-shadow(0 4px 24px rgba(245, 197, 66, 0.3))',
              }}
            />
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
