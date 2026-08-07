import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Suspense } from "react";
import { DesignReviewGate } from "@/components/design-system/design-review-gate";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
      className={`${fraunces.variable} ${inter.variable}`}
      style={
        {
          "--font-display": "var(--font-fraunces), Georgia, serif",
          "--font-body": "var(--font-inter), system-ui, sans-serif",
        } as React.CSSProperties
      }
    >
      <body>
        {children}
        <Suspense fallback={null}>
          <DesignReviewGate />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
