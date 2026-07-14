'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface BrandLogoProps {
  height?: number
  className?: string
  style?: React.CSSProperties
  alt?: string
}

/**
 * BrandLogo — theme-aware ApexEAPro logo.
 *
 * Uses the LIGHT logo variant (dark text) when the site is in light mode,
 * and the DARK logo variant (light text) when in dark mode.
 *
 * Both variants are transparent PNGs, so they blend perfectly with the
 * surrounding background.
 */
export function BrandLogo({
  height = 32,
  className = '',
  style,
  alt = 'ApexEAPro',
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

  const logoSrc = isDark
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
