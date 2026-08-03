import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Solas Guide",
  description: "The Solas Guide website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
