import { MetadataRoute } from 'next'

const SITE_URL = 'https://apexeapro.com'

/**
 * Sitemap for ApexEAPro — dynamically generated XML sitemap.
 * Includes all SEO content hub pages + main app pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const pages = [
    // Core page
    { url: '/', priority: 1.0, changefreq: 'daily' as const },
    // SEO content hub — keyword-targeted landing pages
    { url: '/ai-trading-platform', priority: 0.9, changefreq: 'weekly' as const },
    { url: '/forex-ai-analysis', priority: 0.9, changefreq: 'weekly' as const },
    { url: '/gold-trading-ai', priority: 0.9, changefreq: 'weekly' as const },
    { url: '/xauusd-ai-analysis', priority: 0.9, changefreq: 'weekly' as const },
    { url: '/algorithmic-trading-software', priority: 0.9, changefreq: 'weekly' as const },
    { url: '/trading-ai-assistant', priority: 0.9, changefreq: 'weekly' as const },
    { url: '/trading-risk-management', priority: 0.8, changefreq: 'weekly' as const },
    { url: '/economic-calendar-ai', priority: 0.8, changefreq: 'weekly' as const },
    { url: '/crypto-market-analysis', priority: 0.8, changefreq: 'weekly' as const },
    { url: '/smart-money-concepts', priority: 0.8, changefreq: 'weekly' as const },
    { url: '/ai-trading-faq', priority: 0.7, changefreq: 'monthly' as const },
    { url: '/about', priority: 0.6, changefreq: 'monthly' as const },
  ]

  return pages.map(p => ({
    url: `${SITE_URL}${p.url}`,
    lastModified: now,
    changeFrequency: p.changefreq,
    priority: p.priority,
  }))
}
