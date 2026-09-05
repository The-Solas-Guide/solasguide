import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrator",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-admin className="min-h-svh bg-background text-foreground">
      {children}
    </div>
  );
}
