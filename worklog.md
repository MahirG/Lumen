---
Task ID: hero-bg-redesign-1
Agent: main
Task: Redesign Hero Section with premium layered background image

Work Log:
- Analyzed uploaded image `/home/z/my-project/upload/mahir_apexeapro_bg-1.png` via VLM
  - Confirmed: professional businessman, deep blue gradient bg, grid pattern, financial chart
  - 1400x1400 PNG, perfect for fintech/AI hero background
- Copied image to `/home/z/my-project/public/hero-bg.png` for static serving
- Added 3 new CSS classes to `src/app/globals.css`:
  - `.hero-bg-image` — Layer 1: background image, cover sizing, GPU-accelerated, fade-in animation
  - `.hero-bg-overlay` — Layer 2: theme-aware gradient overlay (dark: 50-70% navy, light: 20-40% white)
  - `.hero-bg-tint` — Layer 2b: subtle brand color tint (electric blue + emerald) with blend modes
  - Responsive positioning: focal point shifted right on desktop (behind globe), zoomed on mobile
  - `prefers-reduced-motion` support — disables parallax/animation
- Redesigned `HeroSection` in `src/components/hisab/sections/landing.tsx`:
  - Layer 1 (z-0): Background image with desktop-only parallax (y + scale on scroll)
  - Layer 2 (z-[1]): Theme-aware overlay + brand tint
  - Layer 3 (z-[2]): All existing animations preserved (ParticleField, FinancialGlobe, MobileMarketFlow, gradient, grid bg)
  - Layer 4 (z-10): Hero content unchanged — heading, subheading, CTAs, trust indicators
  - Added `isDesktop` media query check to disable parallax on mobile for performance
  - Increased text contrast: subheadline `/70` → `/80` + `drop-shadow-sm`, trust indicators `/60` → `/75`
- Verified dev server: page returns 200, image serves correctly (1.2MB), all hero-bg classes present in HTML, no compile errors

Stage Summary:
- Hero section now has a premium 4-layer architecture: image → overlay → animations → content
- All existing animations remain fully functional above the background image
- Theme-aware overlays ensure perfect text contrast in both dark and light modes
- Subtle parallax on desktop only (mobile disabled for performance)
- Image focal point (person) positioned right on desktop so it sits behind the FinancialGlobe and doesn't fight with left-aligned hero text
- Responsive: full image on desktop, repositioned crop on tablet, zoomed crop on mobile
- GPU-accelerated transforms with `will-change: transform` and `translateZ(0)` for smooth rendering
- Respects `prefers-reduced-motion` for accessibility

Visual Verification (via VLM):
- Dark mode desktop: 9/10 — "Effectively balances visual appeal with clarity"
- Light mode desktop: 8/10 — "Background image visible, text highly readable"
- Mobile dark mode: 8/10 — "Clean single-column layout, sophisticated"

---
Task ID: header-remove-gold-ticker-1
Agent: main
Task: Remove the Gold / XAUUSD value live update from sticky header

Work Log:
- Located the live Gold price ticker in `src/components/hisab/header.tsx` (lines 149-177)
  - It was the prominent gold pill with Crown icon, $price, and change% that flashed green/red on every market store tick (~1.2s)
- Removed the entire `<AnimatePresence>` block containing the Gold price ticker
- Cleaned up now-unused imports and state to prevent dead code:
  - Removed `motion`, `AnimatePresence` from framer-motion imports
  - Removed `Crown` from lucide-react imports
  - Removed `formatNumber` import (only used by the gold ticker)
  - Removed `price` selector from `useMarketStore` (kept `dataSource` + `lastRealUpdate` for live status badge)
  - Removed `prevPriceRef` and `flash` state and the price-flash effect
- Preserved everything else in the sticky header:
  - Scrolling ticker tape (top marquee) — unchanged
  - Live status badge (LIVE/CACHED/DEMO with seconds-ago counter) — unchanged
  - AI Engine indicator — unchanged
- Verified dev server: page returns 200, compiles cleanly, no errors in dev.log

Stage Summary:
- The Gold / XAUUSD live price pill has been removed from the sticky header
- The sticky header is now cleaner: title + live data-source badge + AI indicator
- No re-render storms: the header no longer subscribes to `price.last`, only to `dataSource` and `lastRealUpdate` (which only change on real fetch events, not micro-ticks)
- Gold/XAUUSD still appears in the scrolling ticker tape (alongside 11 other symbols) — that is a separate ambient marquee, not a "live value update" flasher
