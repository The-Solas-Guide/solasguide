import { FileTextIcon } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export default function ContentAdminPage() {
  return (
    <AdminPlaceholder
      icon={FileTextIcon}
      title="Pages & Content"
      description="Website page content will be managed here in a later stage."
    />
  );
}
