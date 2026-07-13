import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Hisab Gold AI — XAUUSD Smart Money Trading Assistant",
  description:
    "AI-powered XAUUSD analysis using Smart Money Concepts, ICT, and risk management. Probability-based educational tool — never financial advice.",
  keywords: [
    "XAUUSD", "Gold Trading", "Smart Money Concepts", "ICT", "AI Trading",
    "Order Blocks", "FVG", "Liquidity", "BOS", "CHoCH", "Risk Management",
  ],
  authors: [{ name: "Hisab Gold AI" }],
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Hisab Gold AI",
    description: "AI-powered XAUUSD Smart Money Concepts analysis",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0d1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased bg-background text-foreground min-h-screen`}
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
                background: "oklch(0.2 0.015 240 / 90%)",
                border: "1px solid oklch(1 0 0 / 10%)",
                color: "oklch(0.96 0.005 60)",
                backdropFilter: "blur(20px)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
