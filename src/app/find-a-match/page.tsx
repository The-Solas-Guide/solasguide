import type { Metadata } from "next";
import { CustomerEnquiryForm } from "@/components/enquiry/customer-enquiry-form";

export const metadata: Metadata = {
  title: "Start an enquiry",
  description:
    "Tell us about your Bali plans and what you want from the trip. We will review the context and follow up with considered recommendations.",
};

export default function FindAPractitionerPage() {
  return <CustomerEnquiryForm />;
}
