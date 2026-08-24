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

const dataRowClassName = "border-b border-border/70 py-3.5";
const dataValueClassName = "mt-2 font-display text-xl leading-8";
const placeholderValueClassName = `${dataValueClassName} text-muted-foreground`;

function CredentialList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-2 divide-y divide-border/70 font-display text-xl leading-8">
      {items.map((item) => (
        <li key={item} className="py-3 first:pt-0 last:pb-0">
          {item}
        </li>
      ))}
    </ul>
  );
}

function ProfileTagList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="border border-border bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

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
            className="mt-3 border border-border bg-background px-5 py-5"
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
              <div className="flex flex-col justify-center px-5 py-10 sm:px-8 md:px-12 md:py-14 lg:px-16">
                <p className="review-label text-accent">Practitioner profile</p>
                <h1 className="mt-3 font-display text-4xl leading-[1.04] text-balance md:text-6xl">
                  {practitioner.name}
                </h1>
                <dl className="mt-5">
                  <div>
                    <dt className="review-label text-muted-foreground">Practice or descriptor</dt>
                    <dd className={practitioner.descriptor ? dataValueClassName : placeholderValueClassName}>
                      {practitioner.descriptor ?? "-"}
                    </dd>
                  </div>
                </dl>

                <dl className="mt-6 grid border-y border-border sm:grid-cols-3">
                  <div className="py-3.5 sm:pr-4">
                    <dt className="review-label text-muted-foreground">Years active</dt>
                    <dd className={practitioner.yearsActive ? dataValueClassName : placeholderValueClassName}>
                      {practitioner.yearsActive ?? "-"}
                    </dd>
                  </div>
                  <div className="py-3.5 sm:pr-4">
                    <dt className="review-label text-muted-foreground">Based</dt>
                    <dd className={dataValueClassName}>{practitioner.location}</dd>
                  </div>
                  <div className="border-t border-border/70 py-3.5 sm:border-t-0 sm:border-l sm:pl-4">
                    <dt className="review-label text-muted-foreground">Works with</dt>
                    <dd className={practitioner.worksWith?.length ? dataValueClassName : placeholderValueClassName}>
                      {practitioner.worksWith?.join(" · ") || "-"}
                    </dd>
                  </div>
                </dl>

                <p className="mt-6 max-w-xl font-display text-xl leading-8 text-foreground">
                  {practitioner.summary}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link href="/find-a-match" className={buttonVariants({ size: "lg" })}>
                    Begin your enquiry
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid border-t border-border lg:grid-cols-[0.9fr_1.2fr_0.9fr]">
              <section
                aria-labelledby="credentials-and-training-heading"
                className="px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:px-12"
              >
                <h2
                  id="credentials-and-training-heading"
                  className="review-label text-muted-foreground"
                >
                  Credentials and significant training
                </h2>
                <dl className="mt-6 border-t border-border/80">
                  <div className={dataRowClassName}>
                    <dt className="review-label text-muted-foreground">Credentials</dt>
                    <dd>
                      {practitioner.credentials?.length ? (
                        <CredentialList items={practitioner.credentials} />
                      ) : (
                        <span className={placeholderValueClassName}>-</span>
                      )}
                    </dd>
                  </div>
                  <div className={dataRowClassName}>
                    <dt className="review-label text-muted-foreground">Significant training</dt>
                    <dd>
                      <CredentialList
                        items={practitioner.significantTraining ?? ["Somatic Experiencing"]}
                      />
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="about-heading"
                className="border-t border-border px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:border-t-0 lg:border-l lg:px-12"
              >
                <h2 id="about-heading" className="review-label text-muted-foreground">
                  About
                </h2>
                <p className="mt-6 max-w-[36rem] font-display text-xl leading-8 text-foreground">
                  {practitioner.about ?? practitioner.summary}
                </p>

                <section aria-labelledby="areas-of-support-heading" className="mt-10">
                  <h3
                    id="areas-of-support-heading"
                    className="review-label text-muted-foreground"
                  >
                    Areas of support
                  </h3>
                  {practitioner.areasOfSupport?.length ? (
                    <ProfileTagList items={practitioner.areasOfSupport} />
                  ) : (
                    <p className={placeholderValueClassName}>-</p>
                  )}
                </section>

                <section aria-labelledby="approach-heading" className="mt-10">
                  <h3 id="approach-heading" className="review-label text-muted-foreground">
                    Approach
                  </h3>
                  {practitioner.approach ? (
                    <ProfileTagList items={[practitioner.approach]} />
                  ) : (
                    <p className={placeholderValueClassName}>-</p>
                  )}
                </section>

                <section aria-labelledby="specific-modalities-heading" className="mt-12">
                  <h3
                    id="specific-modalities-heading"
                    className="review-label text-muted-foreground"
                  >
                    Specific modalities
                  </h3>
                  {practitioner.modalities.length > 0 ? (
                    <ProfileTagList items={practitioner.modalities} />
                  ) : (
                    <p className={placeholderValueClassName}>-</p>
                  )}
                </section>
              </section>

              <section
                aria-labelledby="practical-heading"
                className="border-t border-border px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:border-t-0 lg:border-l lg:px-12"
              >
                <h2 id="practical-heading" className="review-label text-muted-foreground">
                  Practical
                </h2>
                <dl className="mt-6 border-t border-border/80">
                  <div className={dataRowClassName}>
                    <dt className="review-label text-muted-foreground">Works with</dt>
                    <dd className={practitioner.worksWith?.length ? dataValueClassName : placeholderValueClassName}>
                      {practitioner.worksWith?.join(" · ") || "-"}
                    </dd>
                  </div>
                  <div className={dataRowClassName}>
                    <dt className="review-label text-muted-foreground">Languages</dt>
                    <dd className={practitioner.languages?.length ? dataValueClassName : placeholderValueClassName}>
                      {practitioner.languages?.join(" · ") || "-"}
                    </dd>
                  </div>
                  <div className={dataRowClassName}>
                    <dt className="review-label text-muted-foreground">In-person or online</dt>
                    <dd className={practitioner.delivery?.length ? dataValueClassName : placeholderValueClassName}>
                      {practitioner.delivery?.join(" · ") || "-"}
                    </dd>
                  </div>
                  <div className={dataRowClassName}>
                    <dt className="review-label text-muted-foreground">Locations</dt>
                    <dd className={dataValueClassName}>{practitioner.location}</dd>
                  </div>
                </dl>
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
