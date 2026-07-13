'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar, NAV_ITEMS } from '@/components/hisab/sidebar'
import { Header } from '@/components/hisab/header'
import { Footer } from '@/components/hisab/footer'
import { FloatingNav } from '@/components/hisab/floating-nav'
import { FloatingAIBot } from '@/components/hisab/floating-bot'
import { Landing } from '@/components/hisab/sections/landing'
import { LiveDashboard } from '@/components/hisab/sections/live-dashboard'
import { ChartAnalysis } from '@/components/hisab/sections/chart-analysis'
import { DecisionEngine } from '@/components/hisab/sections/decision-engine'
import { AILEEngine } from '@/components/hisab/sections/aile-engine'
import { MultiTimeframe } from '@/components/hisab/sections/mtf'
import { SessionDetector } from '@/components/hisab/sections/sessions'
import { NewsFilter } from '@/components/hisab/sections/news'
import { GoldStrengthMeter } from '@/components/hisab/sections/gold-strength'
import { RiskManager } from '@/components/hisab/sections/risk-manager'
import { TradeJournal } from '@/components/hisab/sections/journal'
import { SmartAlerts } from '@/components/hisab/sections/alerts'
import { ASNEEngine } from '@/components/hisab/sections/asne'
import { AICoach } from '@/components/hisab/sections/coach'
import { SEOPage } from '@/components/seo/seo-page'
import { SEO_PAGES } from '@/lib/seo/seo-content'
import { useMarketStore } from '@/lib/hisab/market-store'
import { useASNEStore } from '@/lib/hisab/asne-store'
import { useRealtimeService } from '@/lib/hisab/use-realtime'

const SECTION_META: Record<string, { title: string; subtitle: string }> = {
  home: { title: 'Apex EA Pro', subtitle: 'AI-Powered Forex & Gold Trading Intelligence' },
  dashboard: { title: 'Live Dashboard', subtitle: 'Real-time XAUUSD market intelligence' },
  'chart-analysis': { title: 'Chart Analysis', subtitle: 'SMC detection & AI Vision for XAUUSD' },
  'decision-engine': { title: 'AI Decision Engine', subtitle: 'Probability-based trade setups' },
  aile: { title: 'AILE Engine v1.0', subtitle: 'Apex Institutional Liquidity Engine — 12-phase analysis' },
  mtf: { title: 'Multi-Timeframe Analysis', subtitle: '8-timeframe bias alignment matrix' },
  sessions: { title: 'Session Detector', subtitle: 'Trading sessions & ICT kill zones' },
  news: { title: 'Economic News Filter', subtitle: 'High-impact news monitoring' },
  'gold-strength': { title: 'Gold Strength Meter', subtitle: 'Macro drivers of XAUUSD' },
  risk: { title: 'AI Risk Manager', subtitle: 'Position sizing & R:R calculator' },
  journal: { title: 'Trade Journal', subtitle: 'Log, analyze, and improve your trading' },
  alerts: { title: 'Smart Alerts', subtitle: 'Real-time SMC event notifications' },
  asne: { title: 'ASNE Engine v1.0', subtitle: 'AI Smart Notification Engine — institutional alert system' },
  coach: { title: 'AI Coach', subtitle: 'Mentor-style trade explanations' },
}

export default function Home() {
  // Read initial section from URL hash on mount (for refresh persistence)
  const [activeSection, setActiveSection] = React.useState('home')
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [seoPage, setSeoPage] = React.useState<string | null>(null)
  const init = useMarketStore(s => s.init)
  const fetchRealPrice = useMarketStore(s => s.fetchRealPrice)
  const microTick = useMarketStore(s => s.microTick)
  const refreshSession = useMarketStore(s => s.refreshSession)
  const asneInit = useASNEStore(s => s.init)
  const asneGenerate = useASNEStore(s => s.generateFromMarket)
  useRealtimeService()

  // Handle routing from URL — restore section on refresh, handle SEO pages
  React.useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '')
      const hash = window.location.hash.replace(/^#/, '')

      // Check if it's an SEO page (path-based)
      if (path && SEO_PAGES[path]) {
        setSeoPage(path)
        const page = SEO_PAGES[path]
        document.title = page.seoTitle
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc) metaDesc.setAttribute('content', page.metaDescription)
        if (page.faqs.length > 0) {
          const faqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: page.faqs.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }
          let scriptTag = document.getElementById('seo-faq-schema')
          if (!scriptTag) {
            scriptTag = document.createElement('script')
            scriptTag.id = 'seo-faq-schema'
            scriptTag.type = 'application/ld+json'
            document.head.appendChild(scriptTag)
          }
          scriptTag.textContent = JSON.stringify(faqSchema)
        }
        return
      }

      // Not an SEO page — check hash for section (refresh persistence)
      setSeoPage(null)
      document.title = 'AI Trading Platform for Professional Traders | ApexEAPro'
      const faqSchema = document.getElementById('seo-faq-schema')
      if (faqSchema) faqSchema.remove()

      if (hash) {
        // Restore section from hash
        setActiveSection(hash)
      }
    }
    checkRoute()
    window.addEventListener('popstate', checkRoute)
    window.addEventListener('hashchange', checkRoute)
    return () => {
      window.removeEventListener('popstate', checkRoute)
      window.removeEventListener('hashchange', checkRoute)
    }
  }, [])

  // Navigate to section or SEO page (updates URL)
  const navigateToSection = React.useCallback((section: string) => {
    // Check if it's an SEO page
    if (SEO_PAGES[section]) {
      window.history.pushState({}, '', `/${section}`)
      setSeoPage(section)
      setActiveSection('home')
      window.scrollTo(0, 0)
      const page = SEO_PAGES[section]
      document.title = page.seoTitle
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) metaDesc.setAttribute('content', page.metaDescription)
      return
    }
    // Regular section navigation — update hash for refresh persistence
    if (seoPage) {
      window.history.pushState({}, '', '/')
      setSeoPage(null)
      document.title = 'AI Trading Platform for Professional Traders | ApexEAPro'
      const faqSchema = document.getElementById('seo-faq-schema')
      if (faqSchema) faqSchema.remove()
    }
    setActiveSection(section)
    // Update URL hash so refresh stays on the same section
    if (section === 'home') {
      window.history.pushState({}, '', '/')
    } else {
      window.history.pushState({}, '', `/#${section}`)
    }
    window.scrollTo(0, 0)
  }, [seoPage])

  // Initialize market data on mount
  React.useEffect(() => {
    init()
    asneInit()
  }, [init, asneInit])

  // Fetch REAL price every 20 seconds
  React.useEffect(() => {
    const interval = setInterval(() => { fetchRealPrice() }, 20000)
    return () => clearInterval(interval)
  }, [fetchRealPrice])

  // Micro-tick every 1.2s
  React.useEffect(() => {
    const interval = setInterval(() => { microTick() }, 1200)
    return () => clearInterval(interval)
  }, [microTick])

  // Refresh session every 30s
  React.useEffect(() => {
    const interval = setInterval(refreshSession, 30000)
    return () => clearInterval(interval)
  }, [refreshSession])

  // ASNE: generate notifications every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => { asneGenerate() }, 30000)
    return () => clearInterval(interval)
  }, [asneGenerate])

  // Scroll to top on section change
  const mainRef = React.useRef<HTMLElement>(null)
  React.useEffect(() => {
    if (mainRef.current && activeSection !== 'home') {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [activeSection])

  const meta = SECTION_META[activeSection] ?? { title: 'Apex EA Pro', subtitle: '' }
  const isLanding = activeSection === 'home' && !seoPage
  const isSeoPage = seoPage !== null

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        active={activeSection}
        onSelect={navigateToSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {!isLanding && !isSeoPage && (
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            title={meta.title}
            subtitle={meta.subtitle}
          />
        )}

        <main ref={mainRef} className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={seoPage ?? activeSection}
              initial={{ opacity: 0, y: isLanding || isSeoPage ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isLanding || isSeoPage ? 0 : -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {isSeoPage && SEO_PAGES[seoPage!] ? (
                <SEOPage data={SEO_PAGES[seoPage!]} onNavigate={navigateToSection} />
              ) : isLanding ? (
                <Landing onNavigate={navigateToSection} />
              ) : (
                <div className="p-4 lg:p-6 grid-bg">
                  {activeSection === 'dashboard' && <LiveDashboard />}
                  {activeSection === 'chart-analysis' && <ChartAnalysis />}
                  {activeSection === 'decision-engine' && <DecisionEngine />}
                  {activeSection === 'aile' && <AILEEngine />}
                  {activeSection === 'mtf' && <MultiTimeframe />}
                  {activeSection === 'sessions' && <SessionDetector />}
                  {activeSection === 'news' && <NewsFilter />}
                  {activeSection === 'gold-strength' && <GoldStrengthMeter />}
                  {activeSection === 'risk' && <RiskManager />}
                  {activeSection === 'journal' && <TradeJournal />}
                  {activeSection === 'alerts' && <SmartAlerts />}
                  {activeSection === 'asne' && <ASNEEngine onNavigate={navigateToSection} />}
                  {activeSection === 'coach' && <AICoach />}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer onNavigate={navigateToSection} />
      </div>

      {/* Floating hamburger menu button — top-RIGHT (opposite AI bot bottom-right).
          Premium 2-line + short style. Opens drawer from the right. */}
      {(isLanding || isSeoPage) && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex flex-col items-center justify-center gap-[4px] hover:scale-105 active:scale-95 transition-transform"
          style={{
            background: 'rgba(18, 18, 20, 0.72)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          aria-label="Open navigation menu"
        >
          <div className="w-[18px] h-[2px] rounded-full bg-foreground" />
          <div className="w-[18px] h-[2px] rounded-full bg-foreground" />
          <div className="w-[12px] h-[2px] rounded-full bg-foreground self-center mr-[3px]" style={{ alignSelf: 'flex-start', marginLeft: '7px' }} />
        </button>
      )}

      {/* Floating bottom nav — appears on ALL pages, 4 buttons */}
      <FloatingNav active={activeSection} onNavigate={navigateToSection} />

      {/* Floating AI Bot — appears on ALL pages */}
      <FloatingAIBot onNavigate={navigateToSection} />

      {/* Scroll to top button — opposite side of AI bot (bottom-LEFT) */}
      <ScrollToTopButton />
    </div>
  )
}

/**
 * ScrollToTopButton — floating button on the bottom-LEFT (opposite AI bot).
 * Appears after scrolling down 400px. Smooth scroll to top on click.
 */
function ScrollToTopButton() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-24 left-4 lg:bottom-6 lg:left-6 z-40 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(18, 18, 20, 0.8)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.3)',
          }}
          aria-label="Scroll to top"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
            <path d="M9 14V4" />
            <path d="M4 9L9 4L14 9" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
