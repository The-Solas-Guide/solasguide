import { notFound } from "next/navigation";
import { getAdminPractitioner } from "@/lib/admin/practitioner-actions";
import { PractitionerPreview } from "@/components/admin/practitioner-preview";

export default async function PractitionerPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getAdminPractitioner(id);
  if (!result.ok || !result.data) notFound();
  return <PractitionerPreview record={result.data} />;
}
