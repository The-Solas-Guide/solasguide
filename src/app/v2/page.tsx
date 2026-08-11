import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { TrackedPractitionerLink } from "@/components/analytics/tracked-practitioner-link";
import { RegistryPreview } from "@/components/home/registry-preview";
import { RegistryStandards } from "@/components/home/registry-standards";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  description:
    "The Solas Guide is a trusted guide to exceptional wellness practitioners in Bali.",
};

const navLinks = [
  { label: "Why Solas", href: "#why-solas" },
  { label: "Recognition", href: "#recognition" },
  { label: "The Guide", href: "#registry" },
];

const audiences = [
  ["Individuals", "Looking for trusted personal support."],
  ["Couples & Families", "Finding the right person matters."],
  ["Retreat Organisers", "Building programmes with confidence."],
  ["Hotels & Travel Advisors", "Making thoughtful introductions for guests and clients."],
  [
    "Corporate Teams",
    "Identifying practitioners for leadership, wellbeing and organisational programmes.",
  ],
] as const;

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

        <main id="main-content">
          <section
            aria-labelledby="hero-heading"
            className="relative mt-3 min-h-[min(780px,calc(100svh-2rem))] overflow-hidden border border-border bg-card"
          >
            <Image
              src="/images/editorial/solas-hero-pavilion.webp"
              alt=""
              fill
              preload
              className="object-cover object-[68%_center] md:object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/48 to-foreground/15" />
            <div className="relative flex min-h-[min(780px,calc(100svh-2rem))] items-end px-5 pt-24 pb-14 text-background sm:px-8 sm:pb-20 md:p-14 lg:p-20">
              <div className="max-w-4xl">
                <p className="review-label text-white/75" data-reveal>
                  Volume One <span aria-hidden="true">•</span> Bali
                </p>
                <p className="mt-5 font-display text-2xl tracking-tight text-white sm:text-3xl" data-reveal>
                  The Solas Guide
                </p>
                <h1
                  id="hero-heading"
                  className="mt-5 max-w-4xl font-display text-[2.6rem] leading-[0.98] tracking-tight text-balance text-white sm:text-5xl md:text-6xl lg:text-7xl"
                  data-reveal
                  data-reveal-delay="1"
                >
                  Finding someone isn&apos;t difficult. Knowing who to trust is.
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-white sm:text-xl" data-reveal data-reveal-delay="2">
                  A trusted guide to exceptional wellness practitioners.
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-white/80 sm:text-base" data-reveal data-reveal-delay="2">
                  Independently recognised. Editorially profiled. Carefully selected.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row" data-reveal data-reveal-delay="3">
                  <a href="#registry" className={cn(buttonVariants(), "w-full border-background bg-background text-foreground hover:bg-background/85 sm:w-auto")}>
                    Browse the Guide <ArrowDown />
                  </a>
                  <Link href="/find-a-match" className="inline-flex min-h-11 items-center justify-center px-4 text-xs font-semibold uppercase tracking-[0.13em] text-white hover:text-white/75">
                    Need help choosing? <ArrowRight />
                  </Link>
                </div>
              </div>
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
                <p className="review-label text-muted-foreground">Why The Solas Guide Exists</p>
                <h2 className="mt-6 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
                  Wellness has grown rapidly. Trust hasn&apos;t always kept pace.
                </h2>
                <p className="mt-7 max-w-xl text-sm leading-7 text-muted-foreground">
                  The Solas Guide exists to recognise practitioners through a transparent review process that combines independent due diligence with editorial judgement.
                </p>
                <div className="mt-7 space-y-2 border-l border-accent pl-5 text-sm leading-6">
                  <p>We don&apos;t rank practitioners.</p>
                  <p>We don&apos;t sell placements.</p>
                  <p>We don&apos;t accept paid endorsements.</p>
                </div>
                <p className="mt-7 max-w-xl text-sm leading-7 text-muted-foreground">
                  We recognise practitioners whose professional standing, experience and contribution to practice we believe deserve to be known.
                </p>
              </div>
            </div>
            <div className="grid gap-px bg-border sm:grid-cols-3">
              {[["20+", "Founding Practitioners"], ["8", "Practice Disciplines"], ["100%", "Independently Reviewed"]].map(([value, label]) => (
                <div key={label} className="bg-card px-6 py-8 text-center">
                  <p className="font-display text-4xl">{value}</p>
                  <p className="review-label mt-3 text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <RegistryStandards />
          <RegistryPreview />

          <section id="who-its-for" className="border-x border-b border-border bg-card px-5 py-14 sm:px-8 md:px-12 md:py-20 lg:px-16">
            <p className="review-label text-muted-foreground" data-reveal>Who the Guide is for</p>
            <h2 className="mt-5 max-w-3xl font-display text-4xl leading-tight text-balance sm:text-5xl" data-reveal>
              Built for people looking beyond reviews and recommendations.
            </h2>
            <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-5" data-reveal data-reveal-delay="1">
              {audiences.map(([title, copy]) => (
                <article key={title} className="min-h-48 bg-background p-6 lg:min-h-64">
                  <p className="font-display text-2xl leading-tight">{title}</p>
                  <p className="mt-5 text-sm leading-7 text-muted-foreground">{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="questionnaire" className="review-section relative isolate overflow-hidden border-x border-b border-border text-center">
            <Image src="/images/editorial/bali-rice-field-pavilion.webp" alt="" fill sizes="100vw" className="pointer-events-none -z-20 object-cover object-center opacity-[0.26]" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-background/78" />
            <div className="relative mx-auto max-w-3xl px-6" data-reveal>
              <p className="review-label text-muted-foreground">Need help choosing?</p>
              <h2 className="mt-5 font-display text-4xl leading-tight text-balance sm:text-5xl">Not sure who&apos;s the right fit?</h2>
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
                Answer a few short questions and we&apos;ll recommend the practitioners we&apos;d consider if we were making the introduction ourselves.
              </p>
              <Link href="/find-a-match" className={cn(buttonVariants(), "mt-8 w-full sm:w-auto")}>
                Start Questionnaire <ArrowRight />
              </Link>
            </div>
          </section>

          <section id="professional-enquiries" className="border-x border-b border-border bg-foreground px-5 py-16 text-background sm:px-8 md:px-12 md:py-24 lg:px-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end" data-reveal>
              <div>
                <p className="review-label text-background/55">Professional enquiries</p>
                <h2 className="mt-5 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">Looking for something more tailored?</h2>
                <p className="mt-6 max-w-3xl text-sm leading-7 text-background/70">
                  Planning a retreat, leadership programme, private client experience or sourcing practitioners for an organisation?
                </p>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-background/70">
                  We work directly with retreat organisers, hotels, luxury travel advisors and organisations to identify practitioners, shape programmes and make thoughtful introductions.
                </p>
              </div>
              <Link href="/find-a-match" className={cn(buttonVariants(), "w-full border-background bg-background text-foreground hover:bg-background/85 sm:w-auto")}>
                Start a Conversation <ArrowRight />
              </Link>
            </div>
          </section>

          <section id="practitioner-applications" className="border-x border-b border-border bg-card px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end" data-reveal>
              <div>
                <p className="review-label text-muted-foreground">Practitioner applications</p>
                <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">Recognition is by application.</h2>
                <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">
                  Recognition in The Solas Guide is earned through an independent review process.
                </p>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                  Successful applicants become part of an editorial guide committed to professional standards, thoughtful practice and long-term credibility.
                </p>
                <p className="mt-4 text-sm font-semibold">Applications are currently open for the next recognition round.</p>
              </div>
              <TrackedPractitionerLink source="homepage" href="/become-a-practitioner" className={cn(buttonVariants(), "w-full sm:w-auto")}>
                Apply for Recognition <ArrowRight />
              </TrackedPractitionerLink>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
