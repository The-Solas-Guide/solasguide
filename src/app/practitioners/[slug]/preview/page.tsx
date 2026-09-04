import { notFound } from "next/navigation";
import { getAdminPractitioners } from "@/lib/admin/practitioner-actions";
import { PractitionerPreview } from "@/components/admin/practitioner-preview";

/** Draft previews stay behind the administrator gate. */
export default async function PrivatePractitionerPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getAdminPractitioners();
  const record = result.data?.find((practitioner) => practitioner.slug === slug) ?? null;
  if (!result.ok || !record) notFound();
  return <PractitionerPreview record={record} />;
}
