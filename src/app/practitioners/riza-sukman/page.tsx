import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
          <nav
            aria-label="Breadcrumb"
            className="mt-3 border-x border-t border-border bg-background px-5 py-5"
          >
            <ol className="flex min-h-11 items-center gap-3 text-xs font-semibold uppercase tracking-[0.13em]">
              <li>
                <Link
                  href="/practitioners"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Practitioners
                </Link>
              </li>
              <li aria-hidden="true" className="text-muted-foreground">
                <ArrowRight className="size-4" />
              </li>
              <li aria-current="page" className="text-foreground">
                {practitioner.name}
              </li>
            </ol>
          </nav>

          <article className="border-x border-b border-border bg-background">
            <div className="grid lg:grid-cols-[minmax(20rem,26rem)_1fr]">
              <div className="relative aspect-[3/4] bg-muted">
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
                <p className="review-label text-accent">Practitioner profile</p>
                <h1 className="mt-4 font-display text-4xl leading-[1.04] text-balance md:text-6xl">
                  {practitioner.name}
                </h1>
                <p className="mt-5 max-w-xl font-display text-xl leading-snug text-muted-foreground md:text-2xl">
                  {practitioner.modalities.join(" · ")}
                </p>

                <dl className="mt-8 grid border-y border-border sm:grid-cols-3">
                  <div className="py-4 sm:pr-4">
                    <dt className="review-label text-muted-foreground">Tier · years active</dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-muted-foreground">Not provided</dd>
                  </div>
                  <div className="border-t border-border py-4 sm:border-t-0 sm:border-l sm:px-4">
                    <dt className="review-label text-muted-foreground">Based</dt>
                    <dd className="mt-2 font-display text-lg leading-snug">{practitioner.location}</dd>
                  </div>
                  <div className="border-t border-border py-4 sm:border-t-0 sm:border-l sm:pl-4">
                    <dt className="review-label text-muted-foreground">Listed</dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-muted-foreground">Not provided</dd>
                  </div>
                </dl>

                <p className="mt-8 max-w-2xl font-display text-xl leading-8 text-foreground">
                  Riza is trained in Somatic Experiencing, and his practice also includes bodywork
                  and breathwork. Based in Ubud, he has experience supporting retreat-intensive
                  work. His profile may be relevant to travellers, retreat organisers and groups
                  exploring somatic and body-based support in Bali.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/find-a-match" className={buttonVariants({ size: "lg" })}>
                    Ask about an introduction
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid border-t border-border lg:grid-cols-[0.9fr_1.2fr_0.9fr]">
              <section
                aria-labelledby="credential-record-heading"
                className="px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:px-12"
              >
                <h2 id="credential-record-heading" className="review-label text-muted-foreground">
                  Credential record
                </h2>
                <dl className="mt-6 border-t border-foreground">
                  <div className="border-b border-border py-4">
                    <dt className="review-label text-muted-foreground">Accreditation</dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-muted-foreground">Not provided</dd>
                  </div>
                  <div className="border-b border-border py-4">
                    <dt className="review-label text-muted-foreground">Training</dt>
                    <dd className="mt-2 font-display text-lg leading-snug">Somatic Experiencing</dd>
                  </div>
                  <div className="border-b border-border py-4">
                    <dt className="review-label text-muted-foreground">Pathway</dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-muted-foreground">Not provided</dd>
                  </div>
                  <div className="border-b border-border py-4">
                    <dt className="review-label text-muted-foreground">Practitioner tier</dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-muted-foreground">Not provided</dd>
                  </div>
                  <div className="border-b border-border py-4">
                    <dt className="review-label text-muted-foreground">Confirmed at source</dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-muted-foreground">Not provided</dd>
                  </div>
                  <div className="border-b border-border py-4">
                    <dt className="review-label text-muted-foreground">CPD log</dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-muted-foreground">Not provided</dd>
                  </div>
                  <div className="border-b border-border py-4">
                    <dt className="review-label text-muted-foreground">Renewal due</dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-muted-foreground">Not provided</dd>
                  </div>
                  <div className="border-b border-border py-4">
                    <dt className="review-label text-muted-foreground">Standing</dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-muted-foreground">Not provided</dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="editorial-profile-heading"
                className="border-t border-border px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:border-t-0 lg:border-l lg:px-12"
              >
                <h2 id="editorial-profile-heading" className="review-label text-muted-foreground">
                  Editorial profile
                </h2>
                <p className="mt-6 font-display text-xl leading-8 text-foreground">
                  Riza&apos;s practice brings together Somatic Experiencing, bodywork and breathwork,
                  with experience supporting retreat-intensive work.
                </p>
                <p className="mt-6 font-display text-xl leading-8 text-foreground">
                  The Solas Guide considers the context of each enquiry before recommending an
                  introduction. Share what you are planning so the team can review the most
                  appropriate next step.
                </p>

                <blockquote className="mt-9 border-l border-accent pl-6 font-display text-2xl leading-relaxed italic text-muted-foreground">
                  “The Solas Guide uses human judgement and its trusted network to review each
                  enquiry, recommend an appropriate direction and make curated introductions.”
                  <footer className="review-label mt-5 not-italic text-muted-foreground">
                    The Solas Guide approach
                  </footer>
                </blockquote>

                <section aria-labelledby="practice-formats-heading" className="mt-12">
                  <h3 id="practice-formats-heading" className="review-label text-muted-foreground">
                    Practice formats
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    <li className="border border-border bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]">
                      Retreat-intensive work
                    </li>
                  </ul>
                </section>
              </section>

              <section
                aria-labelledby="practical-heading"
                className="border-t border-border px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:border-t-0 lg:border-l lg:px-12"
              >
                <h2 id="practical-heading" className="review-label text-muted-foreground">
                  Practical
                </h2>
                <dl className="mt-6 border-t border-foreground">
                  <div className="border-b border-border py-4">
                    <dt className="review-label text-muted-foreground">Languages</dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-muted-foreground">Not provided</dd>
                  </div>
                  <div className="border-b border-border py-4">
                    <dt className="review-label text-muted-foreground">Formats</dt>
                    <dd className="mt-2 font-display text-lg leading-snug">Retreat-intensive work</dd>
                  </div>
                  <div className="border-b border-border py-4">
                    <dt className="review-label text-muted-foreground">Working from</dt>
                    <dd className="mt-2 font-display text-lg leading-snug">{practitioner.location}, Bali</dd>
                  </div>
                  <div className="border-b border-border py-4">
                    <dt className="review-label text-muted-foreground">Currently</dt>
                    <dd className="mt-2 font-display text-lg leading-snug text-muted-foreground">Not provided</dd>
                  </div>
                </dl>

                <section aria-labelledby="references-heading" className="mt-10">
                  <h3 id="references-heading" className="review-label text-muted-foreground">
                    References on file
                  </h3>
                  <p className="mt-5 border-y border-border py-4 font-display text-lg leading-snug text-muted-foreground">
                    Not provided
                  </p>
                </section>
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
              Would you like to explore an introduction?
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
              Tell The Solas Guide what you are planning. We will review your enquiry and help you
              consider the most appropriate next step.
            </p>
            <div className="mt-8">
              <Link href="/find-a-match" className={buttonVariants({ size: "lg" })}>
                Begin your enquiry
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
