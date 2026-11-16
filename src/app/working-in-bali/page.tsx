import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Compass, ListChecks, MapPinned, RefreshCw, Route, Scale, ShieldQuestion } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { membershipNavLinks } from "@/lib/membership-content";
import {
  briefingQuestions,
  briefingRoutes,
  briefingRules,
  briefingSituations,
  workExamples,
  workingInBaliContents,
  workingInBaliDescription,
  workingInBaliDisclaimer,
  workingInBaliTitle,
} from "@/lib/working-in-bali";

export const metadata: Metadata = {
  title: { absolute: workingInBaliTitle },
  description: workingInBaliDescription,
  alternates: { canonical: "/working-in-bali" },
  openGraph: {
    title: workingInBaliTitle,
    description: workingInBaliDescription,
    url: "/working-in-bali",
    images: [{ url: "/images/editorial/bali-rice-field-pavilion.webp", alt: "A pavilion beside rice terraces in Bali" }],
  },
  twitter: {
    title: workingInBaliTitle,
    description: workingInBaliDescription,
    images: ["/images/editorial/bali-rice-field-pavilion.webp"],
  },
};

const sectionIcons = [Scale, ListChecks, MapPinned, Compass, Route, RefreshCw, ShieldQuestion] as const;

export default function WorkingInBaliPage() {
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
          <article className="mt-3 overflow-hidden border border-border bg-card">
            <header className="relative min-h-[32rem] text-background sm:min-h-[38rem]">
              <Image
                src="/images/editorial/bali-rice-field-pavilion.webp"
                alt="A pavilion beside rice terraces in Bali"
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/55 to-foreground/15" />
              <div className="relative flex min-h-[32rem] flex-col justify-end px-6 py-10 sm:min-h-[38rem] sm:px-10 md:px-14 md:py-16 lg:px-16">
                <p className="review-label text-background/70">For practitioners</p>
                <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.98] tracking-tight sm:text-6xl md:text-7xl">Working in Bali</h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-background/85">
                  Questions to ask before you see clients, teach, or host a retreat here. This page does not tell you what you are permitted to do.
                </p>
              </div>
            </header>

            <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
              <nav aria-label="On this page" className="border-b border-border bg-card lg:sticky lg:top-4 lg:self-start lg:border-r lg:border-b-0">
                <p className="review-label px-6 pt-5 text-muted-foreground lg:px-5">On this page</p>
                <ol className="flex gap-2 overflow-x-auto px-4 py-4 lg:block lg:space-y-1 lg:overflow-visible lg:px-3 lg:pb-6">
                  {workingInBaliContents.map((item, index) => {
                    const Icon = sectionIcons[index] ?? Compass;
                    return (
                      <li key={item.href} className="shrink-0 lg:shrink">
                        <a href={item.href} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-3 text-sm whitespace-nowrap lg:flex lg:items-start lg:gap-3 lg:rounded-none lg:border-0 lg:px-2 lg:py-2 lg:whitespace-normal">
                          <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
                          <span className="lg:hidden">{String(index + 1).padStart(2, "0")}</span>
                          {item.label}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <div>
                <p className="border-b border-border px-6 py-5 text-sm leading-6 text-muted-foreground sm:px-10">{workingInBaliDisclaimer}</p>

                <section id="rules" className="scroll-mt-6 px-6 py-12 sm:px-10 md:py-16">
                  <h2 className="font-display text-4xl leading-tight">Two things to understand first.</h2>
                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {briefingRules.map((rule) => (
                      <article key={rule.label} className="border border-border bg-muted/30 p-6">
                        <Scale className="size-5 text-accent" aria-hidden="true" />
                        <p className="review-label mt-5 text-accent">{rule.label}</p>
                        <h3 className="mt-3 font-display text-2xl leading-snug">{rule.title}</h3>
                        <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                          {rule.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <blockquote className="bg-foreground px-6 py-14 text-background sm:px-10 md:py-20">
                  <p className="max-w-4xl font-display text-3xl leading-snug text-balance sm:text-5xl">
                    Don&apos;t only ask: &ldquo;Do I have a KITAS?&rdquo; Ask: &ldquo;Does my permission cover the work I want to do?&rdquo;
                  </p>
                </blockquote>

                <section id="work" className="scroll-mt-6 px-6 py-12 sm:px-10 md:py-16">
                  <h2 className="font-display text-4xl leading-tight">What counts as work?</h2>
                  <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {workExamples.map((example) => (
                      <li key={example} className="border border-border bg-card px-4 py-5 font-display text-xl leading-tight">
                        {example}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">
                    Being paid offshore, doing it only once, doing it for free, or receiving accommodation instead of money does not automatically change the answer. The question is still whether you have permission to do this activity.
                  </p>
                </section>

                <section id="questions" className="scroll-mt-6 border-t border-border px-6 py-12 sm:px-10 md:py-16">
                  <h2 className="font-display text-4xl leading-tight">Six questions, every booking.</h2>
                  <ol className="mt-8 grid gap-3 sm:grid-cols-2">
                    {briefingQuestions.map((question, index) => (
                      <li key={question} className="flex gap-4 border border-border bg-muted/25 p-4">
                        <span className="font-display text-3xl leading-none text-accent">{String(index + 1).padStart(2, "0")}</span>
                        <p className="pt-1 text-foreground">{question}</p>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">
                    If you are unsure about the last question, check before accepting or promoting the work.
                  </p>
                </section>

                <section id="situations" className="scroll-mt-6 border-t border-border px-6 py-12 sm:px-10 md:py-16">
                  <h2 className="font-display text-4xl leading-tight">Find your situation.</h2>
                  <div className="mt-8 grid gap-4 lg:grid-cols-2">
                    {briefingSituations.map((situation, index) => (
                      <article key={situation.title} className="border border-border p-5 sm:p-6">
                        <p className="font-display text-4xl leading-none text-accent/80">{String(index + 1).padStart(2, "0")}</p>
                        <h3 className="mt-4 font-display text-2xl leading-snug">{situation.title}</h3>
                        <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                          {situation.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section id="routes" className="scroll-mt-6 border-t border-border px-6 py-12 sm:px-10 md:py-16">
                  <h2 className="font-display text-4xl leading-tight">Route map.</h2>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                    Broad routes to explore with a qualified adviser. They are not instructions, and they are not a service from The Solas Guide.
                  </p>
                  <ol className="relative mt-10 ml-3 border-l border-accent/40">
                    {briefingRoutes.map((item, index) => (
                      <li key={item.aim} className="relative pb-8 pl-8 last:pb-0">
                        <span className="absolute top-0 -left-3 grid size-6 place-items-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                          {index + 1}
                        </span>
                        <p className="font-display text-2xl leading-snug">{item.aim}</p>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.route}</p>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-8 max-w-3xl text-sm leading-7 text-muted-foreground">
                    There is not a simple freelancer visa that gives a foreign practitioner unrestricted permission to work anywhere in Bali.
                  </p>
                </section>

                <section id="changes" className="scroll-mt-6 border-t border-border px-6 py-12 sm:px-10 md:py-16">
                  <h2 className="font-display text-4xl leading-tight">When something changes, check again.</h2>
                  <div className="mt-6 max-w-3xl space-y-4 text-sm leading-7 text-muted-foreground">
                    <p>
                      Immigration and work rules can change. Your situation can change too. Something that was correct for one situation should not be assumed to apply to another: a new venue, a different type of session, a different employer, your first local client, or your own retreat.
                    </p>
                    <p>
                      If you publicly advertise private sessions, workshops, retreats or other professional activity in Bali, make sure the activity you are promoting is covered by your permission. Don&apos;t ask how anyone would know. Ask whether you are permitted to do what you are advertising.
                    </p>
                  </div>
                </section>

                <section id="advice" className="scroll-mt-6 border-t border-border px-6 py-12 sm:px-10 md:py-16">
                  <h2 className="font-display text-4xl leading-tight">If you need advice.</h2>
                  <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">
                    Speak with a qualified immigration adviser about your own situation. The Solas Guide does not provide immigration, legal, tax or permit advice, and this page does not publish adviser contact details.
                  </p>
                  <p className="mt-8">
                    <Link href="/membership" className="inline-flex min-h-11 items-center text-sm text-foreground underline-offset-4 hover:underline">
                      Practitioner membership
                    </Link>
                  </p>
                </section>

                <footer className="border-t border-border px-6 py-8 sm:px-10">
                  <p className="max-w-3xl text-xs leading-5 text-muted-foreground">{workingInBaliDisclaimer}</p>
                </footer>
              </div>
            </div>
          </article>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
