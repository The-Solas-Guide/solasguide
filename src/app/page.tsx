import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Solas Guide | A considered wellness guide for Bali",
  description:
    "A considered guide to practitioners and restorative experiences for a more personal Bali stay.",
};

const practiceGroups = [
  {
    title: "Grounding and presence",
    items: ["Yoga", "Breathwork", "Meditation", "Sound practices"],
  },
  {
    title: "Mind and nervous system",
    items: ["Somatic practice", "Hypnotherapy", "Counselling", "Facilitation"],
  },
  {
    title: "Body and movement",
    items: ["Bodywork", "Movement", "Women’s health", "Physical practice"],
  },
  {
    title: "Tradition and ceremony",
    items: ["Balinese traditions", "Energy practice", "Ceremony", "Contemplative work"],
  },
] as const;

export default function WebPage() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only fixed top-3 left-3 z-[60] bg-background px-4 py-3 text-sm text-foreground focus:not-sr-only"
      >
        Skip to main content
      </a>
      <div className="mx-auto w-full max-w-[1440px] px-3 py-3 md:px-5 md:py-5">
        <SiteHeader />

        <main id="main-content">
          <section className="relative mt-3 min-h-[min(720px,calc(100svh-2rem))] overflow-hidden border border-border bg-card">
            <Image
              src="/images/solas-imagery/solas-guide-hero.png"
              alt="A quiet garden pavilion in Bali with space for reflection"
              fill
              preload
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 1400px"
            />
            <div className="absolute inset-0 bg-foreground/45" />
            <div className="relative flex min-h-[min(720px,calc(100svh-2rem))] items-end px-7 pt-7 pb-24 text-background md:p-14 lg:p-20">
              <div className="max-w-3xl">
                <p className="review-label text-background/70">
                  A considered wellness guide for Bali
                </p>
                <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.96] tracking-tight md:text-7xl lg:text-8xl">
                  Your Bali wellness stay, shaped around what matters to you.
                </h1>
                <p className="mt-7 max-w-xl text-base leading-7 text-background/82 md:text-lg">
                  Tell The Solas Guide what you are looking for. We review the
                  context, identify relevant directions, and follow up personally.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a
                    href="/find-a-match"
                    className={cn(
                      buttonVariants(),
                      "border-background bg-background text-foreground hover:bg-background/85",
                    )}
                  >
                    Start an enquiry <ArrowRight />
                  </a>
                  <a
                    href="#how-it-works"
                    className="inline-flex min-h-11 items-center gap-2 px-4 text-xs font-semibold uppercase tracking-[0.13em] text-background/85 hover:text-background"
                  >
                    How it works <ArrowDown className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section
            id="about"
            className="mt-10 grid border border-border bg-card md:mt-16 md:grid-cols-[0.95fr_1.05fr]"
          >
            <div className="flex flex-col justify-center px-7 py-16 md:px-10 md:py-24 lg:pr-16">
              <p className="review-label text-muted-foreground">
                What The Solas Guide does
              </p>
              <h2 className="mt-5 max-w-xl font-display text-4xl leading-tight md:text-5xl">
                A thoughtful starting point for a more personal stay.
              </h2>
              <p className="mt-7 max-w-lg text-base leading-8 text-muted-foreground">
                Bali offers an enormous range of practitioners and practices.
                The Solas Guide helps you begin with your circumstances rather
                than asking you to search through an unrestricted directory.
              </p>
              <div className="mt-7 border-l-2 border-accent pl-5">
                <p className="font-display text-xl leading-snug">
                  Context before recommendations.
                </p>
                <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
                  Your dates, location, interests, group, and practical needs
                  give us a clearer basis for a useful personal follow-up.
                </p>
              </div>
            </div>
            <div className="relative min-h-[28rem] overflow-hidden md:min-h-full">
              <Image
                src="/images/solas-imagery/exec-1430506b-6ab6-4bc3-8f24-b0a816abc9a3.png"
                alt="Natural materials in a quiet open-air Balinese interior"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </section>

          <section className="border-t border-border py-16 md:py-24">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="review-label text-muted-foreground">What people explore</p>
                <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
                  Practices considered in context, not as a catalogue.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                You do not need to know the right terminology before making an
                enquiry. A useful brief gives us a place to begin.
              </p>
            </div>
            <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
              {practiceGroups.map((group) => (
                <article key={group.title} className="bg-card p-7 md:min-h-72 md:p-8">
                  <p className="review-label text-muted-foreground">{group.title}</p>
                  <ul className="mt-10 space-y-3">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section id="how-it-works" className="border-t border-border bg-muted/35 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="review-label text-muted-foreground">How it works</p>
              <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
                A personal process in three clear steps.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                The first release captures a structured brief and supports a
                considered follow-up. It does not automate matching or booking.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-px overflow-hidden border border-border bg-border lg:grid-cols-[0.75fr_1.25fr]">
              <div className="relative min-h-[30rem] bg-card sm:min-h-[34rem] lg:min-h-0">
                <Image
                  src="/images/solas-imagery/how-it-works-brief.png"
                  alt="A planning table in a shaded Balinese pavilion"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 32vw"
                />
              </div>
              <div className="grid gap-px bg-border lg:grid-rows-3">
                {[
                  ["01", "Share what you are looking for", "Tell us about your dates, location, interests, group, and anything that would help us understand the stay."],
                  ["02", "We review the context", "The Solas Guide considers the brief and identifies the most relevant direction for a personal follow-up."],
                  ["03", "Continue the conversation", "We get in touch to clarify the details and explain the most useful next step."],
                ].map(([number, title, copy]) => (
                  <article
                    key={number}
                    className="bg-card p-7 sm:p-8 lg:flex lg:flex-col lg:justify-center"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="review-label text-accent">{number}</span>
                      <h3 className="font-display text-2xl leading-tight">{title}</h3>
                    </div>
                    <p className="mt-3 max-w-xl pl-7 text-sm leading-7 text-muted-foreground">{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-3 border-t border-border py-16 md:grid-cols-[0.72fr_0.48fr_0.8fr] md:py-24">
            <div className="relative min-h-[27rem] overflow-hidden md:min-h-[36rem]">
              <Image
                src="/images/solas-imagery/why-solas-pavilion.png"
                alt="A quiet open-air pavilion and tropical garden"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="relative min-h-[20rem] overflow-hidden md:mt-20 md:min-h-[28rem]">
              <Image
                src="/images/solas-imagery/why-solas-planning.png"
                alt="A notebook and travel-planning materials on a table"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </div>
            <div className="flex flex-col justify-end border border-border bg-muted/35 p-8 md:p-10">
              <p className="review-label text-muted-foreground">Why the guide exists</p>
              <h2 className="mt-6 max-w-md font-display text-4xl leading-tight">
                Knowing where to begin is often the hardest part.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">
                The Solas Guide is designed to make the first step feel clearer:
                a structured enquiry, a personal review, and an honest explanation
                of what comes next.
              </p>
            </div>
          </section>

          <section id="practitioners" className="grid border border-border bg-card md:grid-cols-[1fr_1fr]">
            <div className="relative min-h-[28rem] overflow-hidden">
              <Image
                src="/images/solas-imagery/journey-practitioner.png"
                alt="A practitioner preparing a quiet working space"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
              <p className="review-label text-muted-foreground">For practitioners</p>
              <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
                Interested in being considered for The Solas Guide?
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground">
                Share your practice, experience, professional context, and the
                kind of work you do. Submitting an expression of interest does
                not imply approval or publication.
              </p>
              <Button variant="outline" disabled className="mt-8 w-fit">
                Practitioner form coming next
              </Button>
            </div>
          </section>

          <section id="start" className="review-section border-t border-border text-center">
            <div className="mx-auto max-w-3xl px-6">
              <p className="review-label text-muted-foreground">Your starting point</p>
              <h2 className="mt-5 font-display text-5xl leading-tight md:text-6xl">
                Tell us what would make your Bali stay more considered.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-muted-foreground">
                Share a little context about your timing, interests, location, and group. The Solas Guide will review your enquiry personally.
              </p>
              <Link href="/find-a-match" className={cn(buttonVariants(), "mt-8")}>
                Start an enquiry <ArrowRight />
              </Link>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
