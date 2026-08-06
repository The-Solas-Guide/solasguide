import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { ThemeReviewControl } from "@/components/design-system/theme-review-control";
import { FormChoiceCard } from "@/components/forms/form-choice-card";
import { FormFeedback } from "@/components/forms/form-feedback";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const sections = [
  ["principles", "Principles", "01"],
  ["directions", "Directions", "02"],
  ["colour", "Colour", "03"],
  ["type", "Type and identity", "04"],
  ["components", "Components", "05"],
  ["composition", "Composition", "06"],
  ["scope", "MVP foundation", "07"],
] as const;

const palette = [
  ["Background", "bg-background border border-border"],
  ["Foreground", "bg-foreground"],
  ["Card", "bg-card border border-border"],
  ["Muted", "bg-muted"],
  ["Secondary", "bg-secondary"],
  ["Accent", "bg-accent"],
  ["Border", "bg-border"],
  ["Destructive", "bg-destructive"],
] as const;

function SectionHeading({
  index,
  title,
  note,
}: {
  index: string;
  title: string;
  note: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="review-label text-muted-foreground">{index}</p>
      <h2 className="mt-4 font-display text-4xl leading-tight md:text-6xl">{title}</h2>
      <p className="review-prose mt-5">{note}</p>
    </div>
  );
}

export function DesignSystemReview() {
  return (
    <main>
      <ThemeReviewControl full />

      <section className="relative flex min-h-[78svh] items-end overflow-hidden bg-foreground px-6 py-16 text-white md:min-h-[88svh] md:px-12 md:py-20 lg:px-[8vw]">
        <Image
          src="/images/solas-imagery/exec-02d0c4f5-376a-4a94-8501-b88ac59a9932.png"
          alt="Architecture set within a tropical landscape"
          fill
          preload
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,13,10,0.08)_15%,rgba(8,13,10,0.78)_100%)]" />
        <div className="relative z-10 max-w-5xl">
          <p className="review-label text-white/65">Internal review · provisional</p>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.96] text-white md:text-7xl lg:text-8xl">
            The Solas Guide design foundation
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            A visual language tested through real page composition, editorial
            imagery, controls, forms, and the focused MVP journeys.
          </p>
          <Link
            href="/"
            className={cn(
              buttonVariants(),
              "mt-8 w-full border-white bg-white text-black hover:bg-white/85 sm:w-auto",
            )}
          >
            View the representative homepage <ArrowRight />
          </Link>
        </div>
      </section>

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-svh border-r border-border bg-background p-5 lg:block">
          <div className="border-b border-border pb-5">
            <p className="font-display text-xl">The Solas Guide</p>
            <p className="review-label mt-2 text-muted-foreground">Design system</p>
          </div>
          <nav aria-label="Design system sections" className="mt-5 grid gap-1">
            {sections.map(([id, label, number]) => (
              <a key={id} href={`#${id}`} className="flex min-h-10 items-center gap-3 border-l-2 border-transparent px-3 text-xs text-muted-foreground hover:border-accent hover:bg-muted hover:text-foreground">
                <span className="review-label w-6 opacity-55">{number}</span>
                {label}
              </a>
            ))}
          </nav>
          <div className="absolute right-5 bottom-5 left-5 border-t border-border pt-5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The review controls are temporary and will be removed after one
              direction is approved.
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          <nav className="sticky top-0 z-30 flex overflow-x-auto border-b border-border bg-background/94 p-2 backdrop-blur lg:hidden" aria-label="Design system sections">
            {sections.map(([id, label, number]) => (
              <a key={id} href={`#${id}`} className="shrink-0 px-3 py-2 text-xs text-muted-foreground">
                {number} {label}
              </a>
            ))}
          </nav>

          <section id="principles" className="review-section scroll-mt-16 px-6 md:px-12 lg:px-[7vw]">
            <SectionHeading index="01 — Principles" title="The brand idea" note="Three principles shape a visual identity that feels trusted, distinctive, and grounded in the world The Solas Guide inhabits." />
            <div className="mt-12 grid gap-px border border-border bg-border md:grid-cols-3">
              {[
                ["01", "Quiet authority", "Confidence through restraint, structure, and evidence—not promotional volume."],
                ["02", "Specific over spiritual", "Names, places, experience, and professional context replace vague promises."],
                ["03", "Editorial hospitality", "Warm enough to invite exploration; rigorous enough to support a considered next step."],
              ].map(([number, title, copy]) => (
                <article key={number} className="bg-background p-7 md:min-h-72 md:p-9">
                  <p className="review-label text-muted-foreground">Principle {number}</p>
                  <h3 className="mt-12 font-display text-3xl">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="directions" className="review-section scroll-mt-16 border-t border-border px-6 md:px-12 lg:px-[7vw]">
            <SectionHeading index="02 — Candidate directions" title="Three registers, one real page" note="Use the floating controls to review each direction across this system and the representative homepage. These are candidates, not three production themes." />
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {[
                ["Aman", "Quiet minimal", "#f7f4ee", "#1c1a17", "#2e4238"],
                ["Bambu", "Earth and material", "#f1ebe0", "#221c14", "#a8562f"],
                ["Chanel", "Editorial contrast", "#ffffff", "#0a0a0a", "#8c6f3f"],
              ].map(([name, note, background, ink, accent]) => (
                <article key={name} className="border p-6" style={{ background, color: ink, borderColor: `${ink}22` }}>
                  <div className="review-label flex justify-between" style={{ color: accent }}>
                    <span>{name}</span><span>{note}</span>
                  </div>
                  <h3 className="mt-16 font-display text-4xl leading-tight">The standard was earned.</h3>
                  <p className="mt-4 text-sm leading-relaxed opacity-65">A calm editorial register shaped around real context and personal follow-up.</p>
                  <div className="mt-9 flex h-2"><span className="flex-1" style={{ background: ink }} /><span className="flex-1" style={{ background: accent }} /><span className="flex-1" style={{ background: `${ink}22` }} /></div>
                </article>
              ))}
            </div>
          </section>

          <section id="colour" className="review-section scroll-mt-16 border-t border-border px-6 md:px-12 lg:px-[7vw]">
            <SectionHeading index="03 — Colour" title="Semantic colour, not isolated hex values" note="Every production pattern consumes the same tokens. The selected direction can therefore retone the full page without creating separate component systems." />
            <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
              {palette.map(([name, className]) => (
                <div key={name} className="bg-background">
                  <div className={cn("h-32", className)} />
                  <p className="review-label px-4 py-4 text-muted-foreground">{name}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-foreground p-5 text-background"><p className="text-sm">Ink on background</p><p className="review-label mt-3 opacity-60">Primary reading</p></div>
              <div className="border border-border bg-background p-5"><p className="text-sm">Background on ink</p><p className="review-label mt-3 text-muted-foreground">Reversed reading</p></div>
              <div className="bg-accent p-5 text-accent-foreground"><p className="text-sm">Accent pair</p><p className="review-label mt-3 opacity-65">Actions and focus</p></div>
              <div className="border border-destructive/30 bg-destructive/10 p-5 text-destructive"><p className="text-sm">Destructive pair</p><p className="review-label mt-3 opacity-65">Errors only</p></div>
            </div>
          </section>

          <section id="type" className="review-section scroll-mt-16 border-t border-border px-6 md:px-12 lg:px-[7vw]">
            <SectionHeading index="04 — Type and identity" title="Editorial rhythm with direct interface copy" note="Fraunces gives the guide a recognisable reading voice. Inter keeps navigation, labels, and form controls precise. The wordmark remains provisional until client approval." />
            <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-12">
                <div><p className="review-label text-muted-foreground">Display · Fraunces</p><p className="mt-4 font-display text-5xl leading-[1.02] md:text-7xl">The standard was earned, not claimed.</p></div>
                <div><p className="review-label text-muted-foreground">Body · Inter</p><p className="review-prose mt-4">The Solas Guide begins with a structured enquiry and a personal review. Specific context matters more than broad promises.</p></div>
                <div className="border-l-2 border-accent pl-7"><p className="font-display text-2xl italic md:text-3xl">“The site should feel established, calm, and specific.”</p><p className="review-label mt-4 text-muted-foreground">Working design interpretation</p></div>
              </div>
              <div className="grid border border-border">
                <BrandWordmark caption="Provisional primary wordmark" className="min-h-64" />
                <BrandWordmark reversed caption="Provisional reversed wordmark" className="min-h-64" />
              </div>
            </div>
          </section>

          <section id="components" className="review-section scroll-mt-16 border-t border-border px-6 md:px-12 lg:px-[7vw]">
            <SectionHeading index="05 — Components" title="The interface should feel as considered as the editorial page" note="These are the minimum controls needed for the active MVP journeys: navigation, actions, fields, choices, progress, and honest feedback." />
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <div className="rounded-md border border-border bg-card p-6 md:p-8">
                <p className="review-label text-muted-foreground">Actions</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button>Start an enquiry <ArrowRight /></Button>
                  <Button variant="outline">Read the approach</Button>
                  <Button variant="ghost">Back</Button>
                </div>
                <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
                  <Button disabled>
                    <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Saving
                  </Button>
                  <Button variant="outline" disabled>Unavailable</Button>
                </div>
              </div>
              <div className="rounded-md border border-border bg-card p-6 md:p-8">
                <p className="review-label text-muted-foreground">Form fields</p>
                <Label htmlFor="review-email" className="mt-8">Email address</Label>
                <Input id="review-email" type="email" placeholder="you@example.com" className="mt-3 bg-background" />
                <Label htmlFor="review-note" className="mt-6">What would be useful for us to know?</Label>
                <Textarea id="review-note" placeholder="A sentence or two about your plans." className="mt-3 bg-background" />
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <FormChoiceCard
                label="Find a practitioner"
                description="Explore a practice or person who may suit what you need."
                selected
              />
              <FormChoiceCard
                label="I’m still exploring"
                description="Start with the feeling and we will help shape the next step."
              />
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <FormFeedback
                tone="success"
                title="Your enquiry has been received."
                description="We will review the details and explain the next step."
              />
              <FormFeedback
                tone="error"
                title="Something needs attention."
                description="Check the highlighted fields and try again."
              />
              <article className="rounded-md border border-border bg-card p-5 md:p-6">
                <p className="review-label text-accent">Loading</p>
                <h3 className="mt-6 font-display text-xl leading-snug md:text-2xl">Saving your enquiry…</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm md:leading-7">
                  Completion is only shown after the submission is confirmed.
                </p>
              </article>
            </div>
          </section>

          <section id="composition" className="review-section scroll-mt-16 border-t border-border px-6 md:px-12 lg:px-[7vw]">
            <SectionHeading index="06 — Composition and imagery" title="Place first, then context, then action" note="The prototype’s strongest contribution is its pacing: architecture and materials establish atmosphere, while clear editorial structure prevents the page becoming vague wellness advertising." />
            <div className="mt-12 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative min-h-[34rem] overflow-hidden">
                <Image src="/images/solas-imagery/exec-0d9fb98c-c711-4865-bdba-64d9d5bb91d3.png" alt="River and tropical landscape" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 58vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute right-0 bottom-0 left-0 p-7 text-white md:p-10"><p className="review-label text-white/65">Place-led hero direction</p><p className="mt-4 max-w-xl font-display text-4xl leading-tight md:text-5xl">The setting creates atmosphere before the interface asks for action.</p></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="relative min-h-64 overflow-hidden"><Image src="/images/solas-imagery/exec-1430506b-6ab6-4bc3-8f24-b0a816abc9a3.png" alt="Natural materials in an open-air interior" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 35vw" /></div>
                <div className="flex min-h-64 flex-col justify-between border border-border bg-card p-7"><p className="review-label text-muted-foreground">Editorial detail</p><div><p className="font-display text-3xl">Materials, thresholds, water, shade, and signs of use.</p><p className="mt-4 text-sm leading-7 text-muted-foreground">All migrated imagery remains provisional until the client approves the final art direction and licensing position.</p></div></div>
              </div>
            </div>
          </section>

          <section id="scope" className="review-section scroll-mt-16 border-t border-border px-6 md:px-12 lg:px-[7vw]">
            <SectionHeading index="07 — MVP foundation" title="The design system serves the release we are actually building" note="The visual foundation is intentionally bounded to the public introduction, two submission journeys, legal pages, and their responsive success and error states." />
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Representative homepage",
                "About and editorial positioning",
                "Find a Match enquiry",
                "Become a Practitioner enquiry",
                "Privacy and website terms",
                "Confirmation and error states",
              ].map((item, index) => (
                <div key={item} className="flex min-h-24 items-center gap-4 border border-border bg-card p-5">
                  <span className="review-label text-accent">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 border-l-2 border-accent bg-muted/35 p-6 text-sm leading-7 text-muted-foreground">
              <p className="font-semibold text-foreground">Prototype boundaries</p>
              <p className="mt-2">The practitioner directory and profiles are available at their intended routes for unlinked, noindex client review only. Venue and event listings, accounts, admin pages, automated matching, booking, payments, and phase-labelled routes remain outside the application.</p>
            </div>
            <div className="mt-10 border-t border-border pt-10">
              <SiteHeader />
              <SiteFooter />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
