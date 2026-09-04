import { PractitionerEditor } from "@/components/admin/practitioner-editor";
import { getAdminTaxonomy } from "@/lib/admin/taxonomy-actions";

export default async function NewPractitionerAdminPage() {
  const terms = await getAdminTaxonomy();
  return <PractitionerEditor record={null} terms={terms.data ?? []} isNew />;
}
