import { notFound } from "next/navigation";
import { PractitionerDiscoveryPage } from "@/components/practitioners/practitioner-discovery-page";
import {
  emptyDirectoryFilters,
  getPublishedPractitioners,
  getTermsByType,
} from "@/lib/practitioners";

type AreaPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function PractitionerAreaPage({ params }: AreaPageProps) {
  const { slug } = await params;
  const allResult = await getPublishedPractitioners();

  if (allResult.error) {
    return (
      <PractitionerDiscoveryPage
        kind="area"
        term={{ name: "Area of support", slug }}
        practitioners={[]}
        error
      />
    );
  }

  const term = allResult.data
    .flatMap((practitioner) => getTermsByType(practitioner, "support_area"))
    .find((candidate) => candidate.slug === slug);

  if (!term) notFound();

  const result = await getPublishedPractitioners({
    ...emptyDirectoryFilters,
    areas: [term.slug],
  });

  return (
    <PractitionerDiscoveryPage
      kind="area"
      term={term}
      practitioners={result.data}
      error={result.error}
    />
  );
}
