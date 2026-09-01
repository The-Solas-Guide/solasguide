import { notFound } from "next/navigation";
import { PractitionerDiscoveryPage } from "@/components/practitioners/practitioner-discovery-page";
import {
  emptyDirectoryFilters,
  getPublishedPractitioners,
  getTermsByType,
} from "@/lib/practitioners";

type LocationPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function PractitionerLocationPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const allResult = await getPublishedPractitioners();

  if (allResult.error) {
    return (
      <PractitionerDiscoveryPage
        kind="location"
        term={{ name: "Location", slug }}
        practitioners={[]}
        error
      />
    );
  }

  const term = allResult.data
    .flatMap((practitioner) => getTermsByType(practitioner, "location"))
    .find((candidate) => candidate.slug === slug);

  if (!term) notFound();

  const result = await getPublishedPractitioners({
    ...emptyDirectoryFilters,
    locations: [term.slug],
  });

  return (
    <PractitionerDiscoveryPage
      kind="location"
      term={term}
      practitioners={result.data}
      error={result.error}
    />
  );
}
