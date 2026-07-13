import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Apex EA Pro — AI Forex & Gold Trading Intelligence",
  description:
    "The world's most advanced AI-powered forex and gold trading platform. Smart Money Concepts, ICT, real-time market intelligence, and institutional-grade analysis. Educational only — not financial advice.",
  keywords: [
    "Apex EA Pro", "Forex Trading", "Gold Trading", "XAUUSD", "AI Trading",
    "Smart Money Concepts", "ICT", "Institutional Trading", "Risk Management",
  ],
  authors: [{ name: "HisabTech" }],
  icons: { icon: "/logo.svg" },
  manifest: "/manifest.json",
  openGraph: {
    title: "Apex EA Pro — AI Trading Intelligence",
    description: "Institutional-grade AI trading analysis for forex & gold.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07091a",
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
        className={`${outfit.variable} antialiased bg-background text-foreground min-h-screen`}
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
