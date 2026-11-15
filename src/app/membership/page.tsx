import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { TrackedPractitionerLink } from "@/components/analytics/tracked-practitioner-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const bookCallHref = "https://cal.com/solassolas/30min-private-conversation";
const applyHref = "https://tally.so/r/XxQvJz";

const membershipBenefits = [
  "A profile that does your work justice: written by Solas, with your professional claims checked.",
  "Introductions where there's a fit: travel advisors, retreat organisers and organisations already come to us for practitioners, speakers and panellists.",
  "Practitioners worth knowing: private dinners and gatherings in Bali, with time to properly meet.",
  "Help with the business side: masterclasses and briefings on pricing, positioning, partnerships and working legally in Indonesia.",
] as const;

const testimonials: { quote: string; attribution: string; detail?: string }[] = [
  {
    quote: "I've had the same offers for international communities online, but it's never felt right. This one does.",
    detail:
      "Opportunities to run Face Reading Soirées in Bali legally, plus connecting with incredible specialist therapists.",
    attribution: "Melanie Midegs, Founding Practitioner",
  },
  {
    quote:
      "After being in Bali for so many years, I’m very discerning about where I give my time and energy. I wanted to be part of a quality community and surround myself with people who work with integrity.",
    attribution: "Melanie Midegs, Founding Practitioner",
  },
  {
    quote: "Made warm connections. I enjoy my talks with Jit.",
    attribution: "Rajiv Arapurakal, Founding Practitioner",
  },
  {
    quote: "Beautiful connection with great people.",
    attribution: "Dirk Hamelijnck, Founding Practitioner",
  },
];

const membershipSteps = [
  ["01", "Call with Jitesh", "Start with a conversation about your work."],
  ["02", "Application and payment", "Apply and pay USD 350 a year. The application fee is non-refundable."],
  ["03", "We verify claims", "We check the training, credentials and evidence you share."],
  ["04", "Profile published", "We publish your profile with verifiable claims only."],
] as const;

export const metadata: Metadata = {
  title: {
    absolute: "Practitioner membership · The Solas Guide, Bali",
  },
  description:
    "A membership for experienced wellness practitioners in Bali, expanding across Southeast Asia, with verified profiles, introductions and community.",
  alternates: { canonical: "/membership" },
  openGraph: {
    title: "Practitioner membership · The Solas Guide, Bali",
    description:
      "A membership for experienced wellness practitioners in Bali, expanding across Southeast Asia, with verified profiles, introductions and community.",
    url: "/membership",
  },
  twitter: {
    title: "Practitioner membership · The Solas Guide, Bali",
    description:
      "A membership for experienced wellness practitioners in Bali, expanding across Southeast Asia, with verified profiles, introductions and community.",
  },
};

function MembershipCalls({ appearance }: { appearance: "default" | "inverse" }) {
  const primaryClass =
    appearance === "inverse"
      ? cn(buttonVariants({ size: "lg" }), "w-full border-background bg-background text-foreground hover:bg-background/85 sm:w-auto")
      : cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto");
  const secondaryClass =
    appearance === "inverse"
      ? cn(
          buttonVariants({ size: "lg", variant: "outline" }),
          "w-full border-background/40 bg-transparent text-background hover:bg-background/10 sm:w-auto",
        )
      : cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto");

  return (
    <div className={cn("flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap", appearance === "inverse" && "sm:justify-center")}>
      <TrackedPractitionerLink
        source="landing"
        href={bookCallHref}
        target="_blank"
        rel="noopener noreferrer"
        className={primaryClass}
      >
        Book a call with Jitesh <ArrowRight />
      </TrackedPractitionerLink>
      <TrackedPractitionerLink
        source="landing"
        href={applyHref}
        target="_blank"
        rel="noopener noreferrer"
        className={secondaryClass}
      >
        Apply now · USD 350 a year <ArrowRight />
      </TrackedPractitionerLink>
    </div>
  );
}

export default function MembershipPage() {
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
          <section className="mt-3 grid overflow-hidden border border-border bg-card lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex min-h-[36rem] flex-col justify-end p-7 sm:p-10 md:p-14 lg:min-h-[44rem] lg:p-16">
              <p className="review-label text-accent">Practitioner membership · Volume One, Bali</p>
              <h1 className="mt-6 max-w-2xl font-display text-5xl leading-[0.98] tracking-tight md:text-7xl">
                For practitioners serious about their work.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground">
                The Solas Guide is an independent guide and private community for experienced wellness practitioners, starting in Bali. Members get a profile that represents their work properly, introductions where there&apos;s a fit, and time with practitioners worth knowing.
              </p>
              <div className="mt-9">
                <MembershipCalls appearance="default" />
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
                Every claim we publish is verified. The application fee is non-refundable, so please include your training, credentials and any evidence you&apos;d like us to check.
              </p>
            </div>
            <div className="relative min-h-[28rem] border-t border-border lg:min-h-0 lg:border-t-0 lg:border-l">
              <Image
                src="/images/solas-imagery/why-solas-pavilion.png"
                alt="A quiet open-air pavilion surrounded by tropical greenery"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 48vw"
              />
            </div>
          </section>

          <section className="border-x border-b border-border bg-muted/30 px-6 py-16 sm:px-10 md:px-14 md:py-24 lg:px-16">
            <div className="max-w-3xl">
              <h2 className="font-display text-4xl leading-tight md:text-5xl">What membership includes.</h2>
              <ul className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground">
                {membershipBenefits.map((benefit) => (
                  <li key={benefit} className="border-l border-accent pl-5">
                    {benefit}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm leading-7 text-muted-foreground">
                Your membership pays for your profile to be researched, written and kept up to date, for gatherings and masterclasses, and for the time it takes to make good introductions. It never buys a ranking, an endorsement or what we write: we keep full editorial independence and only publish what we can verify.
              </p>
            </div>
          </section>

          <section aria-labelledby="membership-voices" className="border-x border-b border-border bg-card px-6 py-16 sm:px-10 md:px-14 md:py-24 lg:px-16">
            <div className="max-w-3xl">
              <h2 id="membership-voices" className="review-label text-muted-foreground">
                From founding practitioners
              </h2>
              <div className="mt-8 grid gap-8">
                {testimonials.map((testimonial) => (
                  <figure key={testimonial.quote} className="border-l border-accent pl-5">
                    <blockquote className="text-base leading-7 text-foreground">
                      <p>{testimonial.quote}</p>
                      {testimonial.detail ? (
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{testimonial.detail}</p>
                      ) : null}
                    </blockquote>
                    <figcaption className="mt-3 text-sm leading-6 text-foreground">{testimonial.attribution}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          <section className="border-x border-b border-border bg-muted/30 px-6 py-16 sm:px-10 md:px-14 md:py-24 lg:px-16">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
              <div>
                <p className="review-label text-muted-foreground">Volume One: Bali, expanding across Southeast Asia</p>
                <h2 className="mt-5 max-w-md font-display text-4xl leading-tight md:text-5xl">
                  Experienced practitioners, starting in Bali.
                </h2>
              </div>
              <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
                {[
                  ["Based in Bali", "Your practice is currently based in Bali."],
                  ["Working across the region", "You practise in Bali, or regularly across Southeast Asia as the Guide expands."],
                ].map(([title, copy]) => (
                  <article key={title} className="bg-card p-7 md:p-9">
                    <Check className="size-5 text-accent" />
                    <h3 className="mt-6 font-display text-2xl">{title}</h3>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="border-x border-b border-border bg-card px-6 py-16 sm:px-10 md:px-14 md:py-24 lg:px-16">
            <div className="mx-auto max-w-5xl">
              <div className="max-w-2xl">
                <p className="review-label text-muted-foreground">What happens next</p>
                <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">
                  Membership follows a clear process.
                </h2>
              </div>
              <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
                {membershipSteps.map(([number, title, copy]) => (
                  <article key={number} className="bg-background p-7 md:p-9">
                    <p className="review-label text-accent">{number}</p>
                    <h3 className="mt-5 font-display text-2xl leading-tight">{title}</h3>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="review-section border-x border-b border-border bg-foreground px-6 text-background">
            <div className="mx-auto max-w-3xl text-center">
              <p className="review-label text-background/55">Practitioner membership</p>
              <h2 className="mt-5 font-display text-4xl leading-tight md:text-6xl">Book a call, or apply.</h2>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-background/65">
                Membership is USD 350 a year. Every claim we publish is verified, and the application fee is non-refundable.
              </p>
              <div className="mt-8">
                <MembershipCalls appearance="inverse" />
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
