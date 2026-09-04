import { notFound } from "next/navigation";
import { OperationalEditor } from "@/components/admin/operational-editor";
import { getOperationalRecord } from "@/lib/admin/operational-actions";
import { isValidUuid } from "@/lib/admin/practitioner-cms";

export default async function OperationalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidUuid(id)) notFound();
  const result = await getOperationalRecord("practitioner-interest", id);
  if (!result.ok) throw new Error("This private record could not be loaded. Try again.");
  if (!result.data) notFound();
  return <OperationalEditor key={result.data.id} kind="practitioner-interest" record={result.data} />;
}
