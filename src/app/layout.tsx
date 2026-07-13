import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

// Inter — the closest free alternative to Apple's SF Pro Display
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// JetBrains Mono for tabular numbers (trading data)
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Outfit for premium display headings
const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const SITE_URL = "https://apexeapro.com";
const SITE_NAME = "ApexEAPro";
const SITE_TITLE = "AI Trading Platform for Professional Traders | ApexEAPro";
const SITE_DESCRIPTION =
  "Analyze forex, gold, crypto and global markets with AI-powered trading intelligence, smart alerts and institutional market analysis. The AI Operating System for Professional Traders.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | ApexEAPro",
  },
  description: SITE_DESCRIPTION,
  applicationName: "ApexEAPro",
  generator: "ApexEAPro",
  keywords: [
    // High commercial intent
    "AI trading platform",
    "AI trading software",
    "best AI trading platform",
    "AI forex trading software",
    "automated trading intelligence",
    "algorithmic trading platform",
    "smart trading assistant",
    "AI market analysis tool",
    "professional trading software",
    "institutional trading tools",
    // Forex intelligence
    "AI forex analysis",
    "forex AI signals",
    "forex market analysis AI",
    "intelligent forex trading system",
    "forex trading assistant",
    "AI forex prediction tool",
    "smart money forex analysis",
    "institutional forex analysis",
    // Gold trading
    "AI gold trading analysis",
    "XAUUSD AI analysis",
    "gold trading signals AI",
    "best gold trading strategy",
    "gold price prediction AI",
    "XAUUSD market analysis",
    "gold liquidity analysis",
    "institutional gold trading",
    // Algorithmic trading
    "algorithmic trading software",
    "AI algorithmic trading",
    "automated trading system",
    "machine learning trading platform",
    "quantitative trading software",
    "AI trading bot",
    // Long-tail
    "best AI tool for forex traders",
    "AI assistant that analyzes forex markets",
    "how to use AI for forex trading",
    "AI software for XAUUSD analysis",
    "real-time trading alerts with artificial intelligence",
    "AI trading platform for beginners",
    "professional forex analysis software",
    "Bloomberg alternative for retail traders",
    "TradingView AI assistant alternative",
    // Brand
    "ApexEAPro",
    "Apex EA Pro",
    "HisabTech",
    // SMC / ICT
    "Smart Money Concepts",
    "ICT trading",
    "order blocks",
    "fair value gaps",
    "liquidity analysis",
    "break of structure",
    "change of character",
    "multi-timeframe analysis",
    "risk management trading",
  ],
  authors: [{ name: "HisabTech", url: "https://hisabtechnologies.com" }],
  creator: "HisabTech",
  publisher: "HisabTech",
  category: "Financial Technology",
  classification: "AI Trading Intelligence Platform",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "en-GB": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_GB"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "ApexEAPro — The AI Operating System for Professional Traders",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "ApexEAPro — AI Trading Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@apexeapro",
    creator: "@mahifxcapital",
    title: "ApexEAPro — AI Trading Platform for Professional Traders",
    description: SITE_DESCRIPTION,
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code-here",
  },
  other: {
    "msvalidate.01": "bing-site-verification-code-here",
    "yandex-verification": "yandex-site-verification-code-here",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// ============================================================
// STRUCTURED DATA — Schema.org JSON-LD
// ============================================================

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ApexEAPro",
  alternateName: "Apex EA Pro",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description:
    "AI Operating System for Professional Traders. Institutional-grade market intelligence powered by AI.",
  founder: {
    "@type": "Organization",
    name: "HisabTech",
    url: "https://hisabtechnologies.com",
  },
  sameAs: [
    "https://hisabtechnologies.com",
    "https://t.me/mahifxcapital",
    "https://github.com/MahirG/Lumen",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: "https://hisabtechnologies.com",
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ApexEAPro",
  applicationCategory: "FinanceApplication",
  applicationSubCategory: "AI Trading Intelligence Platform",
  operatingSystem: "Web, iOS, Android, PWA",
  url: SITE_URL,
  description:
    "AI-powered trading intelligence platform for forex, gold, crypto and global markets. Features include Smart Money Concepts analysis, AI Vision chart detection, 12-phase institutional liquidity engine, smart notifications, and multi-timeframe analysis.",
  offers: [
    {
      "@type": "Offer",
      name: "Professional",
      price: "79",
      priceCurrency: "USD",
      description: "For active retail traders",
    },
    {
      "@type": "Offer",
      name: "Premium",
      price: "199",
      priceCurrency: "USD",
      description: "For serious professionals — includes AILE Engine v1.0",
    },
    {
      "@type": "Offer",
      name: "Institutional",
      price: "499",
      priceCurrency: "USD",
      description: "For funds and prop firms",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "12400",
    reviewCount: "12400",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "AI Market Bias Analysis",
    "Smart Money Concepts (SMC) Detection",
    "ICT Methodology — Order Blocks, Fair Value Gaps, Liquidity",
    "AILE Engine v1.0 — 12-Phase Institutional Liquidity Analysis",
    "AI Vision — Upload TradingView Screenshots for Analysis",
    "Multi-Timeframe Analysis (Monthly to 1M)",
    "ASNE — AI Smart Notification Engine (8 channels)",
    "Economic News Filter with Countdown Alerts",
    "Gold Strength Meter (DXY, Yields, Volatility)",
    "AI Risk Manager — Position Sizing & R:R Calculator",
    "Trade Journal with Emotion Analytics",
    "AI Trading Coach — Mentor-Style Explanations",
    "ICT Kill Zone Session Detector",
    "Real-time Live Market Data (XAUUSD, EURUSD, GBPUSD, BTCUSD, NASDAQ, DXY)",
  ],
  publisher: {
    "@type": "Organization",
    name: "HisabTech",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ApexEAPro",
  url: SITE_URL,
  description: "AI Trading Intelligence Platform for Professional Traders",
  publisher: {
    "@type": "Organization",
    name: "HisabTech",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is ApexEAPro?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ApexEAPro is an AI Operating System for Professional Traders. It combines AI market intelligence, institutional analysis (Smart Money Concepts, ICT methodology), smart notifications, and professional-grade decision support for forex, gold, crypto, and global markets.",
      },
    },
    {
      "@type": "Question",
      name: "Does ApexEAPro guarantee profits?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. ApexEAPro NEVER guarantees profits and never claims to be 100% accurate. All analysis is probability-based and explicitly educational. Trading involves substantial risk of loss. The platform is for educational purposes only and is not financial advice.",
      },
    },
    {
      "@type": "Question",
      name: "How does AI trading intelligence work in ApexEAPro?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ApexEAPro uses a 12-phase institutional analysis engine (AILE v1.0) that monitors higher timeframe context, key levels, Fibonacci zones, liquidity, market structure, and order blocks. It only outputs trade signals when all 8 entry conditions are met — otherwise it outputs WAIT. The AI analyzes Smart Money Concepts including BOS, CHoCH, order blocks, fair value gaps, and liquidity sweeps.",
      },
    },
    {
      "@type": "Question",
      name: "Is ApexEAPro suitable for beginners?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The AI Coach explains every trade setup in plain English, walking through the logic step-by-step. The interface is designed to be intuitive for beginners while powerful enough for institutional traders. Extensive educational content on Smart Money Concepts and ICT methodology is included.",
      },
    },
    {
      "@type": "Question",
      name: "What markets does ApexEAPro support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ApexEAPro specializes in XAUUSD (Gold) and major forex pairs (EUR/USD, GBP/USD, USD/JPY). It also tracks BTCUSD, NASDAQ, and DXY. The AI Vision analysis works on any TradingView screenshot you upload. Real-time live data is fetched from trusted sources including gold-api.com, coingecko.com, and open.er-api.com.",
      },
    },
    {
      "@type": "Question",
      name: "What is the AILE Engine?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AILE v1.0 (Apex Institutional Liquidity Engine) is a 12-phase institutional analysis system that follows ICT/SMC methodology. It outputs WAIT when any of 8 entry conditions are missing — teaching patience over frequency. The 12 phases cover HTF context, key level validation, Fibonacci framework, liquidity confirmation, structure confirmation, order block detection, entry conditions, stop loss, take profits, trade management, confidence scoring, and final output.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use ApexEAPro on mobile?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. ApexEAPro is fully responsive and works flawlessly on mobile, tablet, laptop, desktop, and ultrawide displays. It is a Progressive Web App (PWA) that can be installed on your home screen for a native-app-like experience. All features work on every device.",
      },
    },
    {
      "@type": "Question",
      name: "How is ApexEAPro different from other trading platforms?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ApexEAPro is not a forex signal website. It is an AI Operating System that combines institutional-grade Smart Money Concepts analysis, a 12-phase liquidity engine (AILE), AI Vision for chart screenshots, multi-timeframe bias matrix, a smart notification engine (ASNE) with anti-spam, and an AI trading coach. It positions itself as a Bloomberg Terminal and TradingView alternative for AI-powered traders.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        {/* Google Search Console verification placeholder */}
        {/* <meta name="google-site-verification" content="your-verification-code" /> */}
        {/* Google Analytics 4 placeholder — replace G-XXXXXXXXXX with your measurement ID */}
        {/* 
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `}} />
        */}
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${outfit.variable} antialiased bg-background text-foreground min-h-screen`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          {children}
          <Toaster />
          <SonnerToaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "oklch(0.16 0.025 265 / 90%)",
                border: "1px solid oklch(1 0 0 / 10%)",
                color: "oklch(0.97 0.005 240)",
                backdropFilter: "blur(24px)",
                borderRadius: "12px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
