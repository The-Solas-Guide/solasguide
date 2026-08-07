import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Website terms (draft)",
  description:
    "Draft placeholder website terms page for The Solas Guide. Client-approved content is pending.",
  robots: { index: false, follow: false },
};

export default function WebsiteTermsPage() {
  return (
    <LegalPage
      title="Website terms"
      intro="This is a draft placeholder for The Solas Guide website terms. Client-approved wording has not yet been added."
      sections={[
        {
          title: "Draft status",
          body: "This page is not a final set of website terms. Please do not rely on it as the agreed terms for using the website.",
        },
        {
          title: "What will be added",
          body: "The final page will set out the terms relevant to using this website and submitting an enquiry. The specific details remain to be provided and reviewed.",
        },
      ]}
    />
  );
}
