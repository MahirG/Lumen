import type { Metadata } from 'next'
import HomeClient from '../page'

/**
 * Generate metadata for SEO content hub pages.
 * Each page gets a unique title, meta description, and Open Graph tags
 * based on the URL slug.
 *
 * Pages:
 *   /ai-trading-platform
 *   /forex-ai-analysis
 *   /gold-trading-ai
 *   /xauusd-ai-analysis
 *   /algorithmic-trading-software
 *   /trading-ai-assistant
 *   /trading-risk-management
 *   /economic-calendar-ai
 *   /crypto-market-analysis
 *   /smart-money-concepts
 *   /ai-trading-faq
 *   /about
 */

interface Props {
  params: Promise<{ seoSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seoSlug } = await params
  const page = SEO_PAGES[seoSlug]

  if (!page) {
    return {
      title: 'Page Not Found',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: page.seoTitle,
    description: page.metaDescription,
    alternates: {
      canonical: `/${page.slug}`,
    },
    openGraph: {
      title: page.seoTitle,
      description: page.metaDescription,
      type: 'article',
      url: `https://apexeapro.com/${page.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seoTitle,
      description: page.metaDescription,
    },
    keywords: [page.primaryKeyword, ...page.h1.split(' '), 'ApexEAPro', 'AI trading'],
  }
}

// Import SEO_PAGES at module level for metadata generation
import { SEO_PAGES } from '@/lib/seo/seo-content'

/**
 * Catch-all route for SEO content hub pages.
 * Renders the Home client component which reads the URL path
 * and displays the appropriate SEO page.
 */
export default function SEOPageRoute() {
  return <HomeClient />
}
