import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PractitionerProfile } from "@/components/practitioners/practitioner-profile";
import { PractitionerProfileError } from "@/components/practitioners/practitioner-status";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getPublishedPractitionerBySlug } from "@/lib/practitioners";
import {
  getPractitionerMetadata,
  getUnavailableMetadata,
} from "@/lib/practitioner-metadata";

type PractitionerPageProps = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: PractitionerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedPractitionerBySlug(slug);
  if (result.error) return getUnavailableMetadata();
  if (!result.data) return {};
  return getPractitionerMetadata(result.data);
}
export default async function PractitionerProfilePage({
  params,
}: PractitionerPageProps) {
  const { slug } = await params;
  const result = await getPublishedPractitionerBySlug(slug);
  if (result.error)
    return (
      <div className="mx-auto w-full max-w-[1440px] overflow-x-hidden px-3 py-3 md:px-5 md:py-5">
        <SiteHeader
          links={[
            { label: "Why Solas", href: "/#why-solas" },
            { label: "Recognition", href: "/#recognition" },
            { label: "The Guide", href: "/practitioners" },
          ]}
        />
        <main id="main-content" className="mt-3">
          <PractitionerProfileError />
        </main>
        <SiteFooter />
      </div>
    );
  if (!result.data) notFound();
  return <PractitionerProfile practitioner={result.data} />;
}
