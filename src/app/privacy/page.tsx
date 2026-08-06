import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Privacy (draft) | The Solas Guide",
  description:
    "Draft placeholder privacy page for The Solas Guide. Client-approved content is pending.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      intro="This is a draft placeholder for The Solas Guide privacy page. Client-approved wording has not yet been added."
      sections={[
        {
          title: "Draft status",
          body: "This page is not a final privacy policy. Please do not rely on it for a complete account of how information is handled.",
        },
        {
          title: "What will be added",
          body: "The final page will describe the privacy information relevant to this website and its enquiry forms. The specific details remain to be provided and reviewed.",
        },
      ]}
    />
  );
}
