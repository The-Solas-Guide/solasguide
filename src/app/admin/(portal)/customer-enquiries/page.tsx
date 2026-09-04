import { OperationalManager } from "@/components/admin/operational-manager";
import { getOperationalRecords } from "@/lib/admin/operational-actions";

export default async function OperationalListPage() {
  const result = await getOperationalRecords("customer-enquiries");
  return <OperationalManager kind="customer-enquiries" initialRecords={result.data ?? []} error={result.ok ? undefined : result.error ?? "Records could not be loaded."} />;
}
