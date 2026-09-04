import { BookOpenTextIcon } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export default function AdminOverviewPage() {
  return (
    <AdminPlaceholder
      icon={BookOpenTextIcon}
      title="Solas Admin CMS"
      description="Choose an area from the sidebar to manage the client website."
    />
  );
}
