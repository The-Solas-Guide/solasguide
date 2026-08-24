import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import { getPractitionerBySlug } from "@/lib/practitioners";
import { cn } from "@/lib/utils";

const practitioner = getPractitionerBySlug("riza-sukman");

export const metadata: Metadata = {
  title: "Riza Sukman",
  description:
    "The Solas Guide editorial profile for Riza Sukman, a Somatic Experiencing practitioner in Ubud.",
  // Phase 2 prototype: not part of the MVP delivery scope and not linked from
  // production navigation, so it should not be indexed.
  robots: { index: false, follow: false },
};

const navLinks = [
  { label: "Why Solas", href: "/#why-solas" },
  { label: "Recognition", href: "/#recognition" },
  { label: "The Guide", href: "/#registry" },
];

export default function RizaSukmanPage() {
  if (!practitioner) notFound();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only fixed top-3 left-3 z-[60] border border-border bg-background px-4 py-3 text-sm text-foreground focus:not-sr-only focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        Skip to main content
      </a>
      <div className="mx-auto w-full max-w-[1440px] overflow-x-hidden px-3 py-3 md:px-5 md:py-5">
        <SiteHeader links={navLinks} />

        <main id="main-content">
          <div className="mt-3 border-x border-t border-border bg-background px-5 pt-6 sm:px-8 md:px-12 lg:px-16">
            <Link
              href="/practitioners"
              className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to the Guide
            </Link>
          </div>

          <article className="border-x border-b border-border bg-background">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative aspect-[4/5] bg-muted lg:aspect-auto lg:min-h-[26rem]">
                <Image
                  src={practitioner.image}
                  alt={practitioner.imageAlt}
                  fill
                  priority
                  className={cn("object-cover", practitioner.imagePosition)}
                  sizes="(max-width: 1023px) 100vw, 42vw"
                />
              </div>
              <div className="flex flex-col justify-center px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:px-16">
                <p className="review-label text-accent">{practitioner.location}</p>
                <h1 className="mt-4 font-display text-4xl leading-[1.04] text-balance md:text-6xl">
                  {practitioner.name}
                </h1>
                <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground">
                  {practitioner.summary}
                </p>
              </div>
            </div>

            <div className="grid border-t border-border sm:grid-cols-2">
              <section
                aria-labelledby="areas-of-support-heading"
                className="px-5 py-10 sm:px-8 md:px-12 lg:px-16"
              >
                <h2 id="areas-of-support-heading" className="review-label text-muted-foreground">
                  Areas of support
                </h2>
                <ul className="mt-4 space-y-2">
                  {practitioner.modalities.map((modality) => (
                    <li key={modality} className="font-display text-xl leading-tight text-foreground">
                      {modality}
                    </li>
                  ))}
                </ul>
              </section>

              <section
                aria-labelledby="location-heading"
                className="border-t border-border px-5 py-10 sm:border-t-0 sm:border-l sm:px-8 md:px-12 lg:px-16"
              >
                <h2 id="location-heading" className="review-label text-muted-foreground">
                  Location
                </h2>
                <p className="mt-4 font-display text-xl leading-tight text-foreground">
                  {practitioner.location}
                </p>
              </section>
            </div>
          </article>

          <section
            aria-labelledby="find-a-match-heading"
            className="border-x border-b border-border bg-card px-5 py-14 sm:px-8 md:px-12 md:py-16 lg:px-16"
          >
            <h2
              id="find-a-match-heading"
              className="max-w-2xl font-display text-3xl leading-[1.08] text-balance md:text-4xl"
            >
              Not sure who is the right fit?
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
              Tell us about your trip, retreat or group and we will recommend the practitioner we
              believe is the strongest match, then make the introduction.
            </p>
            <div className="mt-8">
              <Link href="/find-a-match" className={buttonVariants({ size: "lg" })}>
                Find a Match
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
