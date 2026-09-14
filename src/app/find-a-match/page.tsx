import type { Metadata } from "next";
import { CustomerEnquiryForm } from "@/components/enquiry/customer-enquiry-form";

export const metadata: Metadata = {
  title: "Start an enquiry",
  description:
    "Tell us about your Bali plans and what you want from the trip. We will review the context and follow up with considered recommendations.",
};

type FindAMatchSearchParams = Promise<
  Readonly<Record<string, string | string[] | undefined>>
>;

function firstSearchParam(
  searchParams: Readonly<Record<string, string | string[] | undefined>>,
  key: string,
) {
  const value = searchParams[key];
  const first = Array.isArray(value) ? value[0] : value;
  return first?.trim() || undefined;
}

export default async function FindAPractitionerPage({
  searchParams,
}: {
  searchParams: FindAMatchSearchParams;
}) {
  const params = await searchParams;
  const practitionerName = firstSearchParam(params, "practitioner");
  const intent = firstSearchParam(params, "intent");
  return (
    <CustomerEnquiryForm
      key={`${practitionerName ?? ""}:${intent ?? ""}`}
      practitionerName={practitionerName}
      intent={intent}
    />
  );
}
