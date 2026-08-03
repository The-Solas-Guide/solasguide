import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "The Solas Guide",
  description:
    "A considered guide to wellness practitioners and restorative experiences in Bali.",
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
      <body>{children}</body>
    </html>
  );
}
