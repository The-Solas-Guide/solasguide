import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

type LegalSection = {
  title: string;
  body: string;
};

type LegalPageProps = {
  title: string;
  intro: string;
  sections: readonly LegalSection[];
};

export function LegalPage({ title, intro, sections }: LegalPageProps) {
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
          <article className="mt-3 border border-border bg-card">
            <header className="border-b border-border px-6 py-16 sm:px-10 md:px-14 md:py-24 lg:px-20">
              <div className="max-w-3xl">
                <p className="review-label text-accent">Draft placeholder</p>
                <h1 className="mt-6 font-display text-5xl leading-[0.98] tracking-tight md:text-7xl">
                  {title}
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                  {intro}
                </p>
              </div>
            </header>

            <div className="grid gap-px bg-border lg:grid-cols-[0.75fr_1.25fr]">
              <aside className="bg-muted/30 p-6 sm:p-10 md:p-14">
                <p className="review-label text-muted-foreground">Status</p>
                <p className="mt-5 max-w-xs font-display text-3xl leading-tight">
                  Client-approved content pending.
                </p>
                <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
                  This page is a placeholder and is not final legal wording.
                </p>
              </aside>

              <div className="bg-background px-6 py-12 sm:px-10 md:px-14 md:py-16 lg:px-20">
                <p className="review-label text-muted-foreground">Placeholder notes</p>
                <div className="mt-6 border-t border-border">
                  {sections.map((section) => (
                    <section key={section.title} className="border-b border-border py-8 last:border-b-0">
                      <h2 className="font-display text-3xl leading-tight md:text-4xl">
                        {section.title}
                      </h2>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                        {section.body}
                      </p>
                    </section>
                  ))}
                </div>
                <Link
                  href="/"
                  className="mt-8 inline-flex min-h-11 items-center border-b border-foreground/35 text-xs font-semibold uppercase tracking-[0.13em] transition-colors hover:border-foreground"
                >
                  Return to The Solas Guide
                </Link>
              </div>
            </div>
          </article>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
