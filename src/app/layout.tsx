import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
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
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

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
        {gaMeasurementId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />
            <Script id="solas-ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaMeasurementId}',{send_page_view:true});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
