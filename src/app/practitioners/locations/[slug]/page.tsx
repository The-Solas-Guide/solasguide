import { notFound } from "next/navigation";
import { PractitionerDiscoveryPage } from "@/components/practitioners/practitioner-discovery-page";
import {
  emptyDirectoryFilters,
  getActivePublicDiscoveryTerm,
  getPublishedPractitioners,
} from "@/lib/practitioners";

type LocationPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function PractitionerLocationPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const termResult = await getActivePublicDiscoveryTerm("location", slug);

  if (termResult.error) {
    return (
      <PractitionerDiscoveryPage
        kind="location"
        term={{ name: "Location", slug }}
        practitioners={[]}
        error
      />
    );
  }

  if (!termResult.data) notFound();

  const result = await getPublishedPractitioners({
    ...emptyDirectoryFilters,
    locations: [termResult.data.slug],
  });

  return (
    <PractitionerDiscoveryPage
      kind="location"
      term={termResult.data}
      practitioners={result.data}
      error={result.error}
    />
  );
}
