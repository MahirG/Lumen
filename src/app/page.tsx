'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar, NAV_ITEMS } from '@/components/hisab/sidebar'
import { Header } from '@/components/hisab/header'
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
  dashboard: { title: 'Live Dashboard', subtitle: 'Real-time XAUUSD market overview' },
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
  const [activeSection, setActiveSection] = React.useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const init = useMarketStore(s => s.init)
  const tick = useMarketStore(s => s.tick)
  const refreshSession = useMarketStore(s => s.refreshSession)
  useRealtimeService()

  // Initialize market data
  React.useEffect(() => {
    init()
  }, [init])

  // Live tick loop
  React.useEffect(() => {
    const interval = setInterval(() => {
      tick()
    }, 1200) // ~1 update per second
    return () => clearInterval(interval)
  }, [tick])

  // Refresh session every 30s
  React.useEffect(() => {
    const interval = setInterval(refreshSession, 30000)
    return () => clearInterval(interval)
  }, [refreshSession])

  const meta = SECTION_META[activeSection] ?? { title: 'Hisab Gold AI', subtitle: '' }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        active={activeSection}
        onSelect={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={meta.title}
          subtitle={meta.subtitle}
        />

        <main className="flex-1 p-4 lg:p-6 grid-bg">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
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
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-border/30 glass">
          <div className="px-4 lg:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Hisab Gold AI</span>
              <span>·</span>
              <span>SMC + ICT + AI Vision</span>
            </div>
            <div className="text-center md:text-right">
              <span className="text-[oklch(0.92_0.14_85)] font-medium">
                This tool is for educational purposes and should not be considered financial advice.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono">v1.0.0</span>
              <span>·</span>
              <span>Probability-based analysis only</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
