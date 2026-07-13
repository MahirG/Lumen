'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar, NAV_ITEMS } from '@/components/hisab/sidebar'
import { Header } from '@/components/hisab/header'
import { Footer } from '@/components/hisab/footer'
import { Landing } from '@/components/hisab/sections/landing'
import { LiveDashboard } from '@/components/hisab/sections/live-dashboard'
import { ChartAnalysis } from '@/components/hisab/sections/chart-analysis'
import { DecisionEngine } from '@/components/hisab/sections/decision-engine'
import { MultiTimeframe } from '@/components/hisab/sections/mtf'
import { SessionDetector } from '@/components/hisab/sections/sessions'
import { NewsFilter } from '@/components/hisab/sections/news'
import { GoldStrengthMeter } from '@/components/hisab/sections/gold-strength'
import { RiskManager } from '@/components/hisab/sections/risk-manager'
import { TradeJournal } from '@/components/hisab/sections/journal'
import { SmartAlerts } from '@/components/hisab/sections/alerts'
import { AICoach } from '@/components/hisab/sections/coach'
import { useMarketStore } from '@/lib/hisab/market-store'
import { useRealtimeService } from '@/lib/hisab/use-realtime'

const SECTION_META: Record<string, { title: string; subtitle: string }> = {
  home: { title: 'Apex EA Pro', subtitle: 'AI-Powered Forex & Gold Trading Intelligence' },
  dashboard: { title: 'Live Dashboard', subtitle: 'Real-time XAUUSD market intelligence' },
  'chart-analysis': { title: 'Chart Analysis', subtitle: 'SMC detection & AI Vision for XAUUSD' },
  'decision-engine': { title: 'AI Decision Engine', subtitle: 'Probability-based trade setups' },
  mtf: { title: 'Multi-Timeframe Analysis', subtitle: '8-timeframe bias alignment matrix' },
  sessions: { title: 'Session Detector', subtitle: 'Trading sessions & ICT kill zones' },
  news: { title: 'Economic News Filter', subtitle: 'High-impact news monitoring' },
  'gold-strength': { title: 'Gold Strength Meter', subtitle: 'Macro drivers of XAUUSD' },
  risk: { title: 'AI Risk Manager', subtitle: 'Position sizing & R:R calculator' },
  journal: { title: 'Trade Journal', subtitle: 'Log, analyze, and improve your trading' },
  alerts: { title: 'Smart Alerts', subtitle: 'Real-time SMC event notifications' },
  coach: { title: 'AI Coach', subtitle: 'Mentor-style trade explanations' },
}

export default function Home() {
  const [activeSection, setActiveSection] = React.useState('home')
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const init = useMarketStore(s => s.init)
  const fetchRealPrice = useMarketStore(s => s.fetchRealPrice)
  const microTick = useMarketStore(s => s.microTick)
  const refreshSession = useMarketStore(s => s.refreshSession)
  useRealtimeService()

  // Initialize market data on mount
  React.useEffect(() => { init() }, [init])

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

  // Scroll to top on section change
  const mainRef = React.useRef<HTMLElement>(null)
  React.useEffect(() => {
    if (mainRef.current && activeSection !== 'home') {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [activeSection])

  const meta = SECTION_META[activeSection] ?? { title: 'Apex EA Pro', subtitle: '' }
  const isLanding = activeSection === 'home'

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        active={activeSection}
        onSelect={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {!isLanding && (
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            title={meta.title}
            subtitle={meta.subtitle}
          />
        )}

        <main ref={mainRef} className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: isLanding ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isLanding ? 0 : -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {isLanding ? (
                <Landing onNavigate={setActiveSection} />
              ) : (
                <div className="p-4 lg:p-6 grid-bg">
                  {activeSection === 'dashboard' && <LiveDashboard />}
                  {activeSection === 'chart-analysis' && <ChartAnalysis />}
                  {activeSection === 'decision-engine' && <DecisionEngine />}
                  {activeSection === 'mtf' && <MultiTimeframe />}
                  {activeSection === 'sessions' && <SessionDetector />}
                  {activeSection === 'news' && <NewsFilter />}
                  {activeSection === 'gold-strength' && <GoldStrengthMeter />}
                  {activeSection === 'risk' && <RiskManager />}
                  {activeSection === 'journal' && <TradeJournal />}
                  {activeSection === 'alerts' && <SmartAlerts />}
                  {activeSection === 'coach' && <AICoach />}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer onNavigate={setActiveSection} />
      </div>
    </div>
  )
}
