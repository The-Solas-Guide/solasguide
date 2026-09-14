import type { Metadata } from "next";
import { PractitionerInterestForm } from "@/components/enquiry/practitioner-interest-form";

export const metadata: Metadata = {
  title: "Express your interest",
  description: "Introduce your practice to The Solas Guide.",
};

export default function PractitionerExpressionOfInterestPage() {
  return <PractitionerInterestForm />;
}
