'use client'

import * as React from 'react'
import Link from 'next/link'
import { Crown, Twitter, Send, MessageCircle, Youtube, Mail, ArrowUpRight, Shield, Zap } from 'lucide-react'
import { PremiumBadge } from './primitives'

export function Footer({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const productLinks = [
    { label: 'Intelligence Workspace', section: 'dashboard' },
    { label: 'Institutional Intelligence', section: 'chart-analysis' },
    { label: 'AI Market Intelligence', section: 'decision-engine' },
    { label: 'Multi-Timeframe', section: 'mtf' },
    { label: 'Apex Academy', section: 'coach' },
    { label: 'Performance Intelligence', section: 'journal' },
  ]
  const resourceLinks = [
    { label: 'Session Intelligence', section: 'sessions' },
    { label: 'Global Market Events', section: 'news' },
    { label: 'Gold Strength Index', section: 'gold-strength' },
    { label: 'Risk Intelligence', section: 'risk' },
    { label: 'Priority Intelligence', section: 'alerts' },
    { label: 'Knowledge Center', section: 'home' },
  ]

  return (
    <footer className="mt-auto relative border-t border-white/[6%] glass-strong pb-28 lg:pb-12">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.15_85/40%)] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand column */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" onClick={() => onNavigate?.('home')} className="flex items-center gap-3 group w-fit">
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[oklch(0.95_0.10_85)] via-[oklch(0.82_0.16_85)] to-[oklch(0.65_0.20_75)] flex items-center justify-center glow-gold overflow-hidden">
                <Crown className="w-5 h-5 text-[oklch(0.07_0.018_265)]" strokeWidth={2.5} />
                <div className="absolute inset-0 shimmer opacity-30" />
              </div>
              <div>
                <div className="text-lg font-bold font-display tracking-tight text-gradient-gold">Apex EA Pro</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI Forex · Gold</div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The world's most advanced AI-powered forex and gold trading platform.
              Smart Money Concepts, ICT methodology, and institutional-grade intelligence
              in one premium interface.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://t.me/mahifxcapital"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-[oklch(0.92_0.13_85)] hover:bg-[oklch(0.82_0.15_85/8%)] hover:border-[oklch(0.82_0.15_85/20%)] transition-all"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/mahifxcapital"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-[oklch(0.92_0.13_220)] hover:bg-[oklch(0.78_0.18_220/8%)] hover:border-[oklch(0.78_0.18_220/20%)] transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/mahifxcapital"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Community"
                className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-[oklch(0.88_0.16_152)] hover:bg-[oklch(0.78_0.19_152/8%)] hover:border-[oklch(0.78_0.19_152/20%)] transition-all"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/mahifxcapital"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-[oklch(0.85_0.15_25)] hover:bg-[oklch(0.66_0.24_25/8%)] hover:border-[oklch(0.66_0.24_25/20%)] transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@apexeapro.com"
                aria-label="Email"
                className="w-9 h-9 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-[oklch(0.92_0.13_85)] hover:bg-white/[8%] transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product column */}
          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-4">Product</h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigate?.(link.section)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources column */}
          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigate?.(link.section)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', section: 'about' },
                { label: 'Pricing', section: 'home' },
                { label: 'AI Trading FAQ', section: 'ai-trading-faq' },
                { label: 'Smart Money Concepts', section: 'smart-money-concepts' },
                { label: 'Risk Management', section: 'trading-risk-management' },
                { label: 'Contact', href: 'https://t.me/mahifxcapital' },
              ].map((link) => (
                <li key={link.label}>
                  {link.section ? (
                    <button
                      onClick={() => onNavigate?.(link.section!)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      target={link.href?.startsWith('http') ? '_blank' : undefined}
                      rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      {link.href?.startsWith('http') && <ArrowUpRight className="w-3 h-3" />}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / CTA column */}
          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-4">Get Updates</h4>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Join our Telegram for daily AI setups and market analysis.
            </p>
            <a
              href="https://t.me/mahifxcapital"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg glass-gold text-xs font-semibold text-[oklch(0.92_0.13_85)] hover:glow-gold transition-all w-full justify-center"
            >
              <Send className="w-3.5 h-3.5" /> Join Telegram
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Shield className="w-3 h-3 text-[oklch(0.78_0.19_152)]" /> Bank-grade security
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Zap className="w-3 h-3 text-[oklch(0.82_0.15_85)]" /> Real-time data
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[8%] to-transparent my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>© 2026 Apex EA Pro. All rights reserved.</span>
            <span className="hidden md:inline">·</span>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Disclaimer</a>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <PremiumBadge variant="danger" size="xs">
              <Shield className="w-2.5 h-2.5" /> Educational Only
            </PremiumBadge>
            <a
              href="https://hisabtechnologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.82_0.15_85/15%)] to-transparent border border-[oklch(0.82_0.15_85/25%)] hover:border-[oklch(0.82_0.15_85/45%)] transition-all group"
            >
              <span className="text-muted-foreground text-[11px]">Powered by</span>
              <span className="text-[oklch(0.92_0.13_85)] font-bold text-[11px] tracking-wide font-display">HisabTech</span>
              <ArrowUpRight className="w-3 h-3 text-[oklch(0.92_0.13_85)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t border-white/[4%] text-center">
          <p className="text-[10px] text-muted-foreground/70 max-w-3xl mx-auto leading-relaxed italic">
            This tool is for educational purposes and should not be considered financial advice.
            Trading forex and gold involves substantial risk of loss. Past performance is not indicative of future results.
            Never risk more than you can afford to lose. Always consult a licensed financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </footer>
  )
}
