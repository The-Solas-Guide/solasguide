import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { BrandWordmark } from "@/components/brand/brand-wordmark";
import { ProgrammeEnquiryForm } from "@/components/enquiry/programme-enquiry-form";
import { SiteHeader } from "@/components/layout/site-header";
import { PractitionerCard } from "@/components/practitioners/practitioner-card";
import { Button } from "@/components/ui/button";
import { emptyDirectoryFilters, getPublishedPractitioners } from "@/lib/practitioners";
import { cn } from "@/lib/utils";
import styles from "./page.module.css";

const fraunces = Fraunces({
  variable: "--font-programmes-display",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Wellness programmes for retreats in Bali",
  description:
    "We design wellness programmes for retreats and groups in Bali, select practitioners, and offer coordination and on-site support.",
};

export const dynamic = "force-dynamic";

const navLinks = [
  { label: "Why Solas", href: "#approach" },
  { label: "What we do", href: "#offer" },
  { label: "How to get started", href: "#process" },
  { label: "The Guide", href: "/practitioners" },
] as const;

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={styles.textLink}>
      {children}
      <ArrowUpRight aria-hidden="true" />
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
          Explore practitioners who offer in-person work in Bali. We discuss suitability and availability for your programme.
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
  const practitionerResult = await getPublishedPractitioners({
    ...emptyDirectoryFilters,
    locations: ["bali"],
    format: ["in-person"],
  });
  const practitioners = practitionerResult.data.slice(0, 3);

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
              <p className={styles.eyebrow}>Wellness programme design · Bali</p>
              <h1 id="hero-heading" className={styles.heroHeading}>
                Wellness programmes for retreats in Bali.
              </h1>
              <p className={styles.heroIntro}>
                We plan the wellness sessions for your retreat or group experience. We select practitioners and can coordinate the programme.
              </p>
              <Button asChild size="lg" className={cn(styles.substantialButton, styles.heroButton)}>
                <Link href="#contact">
                  Tell us about your plans <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
              <span className={styles.heroNote}>Start with a complimentary 30-minute conversation.</span>
            </div>
          </section>

          <div className={styles.audience} aria-label="Created for">
            <span className={styles.eyebrow}>Created for</span>
            <span>Retreat organisers</span>
            <span>Leadership teams</span>
            <span>Travel advisors</span>
            <span>Hotels &amp; private groups</span>
          </div>

          <section id="approach" className={cn(styles.section, styles.intro)} aria-labelledby="approach-heading">
            <div className={styles.introImage}>
              <Image
                src="/images/programmes/place.webp"
                alt="A pavilion overlooking the green landscape of Bali"
                fill
                loading="lazy"
                className={styles.coverImage}
                sizes="(max-width: 800px) 100vw, 52vw"
              />
              <p className={styles.imageCaption}>Wellness programmes for retreats and groups in Bali.</p>
            </div>
            <div className={styles.introStory}>
              <p className={styles.eyebrow}>Planning a retreat?</p>
              <h2 id="approach-heading" className={styles.displayHeading}>
                Finding practitioners is only part of the job.
              </h2>
              <p>You need to choose the activities, find suitable practitioners and fit everything into your schedule.</p>
              <p>We help you make those decisions and build a programme around your group.</p>
              <ArrowLink href="#contact">Tell us about your plans</ArrowLink>
            </div>
          </section>

          <section id="offer" className={cn(styles.section, styles.offer)} aria-labelledby="offer-heading">
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>What we do</p>
                <h2 id="offer-heading" className={styles.displayHeading}>
                  Plan the sessions.
                  <br />
                  Find the practitioners.
                </h2>
              </div>
              <p>We combine programme design with practitioner selection from the Solas network in Bali.</p>
            </div>

            <div className={styles.serviceGrid}>
              <article className={styles.serviceFeature}>
                <Image
                  src="/images/programmes/practice.webp"
                  alt="Materials prepared for a wellness practice"
                  fill
                  loading="lazy"
                  className={styles.coverImage}
                  sizes="(max-width: 800px) 100vw, 50vw"
                />
                <div className={styles.serviceOverlay}>
                  <p className={styles.eyebrow}>01 / Programme design</p>
                  <h3>
                    A programme built around your group.
                  </h3>
                  <p>We recommend sessions and activities based on your group’s goals, then plan how they fit into your schedule.</p>
                </div>
              </article>

              <div className={styles.serviceStack}>
                <article className={styles.servicePeople}>
                  <div className={styles.serviceCopy}>
                    <p className={styles.eyebrow}>02 / Practitioner selection</p>
                    <h3>
                      People to lead each session.
                    </h3>
                    <p>We select practitioners from the Solas network to deliver the sessions in your programme.</p>
                  </div>
                  <div className={styles.peopleMedia}>
                    <Image
                      src="/images/programmes/people.webp"
                      alt="A person walking towards a pavilion along a garden path"
                      fill
                      loading="lazy"
                      className={styles.peopleImage}
                      sizes="(max-width: 800px) 45vw, 20vw"
                    />
                  </div>
                </article>

                <article className={styles.serviceDelivery}>
                  <p className={styles.eyebrow}>03 / Optional coordination</p>
                  <h3>
                    Help organising the programme.
                  </h3>
                  <p>We can brief practitioners, coordinate schedules and direct the programme on-site.</p>
                  <span className={styles.deliveryMark} aria-hidden="true">↗</span>
                </article>
              </div>
            </div>
          </section>

          <section className={cn(styles.section, styles.programmeExample)} aria-labelledby="programme-example-heading">
            <div className={styles.exampleIntro}>
              <p className={styles.eyebrow}>An illustrative example</p>
              <h2 id="programme-example-heading" className={styles.displayHeading}>
                What your programme could look like.
              </h2>
              <p>
                Every programme begins with your group and your plans. This is one illustrative starting point.
              </p>
            </div>
            <article className={styles.examplePlan} aria-label="Illustrative three-day programme document">
              <header className={styles.exampleDocumentHeader}>
                <div>
                  <p className={styles.exampleBrand}>The Solas Guide</p>
                  <p className={styles.exampleDocumentType}>Programme outline</p>
                </div>
                <p className={styles.exampleSampleLabel}>Illustrative sample</p>
              </header>

              <div className={styles.exampleDocumentLead}>
                <div className={styles.exampleTitle}>
                  <p className={styles.eyebrow}>Three days in Bali</p>
                  <h3>Leadership retreat programme</h3>
                  <p>This sample shows how shared sessions and personal time could sit together. Every programme is shaped around your group.</p>
                </div>
                <div className={styles.exampleMedia}>
                  <Image
                    src="/images/programmes/place.webp"
                    alt="A pavilion overlooking the green landscape of Bali"
                    fill
                    loading="lazy"
                    className={styles.coverImage}
                    sizes="(max-width: 800px) 100vw, 32vw"
                  />
                </div>
              </div>

              <dl className={styles.exampleDetails}>
                <div>
                  <dt>Group</dt>
                  <dd>12-person leadership team</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>Bali</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>3 days</dd>
                </div>
              </dl>

              <div className={styles.exampleSchedule}>
                <div className={styles.exampleScheduleHeader}>
                  <div>
                    <p className={styles.eyebrow}>Sample timetable</p>
                    <h4>Your three-day schedule</h4>
                  </div>
                  <p>Times and session types are examples only.</p>
                </div>
                <table>
                  <caption className="sr-only">Illustrative three-day wellness programme timetable</caption>
                  <thead>
                    <tr>
                      <th scope="col">Day</th>
                      <th scope="col">Time</th>
                      <th scope="col">Session</th>
                      <th scope="col">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row" data-label="Day">Day 01</th>
                      <td data-label="Time">15:30</td>
                      <td data-label="Session"><strong>Arrival and settle-in</strong><span>Organiser&apos;s own time</span></td>
                      <td data-label="Duration">Flexible</td>
                    </tr>
                    <tr>
                      <th scope="row" data-label="Day">Day 01</th>
                      <td data-label="Time">17:00</td>
                      <td data-label="Session"><strong>Gentle movement session</strong><span>An easy shared start to the programme.</span></td>
                      <td data-label="Duration">45 mins</td>
                    </tr>
                    <tr>
                      <th scope="row" data-label="Day">Day 02</th>
                      <td data-label="Time">07:30</td>
                      <td data-label="Session"><strong>Guided meditation</strong><span>A quiet morning practice for the group.</span></td>
                      <td data-label="Duration">30 mins</td>
                    </tr>
                    <tr>
                      <th scope="row" data-label="Day">Day 02</th>
                      <td data-label="Time">09:00</td>
                      <td data-label="Session"><strong>Breakfast and free time</strong><span>Organiser&apos;s own time</span></td>
                      <td data-label="Duration">Flexible</td>
                    </tr>
                    <tr>
                      <th scope="row" data-label="Day">Day 02</th>
                      <td data-label="Time">16:30</td>
                      <td data-label="Session"><strong>Group reflection</strong><span>Time to pause and reflect together.</span></td>
                      <td data-label="Duration">60 mins</td>
                    </tr>
                    <tr>
                      <th scope="row" data-label="Day">Day 03</th>
                      <td data-label="Time">08:00</td>
                      <td data-label="Session"><strong>Breathing practice</strong><span>A calm start before the final day.</span></td>
                      <td data-label="Duration">30 mins</td>
                    </tr>
                    <tr>
                      <th scope="row" data-label="Day">Day 03</th>
                      <td data-label="Time">10:00</td>
                      <td data-label="Session"><strong>Closing conversation</strong><span>An example group session to bring the programme together.</span></td>
                      <td data-label="Duration">45 mins</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <footer className={styles.exampleDocumentFooter}>
                <p>Sessions, timing and practitioners are discussed after we understand your group.</p>
                <p>Sample programme · 01 / 01</p>
              </footer>
            </article>
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
              <details>
                <summary>What should I do next?</summary>
                <p>Send your group size, possible dates and what you want participants to get from the experience.</p>
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
            </div>
            <div className={styles.contactForm}>
              <ProgrammeEnquiryForm />
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <BrandWordmark caption="Wellness programme design · Bali" className={styles.footerBrand} />
          <nav aria-label="Legal" className={styles.footerLinks}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Website terms</Link>
          </nav>
        </footer>
      </div>
    </>
  );
}
