import { UsersIcon } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export default function PractitionersAdminPage() {
  return (
    <AdminPlaceholder
      icon={UsersIcon}
      title="Practitioners"
      description="Practitioner records will be managed here in the next stage."
    />
  );
}
