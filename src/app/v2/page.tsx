import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RecognisedVenues } from "@/components/home/recognised-venues";
import { RegistryPreview } from "@/components/home/registry-preview";
import { RegistryStandards } from "@/components/home/registry-standards";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrackedPractitionerLink } from "@/components/analytics/tracked-practitioner-link";

export const metadata: Metadata = {
  description:
    "The Solas Guide is a trusted way to discover independently recognised, editorially profiled wellness practitioners in Bali — then make thoughtful introductions.",
};

const heroFacilitators = [
  {
    name: "Riza Sukman",
    image: "/images/people/riza-sukman.jpg",
    position: "object-[50%_20%]",
  },
  {
    name: "Pablo Castro",
    image: "/images/people/pablo-castro.jpg",
    position: "object-[50%_18%]",
  },
  {
    name: "Wayan Marcus Wistika",
    image: "/images/people/marcus-wistika.jpg",
    position: "object-[72%_center]",
  },
  {
    name: "Pak Merta Ada",
    image: "/images/people/pak-merta-ada.jpg",
    position: "object-[50%_22%]",
  },
  {
    name: "Cat Wheeler",
    image: "/images/people/cat-wheeler.jpg",
    position: "object-left",
  },
  {
    name: "Ibu Jero",
    image: "/images/people/ibu-jero.jpg",
    position: "object-[50%_18%]",
  },
] as const;

const v2NavLinks = [
  { label: "The Registry", href: "#registry" },
  { label: "Recognition", href: "#recognition" },
];

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
        <SiteHeader links={v2NavLinks} />
        <RevealObserver />

        <main id="main-content">
          <section
            aria-labelledby="v2-hero-heading"
            className="relative mt-3 min-h-[min(760px,calc(100svh-2rem))] overflow-hidden border border-border bg-card"
          >
            <div
              className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
              aria-hidden="true"
            >
              {heroFacilitators.map((facilitator, index) => (
                <div key={facilitator.name} className="relative min-h-0 overflow-hidden">
                  <Image
                    src={facilitator.image}
                    alt=""
                    fill
                    preload={index < 2}
                    className={cn(
                      "object-cover motion-safe:scale-[1.02] motion-safe:transition-transform motion-safe:duration-[1.4s] motion-safe:ease-out",
                      facilitator.position,
                    )}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  />
                </div>
              ))}
            </div>
            <div
              className="absolute inset-0 bg-foreground/25"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-foreground/10"
              aria-hidden="true"
            />
            <div className="relative flex min-h-[min(760px,calc(100svh-2rem))] items-end px-5 pt-7 pb-20 text-background sm:px-7 sm:pb-24 md:p-14 lg:p-20">
              <div className="max-w-3xl">
                <p
                  className="font-display text-2xl tracking-tight text-white sm:text-3xl md:text-4xl"
                  data-reveal
                >
                  The Solas Guide
                </p>
                <h1
                  id="v2-hero-heading"
                  className="mt-5 max-w-3xl font-display text-[2.5rem] leading-[0.98] tracking-tight text-balance text-white sm:mt-6 sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[0.96]"
                  data-reveal
                  data-reveal-delay="1"
                >
                  Bali&apos;s most recognised wellness facilitators
                </h1>
                <p
                  className="mt-6 max-w-2xl text-sm leading-7 text-white/85 sm:mt-7 sm:text-base md:text-lg"
                  data-reveal
                  data-reveal-delay="2"
                >
                  Independently recognised. Editorially profiled. Introduced
                  through a single trusted desk.
                </p>
                <div
                  className="mt-8 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center"
                  data-reveal
                  data-reveal-delay="3"
                >
                  <a
                    href="#registry"
                    className={cn(
                      buttonVariants(),
                      "w-full border-background bg-background text-foreground hover:bg-background/85 sm:w-auto",
                    )}
                  >
                    Explore the Registry <ArrowDown />
                  </a>
                  <a
                    href="#recognition"
                    className="inline-flex min-h-11 items-center justify-center gap-2 border-b border-transparent px-4 text-xs font-semibold uppercase tracking-[0.13em] text-white/85 transition-colors hover:border-white/40 hover:text-white sm:justify-start"
                  >
                    How recognition works
                  </a>
                </div>
              </div>
            </div>
          </section>

          <RegistryStandards />

          <RegistryPreview />

          <section id="why-solas" className="border-x border-b border-border">
            <div className="grid gap-px bg-border md:grid-cols-[0.72fr_0.48fr_0.8fr]">
              <div
                className="relative min-h-[22rem] overflow-hidden bg-card sm:min-h-[27rem] md:min-h-[36rem]"
                data-reveal
              >
                <Image
                  src="/images/people/riza-sukman.jpg"
                  alt="Portrait of a Solas facilitator"
                  fill
                  className="object-cover object-[50%_20%]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div
                className="relative min-h-[18rem] overflow-hidden bg-card sm:min-h-[20rem] md:mt-20 md:min-h-[28rem]"
                data-reveal
                data-reveal-delay="1"
              >
                <Image
                  src="/images/people/ibu-jero.jpg"
                  alt="Portrait of a Solas facilitator"
                  fill
                  className="object-cover object-[50%_18%]"
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
                  Finding the right person should not feel like guesswork.
                </h2>
                <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">
                  Online searches can give you names. What is harder to find is
                  confidence — knowing someone has been recognised for the depth
                  of their work, and that the introduction has been considered.
                </p>
                <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                  The Solas Guide helps you discover facilitators you can approach
                  with trust. When a setting, experience or retreat plan is useful,
                  we bring that in around the introduction — not instead of it.
                </p>
              </div>
            </div>
          </section>

          <section
            id="who-its-for"
            className="border-x border-b border-border bg-card px-5 py-14 sm:px-8 md:px-12 md:py-20 lg:px-16"
          >
            <div
              className="flex flex-col justify-between gap-6 md:flex-row md:items-end"
              data-reveal
            >
              <div>
                <p className="review-label text-muted-foreground">Who it is for</p>
                <h2 className="mt-5 max-w-2xl font-display text-3xl leading-tight text-balance sm:text-4xl md:text-5xl">
                  When you want the right person, not another list of names.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                Whether you are coming for yourself or organising for a group,
                tell us what you need. We use that context to guide a thoughtful
                introduction.
              </p>
            </div>

            <div
              className="mt-10 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2"
              data-reveal
              data-reveal-delay="1"
            >
              {[
                {
                  label: "For your time in Bali",
                  title: "Looking for someone whose work fits what you need.",
                  copy: "Whether you are travelling alone, as a couple or with friends, share the kind of support or practice you are hoping to find. We will recommend from the recognised Solas register.",
                  items: [
                    "Recognised facilitators across modalities",
                    "Clear context before you decide",
                    "A considered introduction when you are ready",
                  ],
                },
                {
                  label: "For your group or retreat",
                  title: "Planning meaningful time around the right people.",
                  copy: "Share the purpose, group and timing. We will help you consider the facilitators first — then the places and experiences that can support what you are creating.",
                  items: [
                    "Facilitators suited to your group",
                    "Settings that can hold the work",
                    "Thoughtful introductions for organisers",
                  ],
                },
              ].map((audience) => (
                <article key={audience.label} className="bg-background p-7 sm:p-9 lg:p-12">
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
          </section>

          <RecognisedVenues />

          <section className="border-x border-b border-border bg-card px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-16">
            <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]" data-reveal>
              <div>
                <p className="review-label text-muted-foreground">For practitioners in Bali</p>
                <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
                  Practise here? We would like to hear from you.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
                  If you are based in Bali or work here regularly, share a short
                  professional introduction. We review each one carefully before
                  considering anyone for the Solas register.
                </p>
              </div>
              <TrackedPractitionerLink source="homepage" href="/become-a-practitioner" className={buttonVariants()}>
                Share your practice <ArrowRight />
              </TrackedPractitionerLink>
            </div>
          </section>

          <section id="start" className="review-section border-x border-b border-border text-center">
            <div className="mx-auto max-w-3xl px-6">
              <p className="review-label text-muted-foreground">Begin with what you need</p>
              <h2 className="mt-5 font-display text-3xl leading-tight text-balance sm:text-5xl md:text-6xl">
                Who are you hoping to find?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-muted-foreground">
                Tell us what kind of facilitator, support or experience you have
                in mind. We will review your answers, recommend a considered
                direction from the Solas register, and help make the introduction.
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
