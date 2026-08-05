import Link from "next/link";
import { BrandWordmark } from "@/components/brand/brand-wordmark";

export function SiteFooter() {
  return (
    <footer className="border border-border bg-foreground px-6 py-10 text-background md:px-10 md:py-14">
      <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(2,0.7fr)]">
        <div>
          <BrandWordmark
            reversed
            className="min-h-0 justify-start bg-transparent p-0 text-left [&_p:first-child]:text-3xl"
          />
          <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-65">
            A curated network of practitioners, places and experiences in Bali.
          </p>
        </div>
        <div>
          <p className="review-label opacity-50">Explore</p>
          <div className="mt-4 grid gap-3 text-sm">
            <Link href="/#explore">Explore the guide</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/find-a-match">Tell us about your trip</Link>
          </div>
        </div>
        <div>
          <p className="review-label opacity-50">Contact</p>
          <div className="mt-4 grid gap-3 text-sm">
            <Link href="/#start">Begin your enquiry</Link>
          </div>
        </div>
      </div>
      <div className="mt-12 flex flex-col gap-3 border-t border-background/20 pt-5 text-[11px] opacity-55 sm:flex-row sm:justify-between">
        <p>© The Solas Guide</p>
        <p>Privacy and terms content pending client approval.</p>
      </div>
    </footer>
  );
}
