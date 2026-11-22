import Link from "next/link";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { TrackedPractitionerLink } from "@/components/analytics/tracked-practitioner-link";
import { WhatsAppMessage } from "@/components/contact/whatsapp-message";
import { browseTheGuide, discoveryCall, guideEmail, needHelpChoosing } from "@/lib/public-journeys";

const linkClassName =
  "inline-flex min-h-11 items-center text-sm transition-colors hover:text-background focus-visible:text-background";

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
            <p>Volume One features practitioners recognised across Southeast Asia.</p>
            <p>Future editions will recognise practitioners in other regions.</p>
          </div>
        </div>
        <div>
          <p className="review-label text-background/50">Explore</p>
          <div className="mt-4 grid gap-1 text-background/85">
            <Link href={browseTheGuide.href} className={linkClassName}>
              {browseTheGuide.label}
            </Link>
            <Link href="/programmes" className={linkClassName}>
              Wellness programmes
            </Link>
            <Link href="/#recognition" className={linkClassName}>
              How Recognition Works
            </Link>
            <Link href={needHelpChoosing.href} className={linkClassName}>
              {needHelpChoosing.label}
            </Link>
            <TrackedPractitionerLink
              source="footer"
              href="/membership"
              className={linkClassName}
            >
              Practitioners can apply for membership
            </TrackedPractitionerLink>
            <Link href="/working-in-bali" className={linkClassName}>
              Working in Bali briefing
            </Link>
          </div>
        </div>
        <div>
          <p className="review-label text-background/50">Contact</p>
          <div className="mt-4 grid gap-1 text-background/85">
            <a href={discoveryCall.href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
              {discoveryCall.label}
            </a>
            <a href={`mailto:${guideEmail}`} className={linkClassName}>
              {guideEmail}
            </a>
            <WhatsAppMessage className={linkClassName}>
              Message us on WhatsApp
            </WhatsAppMessage>
          </div>
          <div className="mt-6 border-t border-background/20 pt-4">
            <p className="review-label opacity-50">Legal</p>
            <div className="mt-3 grid text-sm">
              <Link href="/privacy" className={linkClassName}>Privacy</Link>
              <Link href="/terms" className={linkClassName}>Website terms</Link>
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
