import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { GuideIndex } from "@/components/home/guide-index";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Solas Guide | Personal wellness introductions in Bali",
  description:
    "Tell us what you need in Bali. The Solas Guide personally reviews your enquiry, recommends relevant wellness practitioners, and helps make the introduction.",
};

const practiceGroups = [
  {
    title: "Mindfulness and rest",
    items: ["Meditation", "Breathwork", "Sound practices", "Restorative experiences"],
  },
  {
    title: "Personal support",
    items: ["Somatic practice", "Counselling", "Facilitation", "Private sessions"],
  },
  {
    title: "Body and movement",
    items: ["Yoga", "Bodywork", "Movement", "Physical practice"],
  },
  {
    title: "Local practices",
    items: ["Balinese traditions", "Ceremony", "Energy practice", "Contemplative work"],
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
                  Human wellness guidance in Bali
                </p>
                <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.96] tracking-tight md:text-7xl lg:text-8xl">
                  Tell us what you need. We’ll help you find trusted people in Bali.
                </h1>
                <p className="mt-7 max-w-xl text-base leading-7 text-background/82 md:text-lg">
                  The Solas Guide is a curated wellness network and concierge
                  service for Bali. Share your plans and priorities, and we will
                  personally recommend relevant practitioners and help make the
                  introduction.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a
                    href="/find-a-match"
                    className={cn(
                      buttonVariants(),
                      "border-background bg-background text-foreground hover:bg-background/85",
                    )}
                  >
                    Tell us what you need <ArrowRight />
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

          <GuideIndex />

          <section
            id="about"
            className="mt-10 grid border border-border bg-card md:mt-16 md:grid-cols-[0.95fr_1.05fr]"
          >
            <div className="flex flex-col justify-center px-7 py-16 md:px-10 md:py-24 lg:pr-16">
              <p className="review-label text-muted-foreground">
                What The Solas Guide does
              </p>
              <h2 className="mt-5 max-w-xl font-display text-4xl leading-tight md:text-5xl">
                A human alternative to hours of searching.
              </h2>
              <p className="mt-7 max-w-lg text-base leading-8 text-muted-foreground">
                Finding credible wellness support in Bali can mean comparing
                websites, social accounts, and recommendations without knowing
                who is relevant to you. The Solas Guide starts with your needs,
                then draws on our local knowledge and practitioner network.
              </p>
              <div className="mt-7 border-l-2 border-accent pl-5">
                <p className="font-display text-xl leading-snug">
                  Your context comes first.
                </p>
                <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
                  Whether you are travelling alone, planning a retreat, or
                  organising support for a group, your timing, location,
                  interests, and practical needs shape the recommendation.
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
                <p className="review-label text-muted-foreground">What you can ask about</p>
                <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
                  Start with what you want help with—not a list of names.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                These are examples, not a fixed catalogue. You do not need to
                know the right terminology before making an enquiry.
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
                One enquiry. A human review. A considered introduction.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Solas does not use automated matching. We review each enquiry
                and use our knowledge of the network to decide which
                direction may be most relevant.
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
                  ["01", "Tell us what you need", "Share your dates, location, interests, group, budget, and anything else that will help us understand what you are planning."],
                  ["02", "We review your enquiry", "We consider your circumstances and draw on the Solas network to identify practitioners or experiences that may be relevant."],
                  ["03", "Solas helps make the introduction", "We follow up to clarify the next step and, where there is a suitable direction, connect you with the relevant people."],
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
                A name is not the same as a useful recommendation.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">
                The right choice depends on why you are coming, what kind of
                support you want, and who you feel comfortable working with.
                Solas adds human judgement and local context before making an
                introduction.
              </p>
            </div>
          </section>

          <section id="practitioners" className="grid border border-border bg-card md:grid-cols-[1fr_1fr]">
            <div className="relative min-h-[28rem] overflow-hidden">
              <Image
                src="/images/solas-imagery/journey-practitioner.png"
                alt="A person arranging cushions in a quiet open-air space"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
              <p className="review-label text-muted-foreground">For practitioners</p>
              <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
                Interested in joining the Solas practitioner network?
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground">
                Tell us about your practice, experience, and the people you are
                best placed to support. This is an expression of interest in the
                curated network, not an application for a public profile or a
                guarantee of referrals.
              </p>
              <Button variant="outline" disabled className="mt-8 w-fit">
                Practitioner enquiries coming soon
              </Button>
            </div>
          </section>

          <section id="start" className="review-section border-t border-border text-center">
            <div className="mx-auto max-w-3xl px-6">
              <p className="review-label text-muted-foreground">Begin with your needs</p>
              <h2 className="mt-5 font-display text-5xl leading-tight md:text-6xl">
                Planning wellness support in Bali?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-muted-foreground">
                Tell us what you are planning, who it is for, and what matters
                most. We will review your enquiry and follow up with a clear
                next step.
              </p>
              <Link href="/find-a-match" className={cn(buttonVariants(), "mt-8")}>
                Tell us what you need <ArrowRight />
              </Link>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
