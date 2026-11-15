import type { Metadata } from "next";
import Link from "next/link";
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
  },
  twitter: {
    title: workingInBaliTitle,
    description: workingInBaliDescription,
  },
};

const sectionPad = "scroll-mt-6 border-t border-border px-6 py-12 sm:px-10 md:px-14 md:py-16 lg:px-16";

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
          <article className="mt-3 border border-border bg-card">
            <header className="px-6 py-14 sm:px-10 md:px-14 md:py-20 lg:px-16">
              <p className="review-label text-muted-foreground">For practitioners</p>
              <h1 className="mt-5 max-w-3xl text-balance font-display text-5xl leading-[0.98] tracking-tight md:text-6xl">
                Working in Bali
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
                A practical reference if you are considering clients, workshops, retreats or other work in Bali. It sets out questions to ask. It does not tell you what you are permitted to do.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-foreground">{workingInBaliDisclaimer}</p>
              <nav aria-label="On this page" className="mt-10 border border-border bg-muted/40 p-5 sm:p-6">
                <p className="review-label text-muted-foreground">On this page</p>
                <ol className="mt-4 grid gap-1 sm:grid-cols-2">
                  {workingInBaliContents.map((item, index) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="flex min-h-11 items-center gap-3 text-sm text-foreground underline-offset-4 hover:underline"
                      >
                        <span className="review-label text-accent">{String(index + 1).padStart(2, "0")}</span>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </header>

            <section id="rules" className={sectionPad}>
              <h2 className="max-w-2xl font-display text-4xl leading-tight">Two things to understand first.</h2>
              <div className="mt-8 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-2">
                {briefingRules.map((rule) => (
                  <article key={rule.label} className="bg-card p-6 md:p-8">
                    <p className="review-label text-accent">{rule.label}</p>
                    <h3 className="mt-4 font-display text-2xl leading-snug">{rule.title}</h3>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                      {rule.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="work" className={sectionPad}>
              <h2 className="font-display text-4xl leading-tight">What counts as work?</h2>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {workExamples.map((example) => (
                  <li key={example} className="border border-border bg-muted/30 px-4 py-3 text-sm text-foreground">
                    {example}
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">
                Being paid offshore, doing it only once, doing it for free, or receiving accommodation instead of money does not automatically change the answer. The question is still whether you have permission to do this activity.
              </p>
            </section>

            <section id="questions" className={sectionPad}>
              <h2 className="font-display text-4xl leading-tight">Six questions, every booking.</h2>
              <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {briefingQuestions.map((question, index) => (
                  <li key={question} className="border border-border px-4 py-4">
                    <span className="review-label text-accent">{String(index + 1).padStart(2, "0")}</span>
                    <p className="mt-2 text-foreground">{question}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">
                If you are unsure about the last question, check before accepting or promoting the work.
              </p>
            </section>

            <section id="situations" className={sectionPad}>
              <h2 className="font-display text-4xl leading-tight">Find your situation.</h2>
              <div className="mt-8 grid gap-6">
                {briefingSituations.map((situation, index) => (
                  <article key={situation.title} className="border border-border p-6 md:p-8">
                    <h3 className="font-display text-2xl leading-snug">
                      <span className="review-label mr-3 text-accent">{String(index + 1).padStart(2, "0")}</span>{" "}
                      {situation.title}
                    </h3>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                      {situation.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="routes" className={sectionPad}>
              <h2 className="font-display text-4xl leading-tight">Route map.</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                These are broad routes to explore with a qualified adviser. They are not instructions, and they are not a service from The Solas Guide.
              </p>
              <ul className="mt-8 grid gap-4">
                {briefingRoutes.map((item) => (
                  <li key={item.aim} className="border-l border-accent pl-4">
                    <p className="text-foreground">{item.aim}</p>
                    <p className="mt-1 text-sm leading-7 text-muted-foreground">{item.route}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">
                There is not a simple freelancer visa that gives a foreign practitioner unrestricted permission to work anywhere in Bali.
              </p>
            </section>

            <section id="changes" className={sectionPad}>
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

            <section id="advice" className={sectionPad}>
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

            <footer className="border-t border-border px-6 py-8 sm:px-10 md:px-14 lg:px-16">
              <p className="max-w-3xl text-xs leading-5 text-muted-foreground">{workingInBaliDisclaimer}</p>
            </footer>
          </article>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
