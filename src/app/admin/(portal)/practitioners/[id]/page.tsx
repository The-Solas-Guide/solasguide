import { notFound } from "next/navigation";
import { PractitionerEditor } from "@/components/admin/practitioner-editor";
import { getAdminPractitioner } from "@/lib/admin/practitioner-actions";
import { getAdminTaxonomy } from "@/lib/admin/taxonomy-actions";

export default async function EditPractitionerAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [record, terms] = await Promise.all([getAdminPractitioner(id), getAdminTaxonomy()]);
  if (!record.ok || !record.data) notFound();
  return <PractitionerEditor record={record.data} terms={terms.data ?? []} />;
}
