import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { privacyDescription, privacySections, privacyTitle } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: { absolute: privacyTitle },
  description: privacyDescription,
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: privacyTitle,
    description: privacyDescription,
    url: "/privacy",
  },
  twitter: {
    title: privacyTitle,
    description: privacyDescription,
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Privacy"
      title="Privacy policy"
      description="How The Solas Guide uses personal information collected through this website, and the information we do not collect here."
      sections={privacySections}
    />
  );
}
