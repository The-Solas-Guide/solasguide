import { TagsIcon } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export default function TaxonomyAdminPage() {
  return (
    <AdminPlaceholder
      icon={TagsIcon}
      title="Taxonomy"
      description="Controlled taxonomy values will be managed here in a later stage."
    />
  );
}
