import { OperationalEditor } from "@/components/admin/operational-editor";
import { requireAdmin } from "@/lib/admin/authorization";

export default async function NewOperationalPage() {
  await requireAdmin();
  return <OperationalEditor kind="customer-enquiries" record={null} />;
}
