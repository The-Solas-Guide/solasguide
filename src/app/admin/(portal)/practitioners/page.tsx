import { PractitionerManager } from "@/components/admin/practitioner-manager";
import { getAdminPractitioners } from "@/lib/admin/practitioner-actions";

export default async function PractitionersAdminPage() {
  const result = await getAdminPractitioners();
  if (!result.ok) return <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6"><h1 className="text-xl font-semibold">Practitioners could not be loaded</h1><p className="mt-2 text-sm text-muted-foreground">{result.error}</p></div>;
  return <PractitionerManager initialRecords={result.data ?? []} />;
}
