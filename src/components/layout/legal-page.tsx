import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { membershipNavLinks } from "@/lib/membership-content";
import { legalEmail, legalUpdated, type LegalSection } from "@/lib/legal-content";

function Paragraph({ text }: { text: string }) {
  const parts = text.split(/(\[?To be confirmed:[^.\]]+\.?\]?)/g);
  return (
    <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
      {parts.map((part, index) =>
        part.startsWith("To be confirmed:") ? (
          <span key={index} className="bg-muted px-1 text-foreground">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </p>
  );
}

export function LegalPage({
  kicker,
  title,
  description,
  sections,
}: {
  kicker: string;
  title: string;
  description: string;
  sections: readonly LegalSection[];
}) {
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
              <p className="review-label text-muted-foreground">{kicker}</p>
              <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.98] tracking-tight md:text-6xl">{title}</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">{description}</p>
              <p className="mt-4 text-sm text-foreground">Last updated {legalUpdated}</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                Email{" "}
                <a href={`mailto:${legalEmail}`} className="text-foreground underline-offset-4 hover:underline">
                  {legalEmail}
                </a>
                . Sentences marked “To be confirmed” are not yet decided. Please do not treat them as final.
              </p>
              <nav aria-label="On this page" className="mt-10 border border-border bg-muted/40 p-5 sm:p-6">
                <p className="review-label text-muted-foreground">On this page</p>
                <ol className="mt-4 grid gap-1 sm:grid-cols-2">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className="flex min-h-11 items-center gap-3 text-sm text-foreground underline-offset-4 hover:underline">
                        <span className="review-label text-accent">{String(index + 1).padStart(2, "0")}</span>
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </header>
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-6 border-t border-border px-6 py-10 sm:px-10 md:px-14 md:py-12 lg:px-16">
                <h2 className="font-display text-3xl leading-tight md:text-4xl">{section.title}</h2>
                <div className="mt-5 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <Paragraph key={paragraph} text={paragraph} />
                  ))}
                  {section.items ? (
                    <ul className="max-w-2xl list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
            <footer className="flex flex-wrap gap-x-6 gap-y-3 border-t border-border px-6 py-8 sm:px-10 md:px-14 lg:px-16">
              <Link href="/privacy" className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline">
                Privacy policy
              </Link>
              <Link href="/terms" className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline">
                Website terms of use
              </Link>
              <Link href="/" className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline">
                The Solas Guide
              </Link>
            </footer>
          </article>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
