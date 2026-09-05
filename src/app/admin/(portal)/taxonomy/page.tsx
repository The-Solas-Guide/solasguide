import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { getAdminTaxonomy } from "@/lib/admin/taxonomy-actions";

export default async function TaxonomyAdminPage() {
  const result = await getAdminTaxonomy();
  if (!result.ok) return <div className="max-w-xl"><h1 className="admin-title">Taxonomy could not be loaded</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.error}</p></div>;
  return <TaxonomyManager initialRecords={result.data ?? []} />;
}
