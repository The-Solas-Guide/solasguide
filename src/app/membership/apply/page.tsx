import type { Metadata } from "next";
import { PractitionerInterestForm } from "@/components/enquiry/practitioner-interest-form";

export const metadata: Metadata = {
  title: "Membership application",
  description:
    "Apply for practitioner membership with The Solas Guide. Volume One: Bali, expanding across Southeast Asia.",
  alternates: { canonical: "/membership/apply" },
};

export default function MembershipApplicationPage() {
  return <PractitionerInterestForm />;
}
