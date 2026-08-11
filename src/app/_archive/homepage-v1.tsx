import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { GuideIndex } from "@/components/home/guide-index";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrackedPractitionerLink } from "@/components/analytics/tracked-practitioner-link";

export const metadata: Metadata = {
  description:
    "Tell us about your Bali trip. The Solas Guide recommends relevant practitioners, venues, experiences and events, then helps make the introductions.",
};

export default function ArchivedHomePageV1() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only fixed top-3 left-3 z-[60] border border-border bg-background px-4 py-3 text-sm text-foreground focus:not-sr-only focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        Skip to main content
      </a>
      <div className="mx-auto w-full max-w-[1440px] overflow-x-hidden px-3 py-3 md:px-5 md:py-5">
        <SiteHeader />
        <RevealObserver />

        <main id="main-content">
          <section className="relative mt-3 min-h-[min(720px,calc(100svh-2rem))] overflow-hidden border border-border bg-card">
            <Image
              src="/images/solas-imagery/solas-guide-hero-pavilion.jpg"
              alt="An open-air pavilion beside a reflecting pool in a tropical garden"
              fill
              preload
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 1400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/10" />
            <div className="relative flex min-h-[min(720px,calc(100svh-2rem))] items-end px-5 pt-7 pb-20 text-background sm:px-7 sm:pb-24 md:p-14 lg:p-20">
              <div className="max-w-3xl">
                <p className="review-label text-background/70" data-reveal>
                  A curated network for Bali
                </p>
                <h1
                  className="mt-5 max-w-3xl font-display text-[2.75rem] leading-[0.98] tracking-tight text-balance sm:mt-6 sm:text-5xl md:text-7xl lg:text-8xl lg:leading-[0.96]"
                  data-reveal
                  data-reveal-delay="1"
                >
                  Your time in Bali, shaped around what matters to you.
                </h1>
                <p
                  className="mt-6 max-w-2xl text-sm leading-7 text-background/82 sm:mt-7 sm:text-base md:text-lg"
                  data-reveal
                  data-reveal-delay="2"
                >
                  The Solas Guide is an online network of curated practitioners,
                  venues, experiences and events. Tell us about your trip, and we
                  will review your plans, recommend relevant options and help make
                  the introductions.
                </p>
                <div
                  className="mt-8 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center"
                  data-reveal
                  data-reveal-delay="3"
                >
                  <a
                    href="/find-a-match"
                    className={cn(
                      buttonVariants(),
                      "w-full border-background bg-background text-foreground hover:bg-background/85 sm:w-auto",
                    )}
                  >
                    Build Your Retreat <ArrowRight />
                  </a>
                  <a
                    href="#how-it-works"
                    className="inline-flex min-h-11 items-center justify-center gap-2 border-b border-transparent px-4 text-xs font-semibold uppercase tracking-[0.13em] text-background/85 transition-colors hover:border-background/40 hover:text-background sm:justify-start"
                  >
                    How it works <ArrowDown className="size-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <GuideIndex />

          <section
            id="who-its-for"
            className="relative isolate overflow-hidden border-x border-b border-border bg-muted/25 px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-16"
          >
            <Image
              src="/images/solas-imagery/solas-guide-hero.png"
              alt=""
              fill
              sizes="100vw"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 object-cover object-center opacity-[0.28] grayscale-[0.2] saturate-75"
            />
            <div
              className="pointer-events-none absolute inset-0 z-0 bg-muted/65"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div
                className="flex flex-col justify-between gap-6 md:flex-row md:items-end"
                data-reveal
              >
                <div>
                  <p className="review-label text-muted-foreground">Who it is for</p>
                  <h2 className="mt-5 max-w-2xl font-display text-3xl leading-tight text-balance sm:text-4xl md:text-5xl">
                    A more personal way to experience Bali.
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                  Start with what you want from the trip. We will use that context
                  to shape the recommendations around you or your group.
                </p>
              </div>

              <div
                className="mt-10 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2"
                data-reveal
                data-reveal-delay="1"
              >
                {[
                  {
                    label: "For your trip",
                    title: "For travellers looking for something more personal.",
                    copy: "Whether you are travelling alone, as a couple or with friends, tell us how you want your time in Bali to feel and what you hope to get from it.",
                    items: ["Personal wellness support", "Distinctive places to stay", "Experiences shaped around your interests"],
                  },
                  {
                    label: "For your team",
                    title: "For businesses planning meaningful time together.",
                    copy: "Bring us the purpose, group, timing and budget for your retreat or offsite. We will help shape the people, setting and experiences around it.",
                    items: ["Company and leadership retreats", "Venues for private groups", "Practitioners and guided experiences"],
                  },
                ].map((audience) => (
                  <article key={audience.label} className="bg-card p-7 sm:p-9 lg:p-12">
                    <p className="review-label text-accent">{audience.label}</p>
                    <h3 className="mt-5 max-w-lg font-display text-3xl leading-tight md:text-4xl">
                      {audience.title}
                    </h3>
                    <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
                      {audience.copy}
                    </p>
                    <ul className="mt-8 space-y-3 border-t border-border pt-6">
                      {audience.items.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm leading-6">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            id="how-it-works"
            className="border-x border-b border-border bg-muted/35 px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-16"
          >
            <div className="mx-auto max-w-3xl text-center" data-reveal>
              <p className="review-label text-muted-foreground">How it works</p>
              <h2 className="mt-5 font-display text-3xl leading-tight text-balance sm:text-4xl md:text-5xl">
                Tell us about your trip. We shape the recommendations.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Your answers give us the context to recommend people, places
                and experiences that fit what you are planning.
              </p>
            </div>
            <div
              className="mx-auto mt-12 grid max-w-5xl gap-px overflow-hidden border border-border bg-border lg:grid-cols-[0.75fr_1.25fr]"
              data-reveal
              data-reveal-delay="1"
            >
              <div className="relative min-h-[30rem] bg-card sm:min-h-[34rem] lg:min-h-0">
                <Image
                  src="/images/experiences/leadership-offsite.jpg"
                  alt="A facilitated group session overlooking the ocean in Bali"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 32vw"
                />
              </div>
              <div className="grid gap-px bg-border lg:grid-rows-3">
                {[
                  ["01", "Tell us about your trip", "Share who is coming, your dates, interests, location, budget and what you want to get from your time in Bali."],
                  ["02", "We shape your recommendations", "We review your answers and draw on the Solas network to recommend relevant practitioners, venues, experiences and events."],
                  ["03", "We facilitate the introductions", "Once you have your recommendations, we help connect you with the right people to take the next step."],
                ].map(([number, title, copy]) => (
                  <article
                    key={number}
                    className="bg-card p-7 sm:p-8 lg:flex lg:flex-col lg:justify-center"
                  >
                    <span className="review-label text-accent">{number}</span>
                    <h3 className="mt-3 font-display text-2xl leading-tight">{title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="why-solas" className="border-x border-b border-border">
            <div className="grid gap-px bg-border md:grid-cols-[0.72fr_0.48fr_0.8fr]">
            <div
              className="relative min-h-[22rem] overflow-hidden bg-card sm:min-h-[27rem] md:min-h-[36rem]"
              data-reveal
            >
              <Image
                src="/images/solas-imagery/why-solas-pavilion.png"
                alt="A quiet open-air pavilion and tropical garden"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div
              className="relative min-h-[18rem] overflow-hidden bg-card sm:min-h-[20rem] md:mt-20 md:min-h-[28rem]"
              data-reveal
              data-reveal-delay="1"
            >
              <Image
                src="/images/solas-imagery/why-solas-planning.png"
                alt="A notebook and travel-planning materials on a table"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </div>
            <div
              className="flex flex-col justify-end bg-muted/35 p-8 md:p-10 lg:p-12"
              data-reveal
              data-reveal-delay="2"
            >
              <p className="review-label text-muted-foreground">Why The Solas Guide</p>
              <h2 className="mt-6 max-w-md font-display text-4xl leading-tight">
                Your trip should not feel like someone else&apos;s itinerary.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">
                Search results can give you names. Useful recommendations need
                context: why you are coming, who you are travelling with, your
                timing, budget and what you want to experience.
              </p>
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                The Solas Guide brings that context together with a curated Bali
                network, helping turn a long list of possibilities into a trip
                shaped around you.
              </p>
            </div>
            </div>
          </section>

          <section className="border-x border-b border-border bg-card px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-16">
            <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]" data-reveal>
              <div>
                <p className="review-label text-muted-foreground">For practitioners in Bali</p>
                <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
                  Let us know about your practice.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
                  If you are based in Bali or work here regularly, share a short professional introduction for The Solas Guide to consider for relevant future conversations.
                </p>
              </div>
              <TrackedPractitionerLink source="homepage" href="/become-a-practitioner" className={buttonVariants()}>
                Become a practitioner <ArrowRight />
              </TrackedPractitionerLink>
            </div>
          </section>

          <section id="start" className="review-section border-x border-b border-border text-center">
            <div className="mx-auto max-w-3xl px-6">
              <p className="review-label text-muted-foreground">Begin with your trip</p>
              <h2 className="mt-5 font-display text-3xl leading-tight text-balance sm:text-5xl md:text-6xl">
                What do you want from your time in Bali?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-muted-foreground">
                Tell us what you are planning, who it is for and what matters
                most. We will review your answers, shape personalised
                recommendations and help make the introductions.
              </p>
              <Link
                href="/find-a-match"
                className={cn(buttonVariants(), "mt-8 w-full sm:w-auto")}
                data-reveal
                data-reveal-delay="1"
              >
                Build Your Retreat <ArrowRight />
              </Link>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
