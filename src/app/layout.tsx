import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Barlow_Condensed, Inter, Manrope } from "next/font/google";
import { Suspense } from "react";
import { DesignReviewGate } from "@/components/design-system/design-review-gate";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: "100",
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-admin",
  subsets: ["latin"],
  preload: false,
});

const siteTitle = "The Solas Guide | Curated Bali experiences";
const siteDescription =
  "Tell us about your Bali trip. The Solas Guide recommends relevant practitioners, venues, experiences and events, then helps make the introductions.";
const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | The Solas Guide",
  },
  description: siteDescription,
  applicationName: "The Solas Guide",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "The Solas Guide",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/brand/solas-facebook.png",
        width: 1200,
        height: 630,
        alt: "The Solas Guide logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/brand/solas-facebook.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="aman"
      data-scroll-behavior="smooth"
      className={`${barlowCondensed.variable} ${inter.variable} ${manrope.variable}`}
      style={
        {
          "--font-display": "var(--font-barlow-condensed), Arial Narrow, sans-serif",
          "--font-body": "var(--font-inter), system-ui, sans-serif",
        } as React.CSSProperties
      }
    >
      <body>
        {children}
        <Suspense fallback={null}>
          <DesignReviewGate />
        </Suspense>
        <Toaster position="top-right" />
        <Analytics />
      </body>
    </html>
  );
}
