import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PractitionerListItem } from "@/components/practitioners/practitioner-list-item";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { practitioners } from "@/lib/practitioners";

export const metadata = {
  title: "Practitioner directory review | The Solas Guide",
  description: "Review provisional practitioner profiles for The Solas Guide.",
  robots: { index: false, follow: false },
};

export default function PractitionersPage() {
  return (
    <main className="min-h-screen bg-background px-3 py-3 md:px-5 md:py-5">
      <div className="mx-auto max-w-[1440px]">
        <SiteHeader />

        <div className="border-x border-b border-border bg-amber-100 px-5 py-3 text-xs text-amber-950 md:px-10 lg:px-16">
          <strong>Provisional directory review.</strong> Profiles and filtering are not approved launch content.
        </div>

        <section className="border-x border-border px-5 py-16 md:px-10 md:py-24 lg:px-16">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.6fr)]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">The practitioner guide · Bali</p>
              <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-8xl">
                People chosen with context, not ranked by an algorithm.
              </h1>
            </div>
            <div className="border-l-2 border-accent pl-6">
              <p className="text-sm leading-7 text-muted-foreground">
                Browse independent editorial profiles, then ask The Solas Guide to help shape the right next step. Inclusion reflects review and context—not a guarantee of suitability.
              </p>
              <Button asChild variant="link" className="mt-5 px-0">
                <Link href="/find-a-match">Not sure where to begin? Start an enquiry <ArrowRight /></Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-x border-t border-border px-5 pb-20 md:px-10 lg:px-16">
          <div className="flex items-center justify-between border-b border-border py-6">
            <p className="text-xs uppercase tracking-[0.16em]">Curated practitioners</p>
            <p className="text-xs text-muted-foreground">Showing {practitioners.length} provisional profiles</p>
          </div>
          <div>
            {practitioners.map((practitioner, index) => (
              <Link key={practitioner.slug} href={`/practitioners/${practitioner.slug}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                <PractitionerListItem index={String(index + 1).padStart(2, "0")} {...practitioner} />
              </Link>
            ))}
          </div>
        </section>

        <section className="border border-border bg-muted/35 px-6 py-12 md:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-16">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">A considered introduction</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight md:text-4xl">If the list creates more questions than answers, start with your context.</h2>
          </div>
          <Button asChild className="mt-7 lg:mt-0">
            <Link href="/find-a-match">Find a match <ArrowRight /></Link>
          </Button>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}
