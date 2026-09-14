import type { Metadata } from "next";
import { CustomerEnquiryForm } from "@/components/enquiry/customer-enquiry-form";

export const metadata: Metadata = {
  title: "Need help choosing?",
  description:
    "Tell us a little about what you’re looking for. We’ll review your enquiry personally and suggest the practitioners we think may be worth considering.",
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
