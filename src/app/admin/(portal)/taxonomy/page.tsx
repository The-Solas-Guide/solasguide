import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { getAdminTaxonomy } from "@/lib/admin/taxonomy-actions";

export default async function TaxonomyAdminPage() {
  const result = await getAdminTaxonomy();
  if (!result.ok) return <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6"><h1 className="text-xl font-semibold">Taxonomy could not be loaded</h1><p className="mt-2 text-sm text-muted-foreground">{result.error}</p></div>;
  return <TaxonomyManager initialRecords={result.data ?? []} />;
}
