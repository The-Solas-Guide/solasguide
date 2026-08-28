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
            className="min-h-0 justify-start bg-transparent p-0 text-left [&>div]:items-start"
          />
          <div className="mt-4 max-w-md space-y-3 text-sm leading-relaxed text-background/65">
            <p>
              The Solas Guide is an independent editorial publication recognising exceptional wellness practitioners through a transparent review process combining independent due diligence with editorial judgement.
            </p>
            <p>Volume One features practitioners working across Bali.</p>
            <p>Future editions will recognise practitioners in other regions.</p>
          </div>
        </div>
        <div>
          <p className="review-label text-background/50">Explore</p>
          <div className="mt-4 grid gap-1 text-background/85">
            <Link href="/practitioners" className={linkClassName}>
              Browse the Guide
            </Link>
            <Link href="/#recognition" className={linkClassName}>
              How Recognition Works
            </Link>
            <Link href="/find-a-match" className={linkClassName}>
              Start Questionnaire
            </Link>
            <TrackedPractitionerLink
              source="footer"
              href="/become-a-practitioner"
              className={linkClassName}
            >
              Apply for Recognition
            </TrackedPractitionerLink>
          </div>
        </div>
        <div>
          <p className="review-label text-background/50">Contact</p>
          <div className="mt-4 grid gap-1 text-background/85">
            <Link href="/#questionnaire" className={linkClassName}>
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
