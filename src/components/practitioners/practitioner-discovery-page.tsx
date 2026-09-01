import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PractitionerCard } from "@/components/practitioners/practitioner-card";
import { PractitionerDirectoryError } from "@/components/practitioners/practitioner-status";
import type { Practitioner, PractitionerTerm } from "@/lib/practitioners";
import { buttonVariants } from "@/components/ui/button";

export type PractitionerDiscoveryKind = "area" | "location";

type PractitionerDiscoveryPageProps = {
  kind: PractitionerDiscoveryKind;
  term: Pick<PractitionerTerm, "name" | "slug">;
  practitioners: readonly Practitioner[];
  error?: boolean;
};

const navLinks = [
  { label: "Why Solas", href: "/#why-solas" },
  { label: "Recognition", href: "/#recognition" },
  { label: "The Guide", href: "/practitioners" },
];

const introductionByKind: Record<PractitionerDiscoveryKind, string> = {
  area: "Explore practitioners whose published profiles include this area of support.",
  location: "Explore practitioners whose published profiles include this location.",
};

const eyebrowByKind: Record<PractitionerDiscoveryKind, string> = {
  area: "Area of support",
  location: "Location",
};

function emptyMessage(kind: PractitionerDiscoveryKind) {
  return kind === "area"
    ? "No practitioners are listed under this area yet."
    : "No practitioners are listed under this location yet.";
}

export function PractitionerDiscoveryPage({
  kind,
  term,
  practitioners,
  error = false,
}: PractitionerDiscoveryPageProps) {
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
            aria-labelledby="discovery-heading"
            className="mt-3 border border-border bg-background px-5 py-14 sm:px-8 md:px-12 md:py-20 lg:px-16"
          >
            <p className="review-label text-accent">{eyebrowByKind[kind]}</p>
            <h1
              id="discovery-heading"
              className="mt-4 max-w-3xl font-display text-4xl leading-[1.04] text-balance md:text-6xl"
            >
              {term.name}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground">
              {introductionByKind[kind]}
            </p>
            <Link
              href="/practitioners"
              className={buttonVariants({ variant: "outline", size: "lg", className: "mt-8" })}
            >
              Back to The Guide
              <ArrowRight aria-hidden="true" />
            </Link>
          </section>

          {error ? (
            <PractitionerDirectoryError />
          ) : (
            <section
              aria-labelledby="discovery-results-heading"
              className="border-x border-b border-border bg-card px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:px-16"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <h2
                  id="discovery-results-heading"
                  className="review-label text-muted-foreground"
                >
                  {practitioners.length} {practitioners.length === 1 ? "practitioner" : "practitioners"}
                </h2>
              </div>

              {practitioners.length ? (
                <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {practitioners.map((practitioner) => (
                    <li key={practitioner.slug} className="min-w-0">
                      <PractitionerCard practitioner={practitioner} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-8 border border-border bg-muted/20 px-6 py-12 text-center">
                  <h2 className="font-display text-2xl leading-tight">
                    {emptyMessage(kind)}
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
                    Browse the full Guide to explore other published practitioner profiles.
                  </p>
                  <Link
                    href="/practitioners"
                    className={buttonVariants({ variant: "outline", className: "mt-7" })}
                  >
                    View all practitioners
                  </Link>
                </div>
              )}
            </section>
          )}
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
