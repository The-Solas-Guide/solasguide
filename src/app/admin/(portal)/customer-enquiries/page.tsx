import { InboxIcon } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export default function CustomerEnquiriesAdminPage() {
  return (
    <AdminPlaceholder
      icon={InboxIcon}
      title="Customer Enquiries"
      description="Private customer enquiries will be managed here in a later stage."
    />
  );
}
