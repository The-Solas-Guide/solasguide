import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { PractitionerProfileError } from "@/components/practitioners/practitioner-status";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import {
  getPublishedPractitionerBySlug,
  portraitObjectPosition,
  type Practitioner,
} from "@/lib/practitioners";
import { cn } from "@/lib/utils";

type PractitionerPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PractitionerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedPractitionerBySlug(slug);
  const practitioner = result.data;

  if (result.error || !practitioner) {
    return {
      title: "Practitioner profile",
      description: "Explore practitioner profiles in The Solas Guide.",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: practitioner.name,
    description:
      practitioner.summary ??
      practitioner.descriptor ??
      "Explore this practitioner profile in The Solas Guide.",
    robots: { index: false, follow: false },
  };
}

const navLinks = [
  { label: "Why Solas", href: "/#why-solas" },
  { label: "Recognition", href: "/#recognition" },
  { label: "The Guide", href: "/practitioners" },
];

const dataRowClassName = "border-b border-border/70 py-3.5";
const dataValueClassName = "mt-2 font-display text-xl leading-8";

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

function safeExternalUrl(value: string | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}

function ProfilePage({ practitioner }: { practitioner: Practitioner }) {
  const locations = practitioner.location;
  const approaches = practitioner.approaches ?? (practitioner.approach ? [practitioner.approach] : []);
  const areasOfSupport = practitioner.areasOfSupport ?? [];
  const modalities = practitioner.modalities;
  const hasCredentials = Boolean(
    practitioner.credentials?.length || practitioner.significantTraining?.length,
  );
  const hasEditorialDetails = Boolean(
    practitioner.about || areasOfSupport.length || approaches.length || modalities.length,
  );
  const hasPracticalDetails = Boolean(
    practitioner.worksWith?.length ||
      practitioner.languages?.length ||
      practitioner.delivery?.length ||
      locations ||
      safeExternalUrl(practitioner.websiteUrl) ||
      safeExternalUrl(practitioner.instagramUrl),
  );

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
                {practitioner.image ? (
                  <Image
                    src={practitioner.image}
                    alt={practitioner.imageAlt ?? ""}
                    fill
                    priority
                    className="object-cover"
                    style={{
                      objectPosition: portraitObjectPosition(
                        practitioner.imageFocalX,
                        practitioner.imageFocalY,
                      ),
                    }}
                    sizes="(max-width: 1023px) 100vw, 42vw"
                  />
                ) : null}
              </div>
              <div className="flex flex-col justify-center px-5 py-10 sm:px-8 md:px-12 md:py-14 lg:px-16">
                <p className="review-label text-accent">Practitioner profile</p>
                <h1 className="mt-3 font-display text-4xl leading-[1.04] text-balance md:text-6xl">
                  {practitioner.name}
                </h1>
                {practitioner.descriptor ? (
                  <dl className="mt-5">
                    <div>
                      <dt className="review-label text-muted-foreground">Practice or descriptor</dt>
                      <dd className={dataValueClassName}>{practitioner.descriptor}</dd>
                    </div>
                  </dl>
                ) : null}

                {practitioner.yearsActive || locations || practitioner.worksWith?.length ? (
                  <dl className="mt-6 grid border-y border-border sm:grid-cols-3">
                    {practitioner.yearsActive ? (
                      <div className="py-3.5 sm:pr-4">
                        <dt className="review-label text-muted-foreground">Years active</dt>
                        <dd className={dataValueClassName}>{practitioner.yearsActive}</dd>
                      </div>
                    ) : null}
                    {locations ? (
                      <div className="py-3.5 sm:pr-4">
                        <dt className="review-label text-muted-foreground">Based</dt>
                        <dd className={dataValueClassName}>{locations}</dd>
                      </div>
                    ) : null}
                    {practitioner.worksWith?.length ? (
                      <div className="border-t border-border/70 py-3.5 sm:border-t-0 sm:border-l sm:pl-4">
                        <dt className="review-label text-muted-foreground">Works with</dt>
                        <dd className={dataValueClassName}>{practitioner.worksWith.join(" · ")}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}

                {practitioner.summary ? (
                  <p className="mt-6 max-w-xl font-display text-xl leading-8 text-foreground">
                    {practitioner.summary}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link href="/find-a-match" className={buttonVariants({ size: "lg" })}>
                    Begin your enquiry
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            {hasCredentials ? (
              <section
                aria-labelledby="credentials-and-training-heading"
                className="border-t border-border px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:px-12"
              >
                <h2
                  id="credentials-and-training-heading"
                  className="review-label text-muted-foreground"
                >
                  Credentials and significant training
                </h2>
                <dl className="mt-6 border-t border-border/80">
                  {practitioner.credentials?.length ? (
                    <div className={dataRowClassName}>
                      <dt className="review-label text-muted-foreground">Credentials</dt>
                      <dd><CredentialList items={practitioner.credentials} /></dd>
                    </div>
                  ) : null}
                  {practitioner.significantTraining?.length ? (
                    <div className={dataRowClassName}>
                      <dt className="review-label text-muted-foreground">Significant training</dt>
                      <dd><CredentialList items={practitioner.significantTraining} /></dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            ) : null}

            {hasEditorialDetails || hasPracticalDetails ? (
              <div className="grid border-t border-border lg:grid-cols-[1.2fr_0.9fr]">
                {hasEditorialDetails ? (
                  <section
                    aria-label="Editorial details"
                    className="px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:px-12"
                  >
                    {practitioner.about ? (
                      <section aria-labelledby="about-heading">
                        <h2 id="about-heading" className="review-label text-muted-foreground">About</h2>
                        <p className="mt-6 max-w-[36rem] font-display text-xl leading-8 text-foreground">
                          {practitioner.about}
                        </p>
                      </section>
                    ) : null}

                    {areasOfSupport.length ? (
                      <section aria-labelledby="areas-of-support-heading" className="mt-10">
                        <h2 id="areas-of-support-heading" className="review-label text-muted-foreground">Areas of support</h2>
                        <ProfileTagList items={areasOfSupport} />
                      </section>
                    ) : null}

                    {approaches.length ? (
                      <section aria-labelledby="approach-heading" className="mt-10">
                        <h2 id="approach-heading" className="review-label text-muted-foreground">Approach</h2>
                        <ProfileTagList items={approaches} />
                      </section>
                    ) : null}

                    {modalities.length ? (
                      <section aria-labelledby="specific-modalities-heading" className="mt-12">
                        <h2 id="specific-modalities-heading" className="review-label text-muted-foreground">Specific modalities</h2>
                        <ProfileTagList items={modalities} />
                      </section>
                    ) : null}
                  </section>
                ) : null}

                {hasPracticalDetails ? (
                  <section
                    aria-labelledby="practical-heading"
                    className={cn(
                      "border-t border-border px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:border-t-0 lg:border-l lg:px-12",
                      !hasEditorialDetails && "lg:col-span-2",
                    )}
                  >
                    <h2 id="practical-heading" className="review-label text-muted-foreground">Practical</h2>
                    <dl className="mt-6 border-t border-border/80">
                      {practitioner.worksWith?.length ? (
                        <div className={dataRowClassName}>
                          <dt className="review-label text-muted-foreground">Works with</dt>
                          <dd className={dataValueClassName}>{practitioner.worksWith.join(" · ")}</dd>
                        </div>
                      ) : null}
                      {practitioner.languages?.length ? (
                        <div className={dataRowClassName}>
                          <dt className="review-label text-muted-foreground">Languages</dt>
                          <dd className={dataValueClassName}>{practitioner.languages.join(" · ")}</dd>
                        </div>
                      ) : null}
                      {practitioner.delivery?.length ? (
                        <div className={dataRowClassName}>
                          <dt className="review-label text-muted-foreground">In-person or online</dt>
                          <dd className={dataValueClassName}>{practitioner.delivery.join(" · ")}</dd>
                        </div>
                      ) : null}
                      {locations ? (
                        <div className={dataRowClassName}>
                          <dt className="review-label text-muted-foreground">Locations</dt>
                          <dd className={dataValueClassName}>{locations}</dd>
                        </div>
                      ) : null}
                    </dl>

                    {safeExternalUrl(practitioner.websiteUrl) || safeExternalUrl(practitioner.instagramUrl) ? (
                      <div className="mt-8 border-t border-border/80 pt-6">
                        <p className="review-label text-muted-foreground">Links</p>
                        <ul className="mt-4 space-y-3 text-sm">
                          {safeExternalUrl(practitioner.websiteUrl) ? (
                            <li>
                              <a
                                href={safeExternalUrl(practitioner.websiteUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                              >
                                Website <ExternalLink className="size-3.5" aria-hidden="true" />
                              </a>
                            </li>
                          ) : null}
                          {safeExternalUrl(practitioner.instagramUrl) ? (
                            <li>
                              <a
                                href={safeExternalUrl(practitioner.instagramUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                              >
                                Instagram <ExternalLink className="size-3.5" aria-hidden="true" />
                              </a>
                            </li>
                          ) : null}
                        </ul>
                      </div>
                    ) : null}
                  </section>
                ) : null}
              </div>
            ) : null}
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
                <ArrowRight />
              </Link>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}

export default async function PractitionerProfilePage({ params }: PractitionerPageProps) {
  const { slug } = await params;
  const result = await getPublishedPractitionerBySlug(slug);

  if (result.error) {
    return (
      <>
        <div className="mx-auto w-full max-w-[1440px] overflow-x-hidden px-3 py-3 md:px-5 md:py-5">
          <SiteHeader links={navLinks} />
          <main id="main-content" className="mt-3">
            <PractitionerProfileError />
          </main>
          <SiteFooter />
        </div>
      </>
    );
  }

  if (!result.data) notFound();
  return <ProfilePage practitioner={result.data} />;
}
