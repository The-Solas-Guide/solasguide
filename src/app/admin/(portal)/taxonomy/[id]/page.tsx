import { notFound } from "next/navigation";
import { TaxonomyEditor } from "@/components/admin/taxonomy-editor";
import { getAdminTaxonomy } from "@/lib/admin/taxonomy-actions";

export default async function EditTaxonomyAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getAdminTaxonomy();
  const record = result.data?.find((term) => term.id === id) ?? null;
  if (!result.ok || !record) notFound();
  return <TaxonomyEditor record={record} />;
}
