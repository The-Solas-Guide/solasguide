import { HeartHandshakeIcon } from "lucide-react";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export default function PractitionerInterestAdminPage() {
  return (
    <AdminPlaceholder
      icon={HeartHandshakeIcon}
      title="Practitioner Interest"
      description="Private practitioner interest records will be managed here in a later stage."
    />
  );
}
