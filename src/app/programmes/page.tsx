import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { WhatsAppMessage } from "@/components/contact/whatsapp-message";
import { ProgrammeEnquiryForm } from "@/components/enquiry/programme-enquiry-form";
import { SiteHeader } from "@/components/layout/site-header";
import { PractitionerCard } from "@/components/practitioners/practitioner-card";
import { Button } from "@/components/ui/button";
import { selectProgrammeSessionLeads } from "@/lib/programme-practitioners";
import { programmeOffers, programmeProof } from "@/lib/programme-proof";
import { discoveryCall } from "@/lib/public-journeys";
import { getPublishedPractitioners } from "@/lib/practitioners";
import { cn } from "@/lib/utils";
import styles from "./page.module.css";

const fraunces = Fraunces({
  variable: "--font-programmes-display",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Wellness programmes, designed and delivered",
  description:
    "We design, staff and deliver wellness programmes for retreats, venues, travel advisors and professional groups.",
};

export const dynamic = "force-dynamic";

const guestQuestions = [
  "Who is this for?",
  "What are they looking for?",
  "Why would they choose this programme?",
  "What should feel different by the time they leave?",
] as const;

const navLinks = [
  { label: "Why Solas", href: "#approach" },
  { label: "What we do", href: "#offer" },
  { label: "How to get started", href: "#process" },
  { label: "The Guide", href: "/practitioners" },
] as const;

function DiscoveryCallButton({ className }: { className?: string }) {
  return (
    <Button asChild size="lg" className={cn(styles.substantialButton, styles.discoveryButton, className)}>
      <a href={discoveryCall.href} target="_blank" rel="noopener noreferrer">
        Book a discovery call <ArrowUpRight aria-hidden="true" />
      </a>
    </Button>
  );
}

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={styles.textLink}>
      {children}
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}

function PractitionerSectionFrame({ children }: { children: ReactNode }) {
  return (
    <section className={cn(styles.section, styles.practitionerSection)} aria-labelledby="practitioner-heading">
      <div className={styles.practitionerIntro}>
        <div>
          <p className={styles.eyebrow}>The Solas Guide</p>
          <h2 id="practitioner-heading" className={styles.displayHeading}>
            Who could lead your sessions.
          </h2>
        </div>
        <p>
          Explore practitioners who offer in-person work. We discuss suitability and availability for your programme.
        </p>
      </div>
      {children}
      <ArrowLink href="/practitioners">Explore the Guide</ArrowLink>
    </section>
  );
}

function PractitionerPreviewFallback() {
  return (
    <PractitionerSectionFrame>
      <div className={styles.practitionerStatus} role="status" aria-busy="true">
        <p>Loading practitioner profiles.</p>
      </div>
    </PractitionerSectionFrame>
  );
}

async function PractitionerPreview() {
  const practitionerResult = await getPublishedPractitioners();
  const practitioners = selectProgrammeSessionLeads(practitionerResult.data);

  return (
    <PractitionerSectionFrame>
      {practitionerResult.error ? (
        <div className={styles.practitionerStatus} role="status">
          <p>Practitioner profiles are unavailable at the moment.</p>
          <ArrowLink href="#contact">Start a conversation about your programme</ArrowLink>
        </div>
      ) : practitioners.length === 0 ? (
        <div className={styles.practitionerStatus}>
          <p>Talk to us about practitioners for your group.</p>
          <ArrowLink href="#contact">Start a conversation about your programme</ArrowLink>
        </div>
      ) : (
        <div className={styles.practitionerGrid}>
          {practitioners.map((practitioner) => (
            <PractitionerCard key={practitioner.id} practitioner={practitioner} variant="registry" />
          ))}
        </div>
      )}
    </PractitionerSectionFrame>
  );
}

export default function ProgrammesPage() {
  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <div className={cn(styles.page, fraunces.variable)}>
        <SiteHeader
          links={navLinks}
          cta={{ href: "#contact", label: "Start a conversation" }}
        />

        <main id="main-content">
          <section className={styles.hero} aria-labelledby="hero-heading">
            <Image
              src="/images/programmes/hero.webp"
              alt="An open pavilion surrounded by lush greenery"
              fill
              preload
              className={styles.heroImage}
              sizes="100vw"
            />
            <div className={styles.heroOverlay} aria-hidden="true" />
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>For retreats, venues and professional groups</p>
              <h1 id="hero-heading" className={styles.heroHeading}>
                Wellness programmes, designed and delivered.
              </h1>
              <p className={styles.heroIntro}>
                We plan the sessions, select the practitioners, and coordinate the programme.
              </p>
              <div className={styles.heroActions}>
                <DiscoveryCallButton className={styles.heroButton} />
                <ArrowLink href="#contact">Tell us about your plans</ArrowLink>
              </div>
            </div>
          </section>

          <section id="approach" className={cn(styles.section, styles.proof)} aria-label="Recent work">
            <p className={styles.eyebrow}>Recent work</p>
            <ul className={styles.proofList}>
              {programmeProof.map(({ src, alt, line, width, height }) => (
                <li key={alt}>
                  <Image src={src} alt={alt} width={width} height={height} className={alt.includes("Ubud") ? styles.proofLogoTall : styles.proofLogo} />
                  <p>{line}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="offer" className={cn(styles.section, styles.offer)} aria-labelledby="offer-heading">
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>What we do</p>
                <h2 id="offer-heading" className={styles.displayHeading}>
                  The work we take on.
                </h2>
              </div>
            </div>
            <ul className={styles.offerCards}>
              {programmeOffers.map(([title, line]) => (
                <li key={title}>
                  <a href={discoveryCall.href} target="_blank" rel="noopener noreferrer" className={styles.offerCard}>
                    <span className={styles.offerTitle}>{title}</span>
                    <span className={styles.offerLine}>{line}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section id="method" className={cn(styles.section, styles.method)} aria-labelledby="method-heading">
            <p className={styles.eyebrow}>Our approach</p>
            <h2 id="method-heading" className={styles.displayHeading}>Start with the guest, not the activity.</h2>
            <p className={styles.methodLead}>
              Most retreats begin with a list of activities. We begin with the people: who they are, what they need, and what should feel different when they leave. Only then do we choose the sessions and the practitioners.
            </p>
            <ul className={styles.questionList}>
              {guestQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </section>

          <Suspense fallback={<PractitionerPreviewFallback />}>
            <PractitionerPreview />
          </Suspense>

          <section id="process" className={cn(styles.section, styles.process)} aria-labelledby="process-heading">
            <div className={styles.processHeading}>
              <p className={styles.eyebrow}>How to get started</p>
              <h2 id="process-heading" className={styles.displayHeading}>
                Start with a conversation about your plans.
              </h2>
              <ArrowLink href="#contact">Start a conversation</ArrowLink>
            </div>
            <ol className={styles.processSteps}>
              <li>
                <span className={styles.stepNumber} aria-hidden="true">01</span>
                <div>
                  <h3>Tell us what you’re organising.</h3>
                  <p>Send us your group size, possible dates and what you want participants to get from the experience.</p>
                </div>
              </li>
              <li>
                <span className={styles.stepNumber} aria-hidden="true">02</span>
                <div>
                  <h3>Discuss the programme with us.</h3>
                  <p>We start with a complimentary 30-minute conversation about your group and the support you need.</p>
                </div>
              </li>
              <li>
                <span className={styles.stepNumber} aria-hidden="true">03</span>
                <div>
                  <h3>Agree on the work before we begin.</h3>
                  <p>Together, we agree on the programme scope, practitioner selection and any coordination or on-site support.</p>
                </div>
              </li>
            </ol>
          </section>

          <section className={cn(styles.section, styles.faq)} aria-labelledby="faq-heading">
            <div className={styles.faqIntro}>
              <p className={styles.eyebrow}>Before you enquire</p>
              <h2 id="faq-heading" className={styles.displayHeading}>
                A few useful details.
              </h2>
              <p>Bring the outline you have. We will help you work through the rest.</p>
            </div>
            <div className={styles.faqList}>
              <details>
                <summary>Do I need a finished programme?</summary>
                <p>Not at all. Share what you know about your group, possible dates and plans. We can discuss the rest in the first conversation.</p>
              </details>
              <details>
                <summary>Can Solas coordinate the programme?</summary>
                <p>Yes. Coordination is optional. We can discuss practitioner briefs, schedule coordination and on-site direction as part of the work.</p>
              </details>
              <details>
                <summary>What happens in the first conversation?</summary>
                <p>We discuss your group, your plans and the support you need. Then we can agree the programme scope, practitioner selection and any coordination.</p>
              </details>
            </div>
          </section>

          <section id="contact" className={cn(styles.section, styles.contact)} aria-labelledby="contact-heading">
            <div className={styles.contactCopy}>
              <p className={styles.eyebrow}>Enquire about a programme</p>
              <h2 id="contact-heading" className={styles.displayHeading}>Tell us about your retreat or group.</h2>
              <p>Share your group size, possible dates and what you want to achieve. You don’t need a finished plan.</p>
              <div className={styles.next}>
                <p className={styles.eyebrow}>What happens next</p>
                <p>We’ll contact you to arrange a conversation about your programme and how we can help.</p>
              </div>
              <div className={styles.quietActions}>
                <a href={discoveryCall.href} target="_blank" rel="noopener noreferrer" className={styles.textLink}>
                  Book a discovery call <ArrowUpRight aria-hidden="true" />
                </a>
                <WhatsAppMessage className={styles.textLink}>
                  Message us on WhatsApp <ArrowUpRight aria-hidden="true" />
                </WhatsAppMessage>
              </div>
            </div>
            <div className={styles.contactForm} id="programme-enquiry">
              <ProgrammeEnquiryForm />
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <BrandWordmark caption="For retreats, venues and professional groups" className={styles.footerBrand} />
          <nav aria-label="Legal" className={styles.footerLinks}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Website terms</Link>
          </nav>
        </footer>
      </div>
    </>
  );
}
