import type { Metadata } from "next";
import { PractitionerDirectory } from "@/components/practitioners/practitioner-directory";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getPublishedPractitioners } from "@/lib/practitioners";

export const metadata: Metadata = {
  title: "The Guide",
  description:
    "Explore the founding practitioners included in The Solas Guide and review the information listed for each practitioner.",
  // Phase 2 prototype: not part of the MVP delivery scope and not linked from
  // production navigation, so it should not be indexed.
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const navLinks = [
  { label: "Why Solas", href: "/#why-solas" },
  { label: "Recognition", href: "/#recognition" },
  { label: "The Guide", href: "/#registry" },
];

export default async function PractitionersPage() {
  const result = await getPublishedPractitioners();
  const practitioners = result.data;

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
          <section
            aria-labelledby="practitioners-heading"
            className="mt-3 border border-border bg-background px-5 py-14 sm:px-8 md:px-12 md:py-20 lg:px-16"
          >
            <p className="review-label text-accent">Volume One</p>
            <h1
              id="practitioners-heading"
              className="mt-4 max-w-3xl font-display text-4xl leading-[1.04] text-balance md:text-6xl"
            >
              The founding practitioners of The Solas Guide.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground">
              Explore {practitioners.length} practitioners in the Guide. Search by name, practice
              or place, then use the filters when a listing includes that information.
            </p>
          </section>

          <PractitionerDirectory
            practitioners={practitioners}
            error={result.error}
          />
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
