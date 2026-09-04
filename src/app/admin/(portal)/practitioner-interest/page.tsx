import { OperationalManager } from "@/components/admin/operational-manager";
import { getOperationalRecords } from "@/lib/admin/operational-actions";

export default async function OperationalListPage() {
  const result = await getOperationalRecords("practitioner-interest");
  return <OperationalManager kind="practitioner-interest" initialRecords={result.data ?? []} error={result.ok ? undefined : result.error ?? "Records could not be loaded."} />;
}
