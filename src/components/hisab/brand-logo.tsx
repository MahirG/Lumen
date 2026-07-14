'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface BrandLogoProps {
  height?: number
  className?: string
  style?: React.CSSProperties
  alt?: string
  /** When true, shows only the mark (letter A icon) without the wordmark/tagline */
  markOnly?: boolean
}

/**
 * BrandLogo — theme-aware ApexEAPro logo.
 *
 * Full logo:
 *   - Light mode → apexeapro_logo_horizontal_light_transparent.png (dark text)
 *   - Dark mode  → apexeapro_logo_horizontal_dark_transparent.png (light text)
 *
 * Mark only (letter A icon):
 *   - Uses apexeapro_mark_transparent.png (gold gradient, works on both themes)
 *
 * Both variants are transparent PNGs, so they blend perfectly with the
 * surrounding background.
 */
export function BrandLogo({
  height = 32,
  className = '',
  style,
  alt = 'ApexEAPro',
  markOnly = false,
}: BrandLogoProps) {
  const { theme } = useTheme()
  const [isDark, setIsDark] = useState(true) // default to dark (matches SSR)

  useEffect(() => {
    // Check the actual DOM state — the html element has class 'dark' in dark mode
    const checkDark = () => {
      const html = document.documentElement
      setIsDark(html.classList.contains('dark'))
    }
    checkDark()

    // Watch for class changes on <html> (next-themes toggles .dark class)
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [theme])

  // Mark-only uses the gold gradient mark (works on both light & dark)
  // Full logo uses theme-aware variant
  const logoSrc = markOnly
    ? '/brand/png/apexeapro_mark_transparent.png'
    : isDark
      ? '/brand/png/apexeapro_logo_horizontal_dark_transparent.png'
      : '/brand/png/apexeapro_logo_horizontal_light_transparent.png'

  return (
    <img
      src={logoSrc}
      alt={alt}
      height={height}
      className={className}
      style={{
        height: `${height}px`,
        width: 'auto',
        ...style,
      }}
    />
  )
}
