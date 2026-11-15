import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { TrackedPractitionerLink } from "@/components/analytics/tracked-practitioner-link";
import { MembershipDisclosure } from "@/components/membership/disclosure";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import {
  applyHref,
  bookCallHref,
  briefingQuestions,
  briefingRoutes,
  briefingRules,
  briefingSituations,
  isBusinessWorkshopUpcoming,
  isPlaceholderFormUrl,
  letters,
  membershipBenefits,
  membershipDescription,
  membershipFaqs,
  membershipFeeLine,
  membershipNavLinks,
  membershipSteps,
  membershipTitle,
  nextTable,
  practiseWhatsAppHref,
  proofStats,
  SOLAS_LETTER_SIGNUP_FORM_URL,
  SOLAS_TABLE_WAITLIST_FORM_URL,
  testimonials,
  workshopReserveHref,
  workshopSchedule,
  workshopTakeaways,
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
        width: 777,
        height: 1036,
        alt: "Practitioners in conversation around a lunch table at a Solas Table in Bali",
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
        Apply now · USD 350 a year <ArrowRight />
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
  pendingNote: string;
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
      {pending ? <p className="mt-3 max-w-sm text-xs leading-5 text-muted-foreground">{pendingNote}</p> : null}
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
      <a href={SOLAS_TABLE_WAITLIST_FORM_URL} className="text-foreground underline-offset-4 hover:underline">
        Join the waitlist
      </a>
      .
    </p>
  );
}

export default function MembershipPage() {
  const workshopUpcoming = isBusinessWorkshopUpcoming();

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
                alt="Practitioners in conversation around a lunch table at a Solas Table in Bali"
                fill
                priority
                className="object-cover object-[center_30%]"
                sizes="(max-width: 1024px) 100vw, 48vw"
              />
            </div>
          </section>

          <section aria-labelledby="proof-heading" className="border-x border-b border-border bg-muted/40">
            <h2 id="proof-heading" className="sr-only">
              Membership in practice
            </h2>
            <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              {proofStats.map((stat) => (
                <li key={stat.detail} className="bg-muted/40 px-6 py-7 sm:px-8">
                  <p className="font-display text-4xl leading-none text-foreground">{stat.figure}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{stat.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="practise" className={cn(sectionPad, "scroll-mt-6 border-x border-b border-border bg-accent text-accent-foreground")}>
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16">
              <div>
                <p className="review-label text-accent-foreground/70">Practising in Bali</p>
                <h2 className="mt-5 max-w-xl text-balance font-display text-4xl leading-tight md:text-5xl">
                  We can help you practise in Bali.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-accent-foreground/85">
                  Running sessions, events or retreats here raises real questions. If you&apos;re working out how to practise in Bali, talk to us and we&apos;ll help you find the right way forward.
                </p>
                <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
                  <TrackedPractitionerLink
                    source="landing"
                    href={bookCallHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ size: "lg" }), "w-full border-background bg-background text-foreground hover:bg-background/85 sm:w-auto")}
                  >
                    Book a call with Jitesh <ArrowRight />
                  </TrackedPractitionerLink>
                  <a
                    href={practiseWhatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ size: "lg", variant: "outline" }),
                      "w-full border-background/40 bg-transparent text-background hover:bg-background/10 sm:w-auto",
                    )}
                  >
                    Get in touch on WhatsApp <ArrowRight />
                  </a>
                </div>
              </div>
              <blockquote className="border-t border-accent-foreground/25 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                <p className="review-label text-accent-foreground/70">Why it matters</p>
                <p className="mt-4 font-display text-2xl leading-snug text-balance">
                  &ldquo;Don&apos;t only ask: &lsquo;Do I have a KITAS?&rsquo; Ask: &lsquo;Does my permission cover the work I want to do?&rsquo;&rdquo;
                </p>
                <footer className="mt-4 text-sm leading-6 text-accent-foreground/75">From our Working in Bali briefing.</footer>
              </blockquote>
            </div>
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
            <div id="table-waitlist-form" className={cn(sectionPad, "border-t border-background/15 lg:border-t-0 lg:border-l")}>
              <p className="review-label text-background/55">Next table</p>
              <p className="mt-4 font-display text-3xl leading-tight">{nextTable.when}</p>
              <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-sm leading-6 text-background/75">
                {[nextTable.seats, nextTable.time, nextTable.venue, nextTable.members, nextTable.nonMembers].map((item, index) => (
                  <span key={item} className="whitespace-nowrap">
                    {index > 0 ? <span aria-hidden="true">· </span> : null}
                    {item}
                  </span>
                ))}
              </p>
              <div className="mt-8 bg-background p-6 text-foreground md:p-8">
                <h3 className="font-display text-2xl leading-tight">Join the waitlist for the next Solas Table</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Seats are limited. We&apos;ll be in touch to confirm yours. {nextTable.paymentNote}
                </p>
                <div className="mt-6">
                  <FormPlaceholderLink
                    href={SOLAS_TABLE_WAITLIST_FORM_URL}
                    className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
                    pendingNote="The waitlist form is being set up. This button will open it once the form is ready."
                  >
                    Join the waitlist
                  </FormPlaceholderLink>
                </div>
                <p className="mt-5 text-sm leading-7 text-muted-foreground">
                  For now, members join free and non-members can attend for IDR 350k. Tables will become members-only, and members may pay to attend.{" "}
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

          <section id="working-in-bali" className={cn(sectionPad, "scroll-mt-6 border-x border-b border-border bg-card")}>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="review-label text-accent">Open briefing · The Solas Guide × Trident Treehouse</p>
                <h2 className="mt-5 text-balance font-display text-4xl leading-tight md:text-5xl">Practising wellness in Bali.</h2>
                <p className="mt-6 text-base leading-8 text-muted-foreground">
                  A practical reference following our practitioner briefing with Trident Treehouse, so you have something simple to return to when you are considering clients, workshops, retreats or other work in Bali.
                </p>
              </div>
              <Image
                src="/images/membership/trident-treehouse.png"
                alt="Trident Treehouse"
                width={931}
                height={303}
                className="h-auto w-44 shrink-0 bg-black px-3 py-2 sm:w-52"
              />
            </div>
            <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
              {briefingRules.map((rule) => (
                <article key={rule.label} className="bg-card p-6 md:p-8">
                  <p className="review-label text-accent">{rule.label}</p>
                  <h3 className="mt-4 font-display text-2xl leading-snug">{rule.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{rule.copy}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 border-b border-border">
              <MembershipDisclosure title="Six questions, every booking">
                <ol className="grid gap-3 sm:grid-cols-2">
                  {briefingQuestions.map((question, index) => (
                    <li key={question} className="border border-border bg-muted/30 px-4 py-3 text-foreground">
                      <span className="review-label text-accent">{String(index + 1).padStart(2, "0")}</span>
                      <span className="mt-2 block">{question}</span>
                    </li>
                  ))}
                </ol>
                <p>If you&apos;re unsure about the last question, check before accepting or promoting the work.</p>
              </MembershipDisclosure>
              <MembershipDisclosure title="Find your situation">
                <div className="grid gap-6">
                  {briefingSituations.map((situation, index) => (
                    <article key={situation.title}>
                      <h3 className="text-base text-foreground">
                        {String(index + 1).padStart(2, "0")} {situation.title}
                      </h3>
                      <div className="mt-2 space-y-3">
                        {situation.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </MembershipDisclosure>
              <MembershipDisclosure title="Route map">
                <ul className="grid gap-4">
                  {briefingRoutes.map((item) => (
                    <li key={item.aim} className="border-l border-accent pl-4">
                      <p className="text-foreground">{item.aim}</p>
                      <p className="mt-1">{item.route}</p>
                    </li>
                  ))}
                </ul>
                <p>There is not a simple freelancer visa that gives a foreign practitioner unrestricted permission to work anywhere in Bali.</p>
              </MembershipDisclosure>
              <MembershipDisclosure title="When something changes, check again">
                <p>
                  Immigration and work rules can change. Your situation can change too. Something that was correct for one situation should not automatically be assumed to apply to another: a new venue, a different type of session, a different employer, your first local client, or your own retreat.
                </p>
                <p>
                  If you publicly advertise private sessions, workshops, retreats or other professional activity in Bali, make sure the activity you are promoting is covered by your permission. Don&apos;t ask how anyone would know. Ask whether you are permitted to do what you are advertising.
                </p>
              </MembershipDisclosure>
              <MembershipDisclosure title="Need advice for your own situation?">
                <p>Speak with a qualified immigration adviser. This briefing is general information only.</p>
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
                  .
                </p>
              </MembershipDisclosure>
            </div>
            <p className="mt-6 max-w-3xl text-xs leading-5 text-muted-foreground">
              General information only, not personal immigration, legal, tax or professional advice. Information updated 28 September 2026.
            </p>
          </section>

          <section id="learning" className={cn(sectionPad, "scroll-mt-6 border-x border-b border-border bg-muted/35")}>
            <p className="review-label text-muted-foreground">Practitioner learning</p>
            {workshopUpcoming ? (
              <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
                <div>
                  <p className="text-sm text-foreground">Live workshop</p>
                  <h2 className="mt-3 max-w-2xl text-balance font-display text-4xl leading-tight md:text-5xl">
                    The Business Sustainability Blueprint
                  </h2>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
                    A practical, live workshop with Nikki Heyder to help you understand what needs attention in your wellness business, and decide what to do next. Leave with clarity, perspective, direction and one practical next step.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-foreground">{workshopSchedule}</p>
                  <a
                    href={workshopReserveHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ size: "lg", variant: "outline" }), "mt-8 w-full sm:w-auto")}
                  >
                    Reserve your place <ArrowRight />
                  </a>
                </div>
                <div className="border border-border bg-card p-6 md:p-8">
                  <h3 className="font-display text-2xl">Nikki Heyder</h3>
                  <p className="mt-2 text-sm text-foreground">Psychotherapist and wellness business strategist</p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    Nikki has spent more than 14 years building, running and advising wellness businesses. She has worked in clinical rehabilitation and outpatient care, built a private practice, owned health food restaurants, run retreats internationally, sold products and published a book. Today she advises founders, from newly qualified practitioners to health food cafés, wellness hotels and established supplement brands.
                  </p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    In this session she introduces a four-part diagnostic for assessing business sustainability. You apply it to your own practice, see where your time could make the greatest difference, and decide what to focus on next. It starts with your definition of success.
                  </p>
                </div>
              </div>
            ) : (
              <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight md:text-5xl">Past sessions</h2>
            )}
            {workshopUpcoming ? null : (
              <ul className="mt-6 max-w-3xl space-y-3 text-sm leading-7 text-muted-foreground">
                <li>The Business Sustainability Blueprint, with Nikki Heyder. {workshopSchedule}</li>
                <li>
                  Practising Wellness in Bali, with Trident Treehouse.{" "}
                  <a href="#working-in-bali" className="text-foreground underline-offset-4 hover:underline">
                    Read the open briefing
                  </a>
                  .
                </li>
              </ul>
            )}
            {workshopUpcoming ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {workshopTakeaways.map(([title, copy]) => (
                  <article key={title} className="border border-border bg-card p-5">
                    <h3 className="font-display text-xl">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
                  </article>
                ))}
              </div>
            ) : null}
            {workshopUpcoming ? (
              <div className="mt-10 max-w-3xl">
                <h3 className="font-display text-2xl">Past sessions</h3>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                  <li>
                  Practising Wellness in Bali, with Trident Treehouse.{" "}
                  <a href="#working-in-bali" className="text-foreground underline-offset-4 hover:underline">
                    Read the open briefing
                  </a>
                  .
                </li>
                </ul>
              </div>
            ) : null}
          </section>

          <section id="letter" className="scroll-mt-6 grid border-x border-b border-border bg-card lg:grid-cols-[1.15fr_0.85fr]">
            <div className={cn(sectionPad, "lg:pr-10")}>
              <p className="review-label text-muted-foreground">The Solas Letter</p>
              <h2 className="mt-5 max-w-xl text-balance font-display text-4xl leading-tight md:text-5xl">
                Notes from Bali&apos;s wellness community.
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
                Edition 01, September 2026, and Edition 02, October 2026, have already gone out to members and non-members. Read them here. The sign-up is for future editions.
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
              <p className="review-label text-muted-foreground">Get the Letter</p>
              <h3 className="mt-4 font-display text-3xl leading-tight">Future editions.</h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Sign up to receive the next Letter. We&apos;ll send it when there&apos;s something useful to share, not every week.
              </p>
              <div className="mt-6">
                <FormPlaceholderLink
                  href={SOLAS_LETTER_SIGNUP_FORM_URL}
                  className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
                  pendingNote="The sign-up form for future editions is being set up. This button will open it once the form is ready."
                >
                  Get the Letter
                </FormPlaceholderLink>
              </div>
            </div>
          </section>

          <section id="voices" aria-labelledby="membership-voices" className={cn(sectionPad, "scroll-mt-6 border-x border-b border-border bg-muted/35")}>
            <div className="max-w-3xl">
              <h2 id="membership-voices" className="review-label text-muted-foreground">
                From founding practitioners
              </h2>
              <div className="mt-8 grid gap-8">
                {testimonials.map((testimonial) => (
                  <figure key={testimonial.quote} className="border-l border-accent pl-5">
                    <blockquote className="text-base leading-7 text-foreground">
                      <p>{testimonial.quote}</p>
                    </blockquote>
                    <figcaption className="mt-3 text-sm leading-6 text-foreground">{testimonial.attribution}</figcaption>
                  </figure>
                ))}
              </div>
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
                USD 350 a year, about USD 29 a month. Every claim we publish is verified. The application and verification fee is non-refundable.
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
