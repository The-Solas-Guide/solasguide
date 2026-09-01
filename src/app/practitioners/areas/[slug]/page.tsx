import { notFound } from "next/navigation";
import { PractitionerDiscoveryPage } from "@/components/practitioners/practitioner-discovery-page";
import {
  emptyDirectoryFilters,
  getActivePublicDiscoveryTerm,
  getPublishedPractitioners,
} from "@/lib/practitioners";

type AreaPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function PractitionerAreaPage({ params }: AreaPageProps) {
  const { slug } = await params;
  const termResult = await getActivePublicDiscoveryTerm("support_area", slug);

  if (termResult.error) {
    return (
      <PractitionerDiscoveryPage
        kind="area"
        term={{ name: "Area of support", slug }}
        practitioners={[]}
        error
      />
    );
  }

  if (!termResult.data) notFound();

  const result = await getPublishedPractitioners({
    ...emptyDirectoryFilters,
    areas: [termResult.data.slug],
  });

  return (
    <PractitionerDiscoveryPage
      kind="area"
      term={termResult.data}
      practitioners={result.data}
      error={result.error}
    />
  );
}
