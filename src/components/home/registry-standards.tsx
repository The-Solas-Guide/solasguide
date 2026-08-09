import Link from "next/link";
import { ArrowRight } from "lucide-react";

const standards = [
  {
    title: "Recognised by Solas",
    summary: "Every credential confirmed.",
    copy: "Pathway A credentials checked directly with the issuing body — Gottman, ICF, EMDR Europe, Yoga Alliance, IFS, BACP, APS. Pathway B claims reviewed by a tradition-knowledgeable panel member.",
  },
  {
    title: "Years in practice",
    summary: "One-year minimum to apply.",
    copy: "No facilitator is listed without documented, client-facing practice in their declared modality. Tiers — Emerging, Practitioner, Senior, Lead, Master — are determined by years of practice and shown on every profile.",
  },
  {
    title: "A real-time check",
    summary: "solasguide.com / verify",
    copy: "Every listing has a unique verification number. Anyone may check current standing in real time. Lapsed standing is removed within 24 hours.",
    href: "/verify",
    linkLabel: "Verify a number",
  },
] as const;

export function RegistryStandards() {
  return (
    <section
      id="recognition"
      aria-labelledby="recognition-heading"
      className="border-x border-b border-border bg-muted/35 px-5 py-14 sm:px-8 md:px-12 md:py-20 lg:px-16"
    >
      <div className="max-w-3xl" data-reveal>
        <p className="review-label text-muted-foreground">Recognition</p>
        <h2
          id="recognition-heading"
          className="mt-4 font-display text-3xl leading-[1.08] text-balance sm:text-4xl md:text-5xl md:leading-[1.05]"
        >
          Why you can trust who we introduce.
        </h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
          Before someone appears in the Solas register, we look carefully at
          their work, experience and approach. Recognition is how we help you
          know who is worth approaching.
        </p>
      </div>

      <div
        className="mt-10 grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-3"
        data-reveal
        data-reveal-delay="1"
      >
        {standards.map((standard) => (
          <article
            key={standard.title}
            className="flex flex-col bg-card p-7 sm:p-8 lg:p-10"
          >
            <h3 className="font-display text-2xl leading-tight md:text-3xl">
              {standard.title}
            </h3>
            <p className="mt-4 text-sm font-medium leading-6 text-foreground">
              {standard.summary}
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {standard.copy}
            </p>
            {"href" in standard ? (
              <Link
                href={standard.href}
                className="mt-6 inline-flex min-h-11 items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.13em] text-foreground transition-colors hover:text-accent"
              >
                {standard.linkLabel} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
