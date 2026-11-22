import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { RegistryPreview } from "@/components/home/registry-preview";
import { RegistryStandards } from "@/components/home/registry-standards";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { buttonVariants } from "@/components/ui/button";
import { programmeOffers, programmeProof } from "@/lib/programme-proof";
import { discoveryCall, needHelpChoosing } from "@/lib/public-journeys";
import { getAbsoluteUrl, homepageDescription, homepageMetadata } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = homepageMetadata;

const navLinks = [
  { label: "Why Solas", href: "#why-solas" },
  { label: "Recognition", href: "#recognition" },
  { label: "The Guide", href: "/practitioners" },
  { label: "Programmes", href: "/programmes" },
];

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "The Solas Guide",
      url: getAbsoluteUrl("/"),
      email: "info@solassolas.com",
      description: homepageDescription,
    },
    {
      "@type": "WebSite",
      name: "The Solas Guide",
      url: getAbsoluteUrl("/"),
      description: homepageDescription,
    },
  ],
};

export default function HomePageV2() {
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
        <RevealObserver />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />

        <main id="main-content">
          <section
            aria-labelledby="hero-heading"
            className="relative mt-3 min-h-[min(780px,calc(100svh-2rem))] overflow-hidden border border-border bg-card"
          >
            <Image
              src="/images/editorial/solas-hero-pavilion.webp"
              alt="A person preparing a mat in an open wooden pavilion above a green valley"
              fill
              preload
              className="object-cover object-[68%_center] md:object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/48 to-foreground/15" />
            <div className="relative flex min-h-[min(780px,calc(100svh-2rem))] items-end px-5 pt-24 pb-14 text-background sm:px-8 sm:pb-20 md:p-14 lg:p-20">
              <div className="max-w-4xl">
                <p className="review-label text-background" data-reveal>
                  Volume One <span aria-hidden="true">•</span> Southeast Asia
                </p>
                <p className="mt-5 font-display text-2xl tracking-tight text-background sm:text-3xl" data-reveal>
                  The Solas Guide
                </p>
                <h1
                  id="hero-heading"
                  className="mt-5 max-w-4xl font-display text-[2.35rem] leading-[0.98] tracking-tight text-balance text-background sm:text-5xl md:text-6xl lg:text-7xl"
                  data-reveal
                  data-reveal-delay="1"
                >
                  Finding someone isn&apos;t difficult. Knowing who to trust is.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-background sm:text-lg" data-reveal data-reveal-delay="2">
                  An independent guide to exceptional wellness practitioners.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row" data-reveal data-reveal-delay="3">
                  <a
                    href={discoveryCall.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants(), "w-full border-background bg-background text-foreground hover:bg-background/85 sm:w-auto")}
                  >
                    Book a discovery call <ArrowUpRight />
                  </a>
                  <Link href="/practitioners" className={cn(buttonVariants({ variant: "outline" }), "w-full border-background/80 bg-transparent text-background hover:bg-background/10 sm:w-auto")}>
                    Explore the Guide
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section id="programmes" className="border-x border-b border-border bg-muted px-5 py-16 text-foreground sm:px-8 md:px-12 md:py-20 lg:px-16 lg:py-24">
            <p className="review-label text-accent">Programmes</p>
            <h2 className="mt-4 max-w-3xl font-display text-3xl leading-tight text-balance sm:text-4xl md:text-5xl">
              Wellness programmes, designed and delivered.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-foreground">
              For travel advisors, retreat organisers, venues and professional communities.
            </p>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {programmeOffers.map(([title, line]) => (
                <a
                  key={title}
                  href={discoveryCall.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 flex-col justify-center border border-border bg-card px-5 py-6 text-foreground transition-colors hover:bg-background"
                >
                  <span className="font-display text-2xl leading-tight">{title}</span>
                  <span className="mt-3 text-sm leading-6">{line}</span>
                </a>
              ))}
            </div>
            <p className="mt-8">
              <Link href="/programmes#method" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-foreground underline decoration-foreground/40 underline-offset-4 hover:text-accent hover:decoration-accent">
                How a programme comes together
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </p>
            <ul className="mt-14 grid gap-8 lg:grid-cols-3 lg:gap-10">
              {programmeProof.map(({ src, alt, line, width, height }) => (
                <li key={alt} className="flex items-start gap-4">
                  <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className={alt.includes("Ubud") ? "h-14 w-auto max-w-32 shrink-0 object-contain" : "h-10 w-auto max-w-32 shrink-0 object-contain"}
                  />
                  <p className="text-sm leading-6 text-foreground">{line}</p>
                </li>
              ))}
            </ul>
            <div className="mt-14 flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-start sm:gap-6">
              <a
                href={discoveryCall.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
              >
                Book a discovery call <ArrowUpRight />
              </a>
              <Link href="/programmes#contact" className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 text-sm text-foreground underline decoration-foreground/40 underline-offset-4 hover:text-accent hover:decoration-accent sm:w-auto sm:justify-start">
                Tell us about your plans
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section id="why-solas" className="border-x border-b border-border">
            <div className="grid gap-px bg-border lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-[24rem] overflow-hidden bg-card lg:min-h-[42rem]" data-reveal>
                <Image
                  src="/images/editorial/weathered-threshold.webp"
                  alt="A rain-darkened teak doorway opening onto a stone threshold"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
              <div className="flex flex-col justify-center bg-muted/35 p-7 sm:p-10 lg:p-16" data-reveal data-reveal-delay="1">
                <p className="review-label text-accent">Why The Solas Guide Exists</p>
                <h2 className="mt-4 max-w-xl font-display text-3xl leading-tight sm:text-4xl md:text-5xl">
                  Wellness has grown rapidly. Trust hasn&apos;t always kept pace.
                </h2>
                <p className="mt-6 max-w-xl text-sm leading-7 text-foreground">
                  The Solas Guide is an independent editorial guide to exceptional wellness practitioners across Southeast Asia.
                </p>
                <p className="mt-4 max-w-xl text-sm leading-7 text-foreground">
                  We recognise practitioners through a careful review process, verify the claims we publish, and introduce their work to people looking for someone they can trust.
                </p>
                <div className="mt-7 space-y-2 border-l border-accent pl-5 text-sm leading-6">
                  <p>We don&apos;t rank practitioners.</p>
                  <p>We don&apos;t sell rankings or endorsements.</p>
                  <p>We keep full editorial independence.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-px bg-border sm:grid-cols-3">
              {[["20+", "Founding Practitioners"], ["8", "Practice Disciplines"], ["100%", "Independently Reviewed"]].map(([value, label]) => (
                <div key={label} className="bg-card px-6 py-8 text-center">
                  <p className="font-display text-4xl">{value}</p>
                  <p className="review-label mt-3 text-accent">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <RegistryStandards />
          <RegistryPreview />

          <section id="questionnaire" className="review-section relative isolate overflow-hidden border-x border-b border-border text-center">
            <Image src="/images/editorial/bali-rice-field-pavilion.webp" alt="" fill sizes="100vw" className="pointer-events-none -z-20 object-cover object-center opacity-[0.26]" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-background/78" />
            <div className="relative mx-auto max-w-3xl px-6" data-reveal>
              <p className="review-label text-accent">Need help choosing?</p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-balance sm:text-4xl md:text-5xl">Not sure who to speak to?</h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-foreground">
                Tell us what you are looking for. We&apos;ll review your enquiry and suggest practitioners worth considering.
              </p>
              <Link href={needHelpChoosing.href} className={cn(buttonVariants(), "mt-8 w-full sm:w-auto")}>
                {needHelpChoosing.label} <ArrowRight />
              </Link>
            </div>
          </section>

        </main>

        <SiteFooter />
      </div>
    </>
  );
}
