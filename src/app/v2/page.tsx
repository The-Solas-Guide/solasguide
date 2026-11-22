import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RegistryPreview } from "@/components/home/registry-preview";
import { RegistryStandards } from "@/components/home/registry-standards";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { buttonVariants } from "@/components/ui/button";
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

const audiences: readonly { title: string; copy: string; href?: string }[] = [
  { title: "Individuals", copy: "Trusted support for your wellbeing, health and personal development." },
  { title: "Couples & Families", copy: "Finding the right person for the people who matter most." },
  { title: "Retreat Organisers", copy: "Building thoughtful programmes with trusted practitioners.", href: "/programmes" },
  { title: "Hotels & Travel Advisors", copy: "Making considered introductions for guests and clients.", href: "/programmes" },
  { title: "Organisations", copy: "Finding practitioners for leadership, wellbeing and team programmes.", href: "/programmes" },
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
                <p className="review-label text-white/75" data-reveal>
                  Volume One <span aria-hidden="true">•</span> Southeast Asia
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
                <p className="mt-7 max-w-2xl text-base leading-8 text-white sm:text-lg" data-reveal data-reveal-delay="2">
                  An independent guide to exceptional wellness practitioners, and the team that designs, staffs and delivers wellness programmes for travel advisors, retreat organisers, venues and professional communities.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row" data-reveal data-reveal-delay="3">
                  <a
                    href={discoveryCall.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants(), "w-full border-background bg-background text-foreground hover:bg-background/85 sm:w-auto")}
                  >
                    Book a discovery call <ArrowRight />
                  </a>
                  <Link href="/practitioners" className={cn(buttonVariants({ variant: "outline" }), "w-full border-white/50 bg-transparent text-white hover:bg-white/10 sm:w-auto")}>
                    Explore the Guide
                  </Link>
                </div>
                <Link href={needHelpChoosing.href} className="mt-4 inline-flex min-h-11 items-center text-sm text-white/80 underline-offset-4 hover:text-white hover:underline">
                  {needHelpChoosing.label}
                </Link>
              </div>
            </div>
          </section>

          <section id="programmes" className="border-x border-b border-border bg-foreground px-5 py-14 text-background sm:px-8 md:px-12 md:py-20 lg:px-16">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_auto] lg:items-end">
              <div>
                <p className="review-label text-background/55">For travel advisors, retreat organisers, venues and professional communities</p>
                <h2 className="mt-5 max-w-3xl font-display text-4xl leading-tight text-balance sm:text-5xl">
                  We design, staff and can run the wellness programme for your group.
                </h2>
                <p className="mt-6 max-w-2xl text-sm leading-7 text-background/75">
                  Tell us about the group, the dates and what you want people to take away. We shape the sessions, select practitioners from the Guide, and can coordinate and direct the programme on site.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                <a
                  href={discoveryCall.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants(), "w-full border-background bg-background text-foreground hover:bg-background/85 sm:w-auto lg:w-full")}
                >
                  Book a 30-minute discovery call <ArrowRight />
                </a>
                <Link
                  href="/programmes"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full border-background/40 bg-transparent text-background hover:bg-background/10 sm:w-auto lg:w-full")}
                >
                  See how a programme comes together
                </Link>
              </div>
            </div>
          </section>

          <section aria-label="Recent work" className="border-x border-b border-border bg-card px-5 py-10 sm:px-8 md:px-12 lg:px-16">
            <p className="review-label text-muted-foreground">Recently</p>
            <ul className="mt-4 max-w-2xl space-y-2 text-sm leading-7 text-muted-foreground">
              <li>Arranged and facilitated a YPO retreat, December 2024</li>
              <li>At the Ubud Writers &amp; Readers Festival with Solas Guide members</li>
            </ul>
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
                  The Solas Guide is an independent editorial guide to exceptional wellness practitioners across Southeast Asia.
                </p>
                <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
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
              {audiences.map((audience) => {
                const card = (
                  <>
                    <p className="font-display text-2xl leading-tight">{audience.title}</p>
                    <p className="mt-5 text-sm leading-7 text-muted-foreground">{audience.copy}</p>
                  </>
                );
                return audience.href ? (
                  <Link key={audience.title} href={audience.href} className="min-h-48 bg-background p-6 transition-colors hover:bg-muted/40 lg:min-h-64">
                    {card}
                  </Link>
                ) : (
                  <article key={audience.title} className="min-h-48 bg-background p-6 lg:min-h-64">
                    {card}
                  </article>
                );
              })}
            </div>
          </section>

          <section id="questionnaire" className="review-section relative isolate overflow-hidden border-x border-b border-border text-center">
            <Image src="/images/editorial/bali-rice-field-pavilion.webp" alt="" fill sizes="100vw" className="pointer-events-none -z-20 object-cover object-center opacity-[0.26]" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-background/78" />
            <div className="relative mx-auto max-w-3xl px-6" data-reveal>
              <p className="review-label text-muted-foreground">Need help choosing?</p>
              <h2 className="mt-5 font-display text-4xl leading-tight text-balance sm:text-5xl">Not sure who to speak to?</h2>
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
                Tell us a little about what you are looking for.
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                We&apos;ll review your enquiry personally and suggest the practitioners we think may be worth considering.
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
