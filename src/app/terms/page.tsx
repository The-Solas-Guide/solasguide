import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { termsDescription, termsSections, termsTitle } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: { absolute: termsTitle },
  description: termsDescription,
  alternates: { canonical: "/terms" },
  openGraph: {
    title: termsTitle,
    description: termsDescription,
    url: "/terms",
  },
  twitter: {
    title: termsTitle,
    description: termsDescription,
  },
};

export default function WebsiteTermsPage() {
  return (
    <LegalPage
      kicker="Terms"
      title="Website terms of use"
      description="The terms for using this website, sending an enquiry, and applying for practitioner membership."
      sections={termsSections}
    />
  );
}
