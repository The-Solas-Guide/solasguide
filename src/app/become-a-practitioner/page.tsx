import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { TrackedPractitionerLink } from "@/components/analytics/tracked-practitioner-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Become a practitioner",
  description: "Share a short introduction to your Bali practice with The Solas Guide.",
};

export default function BecomeAPractitionerPage() {
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
              <p className="review-label text-accent">For practitioners in Bali</p>
              <h1 className="mt-6 max-w-2xl font-display text-5xl leading-[0.98] tracking-tight md:text-7xl">
                Let us know about your practice.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground">
                The Solas Guide is building a considered network of practitioners and experiences in Bali. Share a short introduction so we can understand your work and how to reach you.
              </p>
              <div className="mt-9">
                <TrackedPractitionerLink source="landing" href="/become-a-practitioner/express-interest" className={buttonVariants({ size: "lg" })}>
                  Express your interest <ArrowRight />
                </TrackedPractitionerLink>
              </div>
            </div>
            <div className="relative min-h-[28rem] border-t border-border lg:min-h-0 lg:border-t-0 lg:border-l">
              <Image
                src="/images/solas-imagery/why-solas-pavilion.png"
                alt="A quiet open-air pavilion surrounded by tropical greenery in Bali"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 48vw"
              />
            </div>
          </section>

          <section className="border-x border-b border-border bg-muted/30 px-6 py-16 sm:px-10 md:px-14 md:py-24 lg:px-16">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
              <div>
                <p className="review-label text-muted-foreground">Who it is for</p>
                <h2 className="mt-5 max-w-md font-display text-4xl leading-tight md:text-5xl">
                  Practitioners with a genuine connection to Bali.
                </h2>
              </div>
              <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
                {[
                  ["Based in Bali", "Your practice is currently based in Bali."],
                  ["Working here regularly", "You live elsewhere but reliably practise or facilitate work in Bali."],
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
                  A clear introduction, without a lengthy application.
                </h2>
              </div>
              <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
                {[
                  ["01", "Share your work", "Tell us what you practise, where you work, and the experience most relevant to your work in Bali."],
                  ["02", "Give us useful context", "A few links and clear contact details help us understand your practice without requesting files or certificates."],
                  ["03", "Open a possible conversation", "If The Solas Guide would like to continue the conversation, we will use your chosen contact details."],
                ].map(([number, title, copy]) => (
                  <article key={number} className="bg-background p-7 md:p-9">
                    <p className="review-label text-accent">{number}</p>
                    <h3 className="mt-5 font-display text-2xl leading-tight">{title}</h3>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{copy}</p>
                  </article>
                ))}
              </div>
              <p className="mt-8 max-w-3xl text-sm leading-7 text-muted-foreground">
                An expression of interest is not approval, verification, publication, or a commitment to work together. It gives us one structured introduction to consider for relevant future conversations.
              </p>
            </div>
          </section>

          <section className="review-section border-x border-b border-border bg-foreground px-6 text-background">
            <div className="mx-auto max-w-3xl text-center">
              <p className="review-label text-background/55">Introduce your practice</p>
              <h2 className="mt-5 font-display text-4xl leading-tight md:text-6xl">Tell us enough to begin.</h2>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-background/65">
                The form takes a few minutes. Please share only professional information you are comfortable sending to The Solas Guide.
              </p>
              <TrackedPractitionerLink
                source="landing"
                href="/become-a-practitioner/express-interest"
                className={cn(buttonVariants({ size: "lg" }), "mt-8 border-background bg-background text-foreground hover:bg-background/85")}
              >
                Express your interest <ArrowRight />
              </TrackedPractitionerLink>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
