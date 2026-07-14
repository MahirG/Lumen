'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, ChevronRight, Cpu, Crown, Shield, Zap } from 'lucide-react'
import { LiquidGlassCard, GlowButton, PremiumBadge } from '@/components/hisab/primitives'
import { cn } from '@/lib/utils'

export interface SEOSection {
  heading: string
  content: string[]
  bullets?: string[]
}

export interface SEOPageData {
  slug: string
  title: string
  seoTitle: string
  metaDescription: string
  h1: string
  subtitle: string
  primaryKeyword: string
  heroBadge: string
  sections: SEOSection[]
  faqs: { q: string; a: string }[]
  ctaText: string
  internalLinks: { label: string; section: string }[]
}

interface SEOPageProps {
  data: SEOPageData
  onNavigate: (section: string) => void
}

/**
 * SEOPage — Reusable template for keyword-targeted content hub pages.
 * Each page targets a specific high-intent keyword with:
 *   - Optimized H1, meta title, meta description
 *   - 4-6 content sections with deep, valuable content (150+ words each)
 *   - FAQ section with FAQ schema
 *   - Internal links to related pages
 *   - Primary CTA to launch the AI Terminal
 */
export function SEOPage({ data, onNavigate }: SEOPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-4 lg:px-6 overflow-hidden">
        <div className="absolute inset-0 mesh-bg opacity-50 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PremiumBadge variant="gold" size="md" className="mb-4 px-3 py-1.5">
              <Crown className="w-3 h-3" /> {data.heroBadge}
            </PremiumBadge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-4 leading-tight">
              <span className="text-white">{data.h1.split(' ').slice(0, -2).join(' ')} </span>
              <span className="bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#10B981] bg-clip-text text-transparent">
                {data.h1.split(' ').slice(-2).join(' ')}
              </span>
            </h1>
            <p className="text-base md:text-lg text-foreground/60 max-w-2xl mx-auto mb-8 leading-relaxed">
              {data.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <GlowButton size="xl" variant="gold" glow onClick={() => onNavigate('dashboard')}>
                <Zap className="w-4 h-4" /> {data.ctaText}
              </GlowButton>
              <GlowButton size="xl" variant="outline" onClick={() => onNavigate('aile')}>
                <Cpu className="w-4 h-4" /> Explore AILE Engine
              </GlowButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content sections */}
      <section className="py-12 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {data.sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight mb-4 text-white">
                {section.heading}
              </h2>
              <div className="space-y-4">
                {section.content.map((para, j) => (
                  <p key={j} className="text-base text-foreground/70 leading-relaxed">
                    {para}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="space-y-2 mt-4">
                    {section.bullets.map((bullet, k) => (
                      <li key={k} className="flex items-start gap-2 text-sm text-foreground/70">
                        <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      {data.faqs.length > 0 && (
        <section className="py-12 px-4 lg:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight mb-6 text-center text-white">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {data.faqs.map((faq, i) => (
                <FAQItem key={i} faq={faq} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Internal links */}
      {data.internalLinks.length > 0 && (
        <section className="py-12 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold font-display tracking-tight mb-4 text-center text-white">
              Explore More
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.internalLinks.map((link, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(link.section)}
                  className="flex items-center justify-between p-4 rounded-xl liquid-glass hover:border-white/[15%] transition-all group text-left"
                >
                  <span className="text-sm font-medium">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 lg:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <LiquidGlassCard variant="gold" glow className="p-8">
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-3 text-white">
              Ready to Trade with AI Intelligence?
            </h2>
            <p className="text-sm text-foreground/60 mb-6">
              Join thousands of professional traders using ApexEAPro. Trade Less. Trade Smarter.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <GlowButton size="lg" variant="gold" glow onClick={() => onNavigate('dashboard')}>
                <Zap className="w-4 h-4" /> Launch AI Terminal
              </GlowButton>
              <GlowButton size="lg" variant="outline" onClick={() => onNavigate('home')}>
                Back to Home
              </GlowButton>
            </div>
            <p className="text-[10px] text-foreground/40 mt-4 italic">
              Educational tool only — not financial advice. Trading involves substantial risk.
            </p>
          </LiquidGlassCard>
        </div>
      </section>
    </div>
  )
}

function FAQItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = React.useState(false)
  return (
    <LiquidGlassCard className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold pr-4">{faq.q}</span>
        <ChevronRight className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', open && 'rotate-90')} />
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden"
        >
          <p className="px-4 pb-4 text-sm text-foreground/60 leading-relaxed">{faq.a}</p>
        </motion.div>
      )}
    </LiquidGlassCard>
  )
}
