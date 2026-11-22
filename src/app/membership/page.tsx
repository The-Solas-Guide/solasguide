import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { TrackedPractitionerLink } from "@/components/analytics/tracked-practitioner-link";
import { MembershipDisclosure } from "@/components/membership/disclosure";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import {
  applyHref,
  bookCallHref,
  isPlaceholderFormUrl,
  letters,
  membershipBenefits,
  membershipDescription,
  membershipFaqs,
  membershipFeeLine,
  membershipNavLinks,
  membershipSteps,
  membershipTitle,
  learningOffer,
  learningSessions,
  nextTable,
  practiseWhatsAppHref,
  proofStats,
  SOLAS_LETTER_SIGNUP_FORM_URL,
  SOLAS_TABLE_BOOKING_FORM_URL,
  testimonials,
} from "@/lib/membership-content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: membershipTitle },
  description: membershipDescription,
  alternates: { canonical: "/membership" },
  openGraph: {
    title: membershipTitle,
    description: membershipDescription,
    url: "/membership",
    images: [
      {
        url: "/images/membership/solas-table-lunch.webp",
        width: 1600,
        height: 1200,
        alt: "Guests in conversation at a Solas Table dinner in Bali",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: membershipTitle,
    description: membershipDescription,
    images: ["/images/membership/solas-table-lunch.webp"],
  },
};

const sectionPad = "px-6 py-16 sm:px-10 md:px-14 md:py-20 lg:px-16";

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
        Apply now · USD $350 a year <ArrowRight />
      </TrackedPractitionerLink>
    </div>
  );
}

function FormPlaceholderLink({
  href,
  className,
  children,
  pendingNote,
}: {
  href: string;
  className: string;
  children: ReactNode;
  pendingNote?: string;
}) {
  const pending = isPlaceholderFormUrl(href);
  return (
    <div>
      <a
        href={href}
        className={className}
        {...(pending ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      >
        {children} <ArrowRight />
      </a>
      {pending && pendingNote ? <p className="mt-3 max-w-sm text-xs leading-5 text-muted-foreground">{pendingNote}</p> : null}
    </div>
  );
}

function LetterClose() {
  return (
    <p>
      Working out how to practise in Bali? We can help.{" "}
      <TrackedPractitionerLink
        source="landing"
        href={bookCallHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground underline-offset-4 hover:underline"
      >
        Book a call with Jitesh
      </TrackedPractitionerLink>
      . The next Solas Table is {nextTable.when}, {nextTable.time.toLowerCase()}.{" "}
      <a
        href={SOLAS_TABLE_BOOKING_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground underline-offset-4 hover:underline"
      >
        Book your place
      </a>
      .
    </p>
  );
}

export default function MembershipPage() {

  return (
    <>
      <a
        href="#main-content"
        className="sr-only fixed top-3 left-3 z-[60] border border-border bg-background px-4 py-3 text-sm text-foreground focus:not-sr-only focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        Skip to main content
      </a>
      <div className="mx-auto w-full max-w-[1440px] overflow-x-hidden px-3 py-3 md:px-5 md:py-5">
        <SiteHeader links={membershipNavLinks} />
        <main id="main-content">
          <section className="mt-3 grid overflow-hidden border border-border bg-card lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex min-h-[34rem] flex-col justify-end p-7 sm:p-10 md:p-14 lg:min-h-[44rem] lg:p-16">
              <p className="review-label text-accent">Practitioner membership · Volume One, Bali</p>
              <h1 className="mt-6 max-w-3xl text-balance font-display text-5xl leading-[0.98] tracking-tight md:text-6xl lg:text-7xl">
                Your practice, properly recognised in Bali.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground">
                A selective guide and private community for experienced wellness practitioners. A verified editorial profile, consideration for introductions where there&apos;s a fit, help practising in Bali, and access to Solas Tables. Introductions aren&apos;t guaranteed.
              </p>
              <div className="mt-9">
                <MembershipCalls appearance="default" />
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-foreground">
                About USD 29 a month. Every claim we publish is verified.
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                The application and verification fee is non-refundable, so please include your training, credentials and any evidence you&apos;d like us to check.
              </p>
            </div>
            <div className="relative min-h-[24rem] border-t border-border lg:min-h-0 lg:border-t-0 lg:border-l">
              <Image
                src="/images/membership/solas-table-lunch.webp"
                alt="Guests in conversation at a Solas Table dinner in Bali"
                fill
                priority
                className="object-cover object-[74%_30%]"
                sizes="(max-width: 1024px) 100vw, 48vw"
              />
            </div>
          </section>

          <section aria-labelledby="proof-heading" className="border-x border-b border-foreground bg-foreground text-background">
            <h2 id="proof-heading" className="sr-only">
              Membership in practice
            </h2>
            <ul className="grid sm:grid-cols-2">
              {proofStats.map((stat, index) => (
                <li key={stat.figure} className={cn("px-6 py-12 sm:px-10 md:px-14 md:py-16", index === 1 && "border-t border-background/15 sm:border-t-0 sm:border-l")}>
                  <p className="font-display text-7xl leading-none tracking-tight sm:text-8xl">{stat.figure}</p>
                  <p className="mt-5 max-w-sm text-base leading-7 text-background/80">{stat.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="benefits" className={cn(sectionPad, "scroll-mt-6 border-x border-b border-border bg-card")}>
            <p className="review-label text-muted-foreground">What membership gives you</p>
            <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight md:text-5xl">More than a listing.</h2>
            <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
              {membershipBenefits.map((benefit) => (
                <article key={benefit.title} className="bg-muted/40 p-6 md:p-8">
                  <h3 className="font-display text-2xl leading-tight">{benefit.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{benefit.copy}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 max-w-3xl text-sm leading-7 text-muted-foreground">{membershipFeeLine}</p>
          </section>

          <section id="table" className="scroll-mt-6 grid border-x border-b border-border bg-foreground text-background lg:grid-cols-[1.05fr_0.95fr]">
            <div className={cn(sectionPad, "lg:pr-10")}>
              <p className="review-label text-background/55">The Solas Table</p>
              <h2 className="mt-5 max-w-xl text-balance font-display text-4xl leading-tight md:text-5xl">
                Good food, useful conversation, and a chance to properly meet.
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-7 text-background/70">
                Time away from our own practices to get to know each other&apos;s work and talk honestly about what we&apos;re all building in Bali.
              </p>
              <figure className="mt-8">
                <div className="relative min-h-[18rem] overflow-hidden border border-background/15">
                  <Image
                    src="/images/membership/solas-table-gathering.webp"
                    alt="Practitioners gathered around a table at a Solas Table in Bali"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
                <figcaption className="mt-3 text-xs tracking-wide text-background/65">The Solas Table, Bali</figcaption>
              </figure>
            </div>
            <div id="table-booking-form" className={cn(sectionPad, "border-t border-background/15 lg:border-t-0 lg:border-l")}>
              <p className="review-label text-background/55">Next table</p>
              <p className="mt-4 font-display text-3xl leading-tight">{nextTable.when}</p>
              <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-sm leading-6 text-background/75">
                {[nextTable.time, nextTable.venue].map((item, index) => (
                  <span key={item} className="whitespace-nowrap">
                    {index > 0 ? <span aria-hidden="true">· </span> : null}
                    {item}
                  </span>
                ))}
              </p>
              <p className="mt-4 max-w-sm text-sm leading-7 text-background/85">{nextTable.support}. {nextTable.proceeds}</p>
              <div className="mt-8 bg-background p-6 text-foreground md:p-8">
                <h3 className="font-display text-2xl leading-tight">Book the next Solas Table</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  The booking form confirms your place and takes payment. All proceeds go to Sari Hati School for Special Needs Children.
                </p>
                <div className="mt-6">
                  <FormPlaceholderLink
                    href={SOLAS_TABLE_BOOKING_FORM_URL}
                    className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
                    pendingNote="The booking form is being set up. This button will open it once the form is ready."
                  >
                    Book your place
                  </FormPlaceholderLink>
                </div>
                <p className="mt-5 text-sm leading-7 text-muted-foreground">
                  An intimate gathering every 6–8 weeks.{" "}
                  <TrackedPractitionerLink
                    source="landing"
                    href={bookCallHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    Book a call with Jitesh
                  </TrackedPractitionerLink>{" "}
                  to find out more.
                </p>
              </div>
            </div>
          </section>

          <section id="learning" aria-labelledby="solas-learning" className={cn(sectionPad, "scroll-mt-6 border-x border-b border-border bg-card")}>
            <h2 id="solas-learning" className="max-w-xl text-balance font-display text-4xl leading-tight md:text-5xl">
              Solas Learning
            </h2>
            <div className="mt-8 border-t border-border">
              {learningSessions.map((session, index) => {
                const showLabel = index === 0 || learningSessions[index - 1]?.label !== session.label;
                return (
                  <article key={session.id} className="border-b border-border py-8 md:py-10">
                    {showLabel ? <p className="review-label text-muted-foreground">{session.label}</p> : null}
                    {session.date ? <p className={cn("text-sm text-muted-foreground", showLabel && "mt-3")}>{session.date}</p> : null}
                    <div className={cn((showLabel || session.date) && "mt-4", session.image && "grid grid-cols-[6.75rem_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8")}>
                      {session.image ? (
                        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                          <Image
                            src={session.image.src}
                            alt={session.image.alt}
                            fill
                            className="object-cover object-[center_15%]"
                            sizes="176px"
                          />
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <h3 className={cn("font-display leading-tight", session.image ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl")}>
                          {session.href ? (
                            <Link href={session.href} className="underline-offset-4 hover:underline">
                              {session.title}
                            </Link>
                          ) : (
                            session.title
                          )}
                        </h3>
                        {session.host ? <p className="mt-2 text-sm">with {session.host}</p> : null}
                        {session.summary ? <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{session.summary}</p> : null}
                        {session.followUp ? <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{session.followUp}</p> : null}
                        {session.disclaimer ? <p className="mt-3 max-w-xl text-xs leading-5 text-muted-foreground">{session.disclaimer}</p> : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
              {learningOffer}{" "}
              <TrackedPractitionerLink
                source="landing"
                href={bookCallHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-foreground underline-offset-4 hover:underline"
              >
                Book a call with Jitesh
              </TrackedPractitionerLink>
              <span aria-hidden="true"> · </span>
              <a
                href={practiseWhatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-foreground underline-offset-4 hover:underline"
              >
                WhatsApp
              </a>
            </p>
          </section>

          <section id="letter" className="scroll-mt-6 grid border-x border-b border-border bg-card lg:grid-cols-[1.15fr_0.85fr]">
            <div className={cn(sectionPad, "lg:pr-10")}>
              <p className="review-label text-muted-foreground">Our newsletter</p>
              <h2 className="mt-5 max-w-xl text-balance font-display text-4xl leading-tight md:text-5xl">
                The Solas Guide Letter
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
                Edition 01, September 2026, and Edition 02, October 2026, are past newsletter editions. They have already gone out to members and non-members. Read them here. The newsletter sign-up is for future editions.
              </p>
              <div className="mt-8 border-b border-border">
                {letters.map((letter) => (
                  <MembershipDisclosure key={letter.id} title={letter.summary}>
                    <p className="text-foreground">{letter.sent}</p>
                    {letter.blocks.map((block) => (
                      <div key={block.heading ?? block.paragraphs[0]}>
                        {block.heading ? <h3 className="text-base text-foreground">{block.heading}</h3> : null}
                        <div className={cn("space-y-3", block.heading && "mt-2")}>
                          {block.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                    <LetterClose />
                  </MembershipDisclosure>
                ))}
              </div>
            </div>
            <div id="letter-signup-form" className={cn(sectionPad, "border-t border-border bg-muted/40 lg:border-t-0 lg:border-l")}>
              <p className="review-label text-muted-foreground">Newsletter sign-up</p>
              <h3 className="mt-4 font-display text-3xl leading-tight">Future editions.</h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Subscribe for the next edition of the Letter. We&apos;ll send it when there&apos;s something useful to share, not every week.
              </p>
              <div className="mt-6">
                <FormPlaceholderLink
                  href={SOLAS_LETTER_SIGNUP_FORM_URL}
                  className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
                >
                  Subscribe to the newsletter
                </FormPlaceholderLink>
              </div>
            </div>
          </section>

          <section id="voices" aria-labelledby="membership-voices" className="scroll-mt-6 border-x border-b border-border bg-foreground px-6 py-16 text-background sm:px-10 md:px-14 md:py-24 lg:px-16">
            <h2 id="membership-voices" className="review-label text-background/55">
              From founding practitioners
            </h2>
            <figure className="mt-8 max-w-4xl">
              <blockquote>
                <p className="font-display text-4xl leading-[1.15] text-balance sm:text-5xl md:text-6xl">{testimonials[0].quote}</p>
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span aria-hidden="true" className="grid size-14 place-items-center rounded-full border border-background/30 font-display text-lg">{testimonials[0].initials}</span>
                <span className="text-sm">{testimonials[0].attribution}</span>
              </figcaption>
            </figure>
            <div className="mt-14 grid gap-12 border-t border-background/15 pt-12 md:grid-cols-2">
              {testimonials.slice(1).map((testimonial) => (
                <figure key={testimonial.quote}>
                  <blockquote>
                    <p className="font-display text-2xl leading-snug sm:text-3xl">{testimonial.quote}</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-4">
                    <span aria-hidden="true" className="grid size-12 place-items-center rounded-full border border-background/30 font-display">{testimonial.initials}</span>
                    <span className="text-sm">{testimonial.attribution}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className={cn(sectionPad, "border-x border-b border-border bg-card")}>
            <div className="max-w-3xl">
              <p className="review-label text-muted-foreground">Why I&apos;m building it</p>
              <blockquote className="mt-6">
                <p className="font-display text-3xl leading-snug text-balance md:text-4xl">
                  There are some brilliant practitioners in Bali. Some are very visible. Others have been quietly doing excellent work for years.
                </p>
                <p className="mt-6 text-base leading-8 text-muted-foreground">
                  I want The Solas Guide to make it easier for people to understand who is doing good work, and to give practitioners another way to be recognised beyond their own marketing. There is real value in us knowing each other, sharing what we know and helping each other build stronger practices. That&apos;s really what I&apos;m trying to build.
                </p>
                <footer className="mt-6 text-sm text-foreground">Jitesh</footer>
              </blockquote>
            </div>
          </section>

          <section id="join" className={cn(sectionPad, "scroll-mt-6 border-x border-b border-border bg-muted/35")}>
            <div className="max-w-3xl">
              <p className="review-label text-muted-foreground">How membership works</p>
              <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">A clear process.</h2>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
              {membershipSteps.map(([number, title, copy]) => (
                <article key={number} className="border-t-2 border-t-accent bg-card p-6 md:p-8">
                  <p className="review-label text-accent">{number}</p>
                  <h3 className="mt-4 font-display text-2xl leading-tight">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{copy}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 border-b border-border">
              {membershipFaqs.map((item) => (
                <MembershipDisclosure key={item.question} title={item.question}>
                  <p>{item.answer}</p>
                </MembershipDisclosure>
              ))}
            </div>
          </section>

          <section className="review-section border-x border-b border-border bg-foreground px-6 text-background">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-4xl leading-tight md:text-6xl">Start with a conversation.</h2>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-background/70">
                USD $350 a year, about USD 29 a month. Every claim we publish is verified. The application and verification fee is non-refundable.
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
