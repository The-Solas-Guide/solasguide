import Link from "next/link";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { TrackedPractitionerLink } from "@/components/analytics/tracked-practitioner-link";

const linkClassName =
  "inline-flex min-h-10 items-center text-sm transition-colors hover:text-background focus-visible:text-background";

export function SiteFooter() {
  return (
    <footer className="border border-border bg-foreground px-6 py-10 text-background md:px-10 md:py-14">
      <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(2,0.7fr)]">
        <div>
          <BrandWordmark
            reversed
            className="min-h-0 justify-start bg-transparent p-0 text-left [&_p:first-child]:text-3xl"
          />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-background/65">
            A curated network of practitioners, places and experiences in Bali.
          </p>
        </div>
        <div>
          <p className="review-label text-background/50">Explore</p>
          <div className="mt-4 grid gap-1 text-background/85">
            <Link href="/#explore" className={linkClassName}>
              Explore the guide
            </Link>
            <Link href="/#how-it-works" className={linkClassName}>
              How it works
            </Link>
            <Link href="/find-a-match" className={linkClassName}>
              Tell us about your trip
            </Link>
            <TrackedPractitionerLink
              source="footer"
              href="/become-a-practitioner"
              className={linkClassName}
            >
              Become a practitioner
            </TrackedPractitionerLink>
          </div>
        </div>
        <div>
          <p className="review-label text-background/50">Contact</p>
          <div className="mt-4 grid gap-1 text-background/85">
            <Link href="/#start" className={linkClassName}>
              Begin your enquiry
            </Link>
          </div>
          <div className="mt-6 border-t border-background/20 pt-4">
            <p className="review-label opacity-50">Legal</p>
            <div className="mt-3 grid gap-3 text-sm">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Website terms</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 flex flex-col gap-3 border-t border-background/20 pt-5 text-[11px] leading-relaxed text-background/55 sm:flex-row sm:items-center sm:justify-between">
        <p>© The Solas Guide</p>
      </div>
    </footer>
  );
}
