import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { CuratorsNote, DisclosurePanel, FactPanel } from "@/components/editorial/editorial-blocks";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Breadcrumbs } from "@/components/navigation/navigation-primitives";
import { Button } from "@/components/ui/button";
import { practitioners } from "@/lib/practitioners";

export function generateStaticParams() {
  return practitioners.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const practitioner = practitioners.find((item) => item.slug === slug);

  return {
    title: practitioner ? `${practitioner.name} profile review | The Solas Guide` : "Practitioner profile review | The Solas Guide",
    description: "Review a provisional practitioner profile for The Solas Guide.",
    robots: { index: false, follow: false },
  };
}

export default async function PractitionerProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const practitioner = practitioners.find((item) => item.slug === slug);

  if (!practitioner) notFound();

  return (
    <main className="min-h-screen bg-background px-3 py-3 md:px-5 md:py-5">
      <div className="mx-auto max-w-[1440px]">
        <SiteHeader />

        <div className="border-x border-b border-border bg-amber-100 px-5 py-3 text-xs text-amber-950 md:px-10 lg:px-16">
          <strong>Provisional profile review.</strong> This person and profile content are not approved for publication.
        </div>

        <section className="border-x border-border px-5 pt-8 md:px-10 lg:px-16">
          <Breadcrumbs items={[{ label: "Practitioners", href: "/practitioners" }, { label: practitioner.name }]} />
        </section>

        <section className="grid border-x border-b border-border lg:grid-cols-[minmax(24rem,0.88fr)_minmax(0,1.12fr)]">
          <div className="relative min-h-[32rem] overflow-hidden bg-muted lg:min-h-[48rem]">
            <Image src={practitioner.imageSrc} alt={practitioner.imageAlt} fill priority sizes="(min-width: 1024px) 44vw, 100vw" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/65 to-transparent px-6 pb-6 pt-28 text-background">
              <p className="text-[10px] uppercase tracking-[0.2em]">Provisional editorial profile</p>
            </div>
          </div>

          <div className="flex flex-col justify-between px-6 py-10 md:px-10 md:py-14 lg:px-14 lg:py-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{practitioner.modality}</p>
              <h1 className="mt-6 font-display text-6xl leading-[0.92] tracking-tight md:text-7xl lg:text-8xl">{practitioner.name}</h1>
              <p className="mt-7 text-sm uppercase tracking-[0.16em] text-muted-foreground">{practitioner.location}</p>
              <p className="mt-10 max-w-2xl font-display text-2xl leading-snug md:text-3xl">{practitioner.descriptor}</p>
            </div>

            <div className="mt-12 border-t border-border pt-8">
              <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                This provisional profile returns to the enquiry workflow. Practitioner-specific introductions are not part of the current MVP.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild><Link href="/find-a-match">Find a match <ArrowRight /></Link></Button>
                <Button asChild variant="outline"><Link href="/practitioners"><ArrowLeft />Browse all practitioners</Link></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-12 border-x border-border px-6 py-16 md:px-10 md:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.65fr)] lg:px-16">
          <article className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">About the practice</p>
            <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">A practice shaped by place, relationship, and careful preparation.</h2>
            <div className="mt-9 space-y-6 text-base leading-8 text-muted-foreground">
              <p>Made&apos;s profile is presented as an editorial introduction rather than a promotional listing. It gives visitors enough context to understand the practice, its setting, and the questions worth asking before deciding whether to proceed.</p>
              <p>Sessions are considered individually. The appropriate format depends on the visitor&apos;s context, expectations, timing, and whether the practice is suitable for what they are seeking.</p>
            </div>
          </article>

          <FactPanel
            title="At a glance"
            facts={[
              { label: "Practice", value: practitioner.modality },
              { label: "Location", value: practitioner.location },
              { label: "Experience", value: practitioner.experience },
              { label: "Formats", value: "Private sessions · Small groups" },
              { label: "Languages", value: "Bahasa Indonesia · English" },
            ]}
          />
        </section>

        <section className="grid gap-8 border border-border bg-card px-6 py-14 md:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-16 lg:py-20">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">The Solas perspective</p>
            <h2 className="mt-5 font-display text-3xl md:text-4xl">Why this profile is included</h2>
          </div>
          <CuratorsNote className="bg-background">
            Made&apos;s work is included for visitors seeking a place-rooted practice and willing to approach it with patience, context, and respect rather than as a wellness product.
          </CuratorsNote>
        </section>

        <section className="grid gap-8 border-x border-border px-6 py-14 md:px-10 lg:grid-cols-[1fr_0.7fr] lg:px-16">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Before making a decision</p>
            <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight">Share the context of your stay. The Solas Guide will help shape the next step.</h2>
            <Button asChild className="mt-8"><Link href="/find-a-match">Start Find a Match <ArrowRight /></Link></Button>
          </div>
          <DisclosurePanel title="Editorial and suitability note">
            Inclusion in The Solas Guide is not medical advice or a guarantee of suitability. Visitors remain responsible for asking questions, sharing relevant context, and deciding whether a practitioner is appropriate for them.
          </DisclosurePanel>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
