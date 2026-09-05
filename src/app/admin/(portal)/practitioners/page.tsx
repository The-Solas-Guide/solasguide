import { PractitionerManager } from "@/components/admin/practitioner-manager";
import { getAdminPractitioners } from "@/lib/admin/practitioner-actions";

export default async function PractitionersAdminPage() {
  const result = await getAdminPractitioners();
  if (!result.ok) return <div className="max-w-xl"><h1 className="admin-title">Practitioners could not be loaded</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.error}</p></div>;
  return <PractitionerManager initialRecords={result.data ?? []} />;
}
