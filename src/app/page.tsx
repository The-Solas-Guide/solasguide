import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { PractitionerTeaserCard } from "@/components/directory/practitioner-teaser-card";
import { FaqList } from "@/components/editorial/editorial-blocks";
import { JourneyEntryCards } from "@/components/enquiry/enquiry-patterns";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { DesignReviewControl } from "@/components/theme-switcher";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const selectedPractitioners = [
  {
    name: "Elena Marchetti",
    location: "London · Bali",
    modality: "Somatic therapy",
    descriptor: "A body-led practice grounded in clinical training and long-term client work.",
    experience: "14 years active practice",
    imageSrc: "/images/solas-imagery/practitioner-elena.png",
    imageAlt: "Elena Marchetti in a natural-light timber practice room",
  },
  {
    name: "Made Wirawan",
    location: "Ubud · Bali",
    modality: "Balinese traditional healing",
    descriptor: "Practises Usada Bali in a family lineage taught by his grandfather in Payangan.",
    experience: "22 years active practice",
    imageSrc: "/images/solas-imagery/practitioner-made.png",
    imageAlt: "Made Wirawan seated in an open-air pavilion surrounded by greenery",
  },
  {
    name: "Sofia Lindqvist",
    location: "Stockholm · Bali",
    modality: "Breathwork",
    descriptor: "Facilitates small, focused sessions with an emphasis on integration and safety.",
    experience: "9 years active practice",
    imageSrc: "/images/solas-imagery/practitioner-sofia.png",
    imageAlt: "Sofia Lindqvist walking beside a shaded retreat building",
  },
  {
    name: "Amara Hart",
    location: "Sydney · Bali",
    modality: "Couples facilitation",
    descriptor: "Creates space for conversation, repair, and more honest connection.",
    experience: "11 years active practice",
    imageSrc: "/images/solas-imagery/practitioner-couples.png",
    imageAlt: "Amara Hart seated beside an open window overlooking tropical greenery",
  },
] as const;

const modalityGroups = [
  {
    title: "Grounding & presence",
    items: ["Yoga", "Breathwork", "Meditation", "Sound & Music Healing"],
  },
  {
    title: "Mind & nervous system",
    items: ["Somatic & Trauma Healing", "Hypnotherapy", "Psychology & Counselling", "Coaching & Facilitation"],
  },
  {
    title: "Body & movement",
    items: ["Bodywork & Physical Therapy", "Movement & Dance", "Women’s Health", "Cold Exposure & Ice Bath"],
  },
  {
    title: "Tradition & ceremony",
    items: ["Traditional Balinese Healing", "Energy Healing & Reiki", "Cacao & Ceremony", "Spiritual & Esoteric Practices"],
  },
] as const;

const secondaryJourneys = [
  {
    title: "Find a venue for your retreat or gathering",
    description: "Find a setting that supports the kind of stay you want to create, from group size to the feeling you have in mind.",
    href: "/find-a-venue",
    image: "/images/solas-imagery/journey-retreat-venue.png",
    imageClassName: "object-center",
  },
  {
    title: "Find a workshop or event",
    description: "Add a meaningful workshop or event to your Bali stay, based on what you want to explore while you are here.",
    href: "/events-workshops",
    image: "/images/solas-imagery/journey-workshop-event.png",
    imageClassName: "object-center",
  },
  {
    title: "Join a selective practitioner cohort",
    description: "The Solas Guide considers experience, scope, professional context, and fit before inviting a practitioner into the guide.",
    href: "/become-a-practitioner",
    image: "/images/solas-imagery/journey-practitioner.png",
    imageClassName: "object-center",
  },
] as const;

const faqs = [
  {
    question: "What is The Solas Guide?",
    answer: "The Solas Guide is a Bali wellness concierge with a private practitioner network. You share what you want from your stay, and we help identify relevant people, places, and experiences before making appropriate introductions.",
  },
  {
    question: "What happens after I get started?",
    answer: "Your initial enquiry gives us a useful brief about your Bali stay. We then get in touch to understand the details, recommend a direction, and confirm suitability or availability with relevant practitioners or venues.",
  },
  {
    question: "Is there a cost to make an enquiry?",
    answer: "No. The initial enquiry is free. It is simply a way to share what you are looking for, so The Solas Guide can understand the most helpful next step.",
  },
  {
    question: "How are practitioners selected?",
    answer: "The Solas Guide considers a practitioner’s experience, scope of practice, professional context, clarity, and fit with the guide. The focus is on making a recommendation that is informed by more than a profile or search result.",
  },
  {
    question: "Can you help if I am not yet sure what I need?",
    answer: "Yes. Tell us why you are coming to Bali, how you would like to feel, and anything you already know about your dates or budget. You do not need to choose the right modality before getting in touch.",
  },
  {
    question: "Will The Solas Guide make bookings for me?",
    answer: "The Solas Guide does not take online bookings or payments. We help you understand the right options, make introductions, and work through the next details directly with the relevant practitioner or venue.",
  },
  {
    question: "Are the practitioners listed publicly?",
    answer: "No. The homepage offers a small introduction to the people and practices in the guide, but it is not a public directory. Specific recommendations follow from your brief, rather than an automated listing or direct contact system.",
  },
] as const;

export default function Home() {
  return (
    <>
      <DesignReviewControl />
      <div className="mx-auto w-full max-w-[1440px] px-3 py-3 md:px-5 md:py-5">
        <SiteHeader />

        <main>
          <section className="relative mt-3 min-h-[min(720px,calc(100svh-2rem))] overflow-hidden border border-border bg-card">
            <Image
              src="/images/solas-imagery/solas-guide-hero.png"
              alt="A quiet garden pavilion in Bali where a visitor reflects with a notebook"
              fill
              unoptimized
              priority
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 1400px"
            />
            <div className="absolute inset-0 bg-foreground/40" />
            <div className="relative flex min-h-[min(720px,calc(100svh-2rem))] items-end p-7 text-background md:p-14 lg:p-20">
              <div className="max-w-2xl">
                <p className="text-[10px] uppercase tracking-[0.24em] text-background/70">A private wellness network in Bali</p>
                <h1 className="mt-6 max-w-2xl font-display text-5xl leading-[0.98] tracking-tight md:text-7xl">
                  Your Bali wellness stay, shaped around the right people.
                </h1>
                <p className="mt-7 max-w-xl text-base leading-7 text-background/80 md:text-lg">
                  The Solas Guide connects you with a trusted network of practitioners, places, and restorative experiences—then helps you shape the details around what you need.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a href="/find-a-practitioner" className={cn(buttonVariants(), "bg-background text-foreground hover:bg-background/85")}>
                    Get Started <ArrowRight />
                  </a>
                  <a href="#how-it-works" className="inline-flex h-10 items-center gap-2 px-4 text-xs font-medium uppercase tracking-[0.14em] text-background/85 transition-colors hover:text-background">
                    How it works <ArrowDown className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 grid border border-border bg-card md:mt-16 md:grid-cols-[0.95fr_1.05fr]">
            <div className="flex flex-col justify-center px-7 py-16 md:px-10 md:py-24 lg:pr-16">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">What The Solas Guide does</p>
              <h2 className="mt-5 max-w-xl font-display text-4xl leading-tight md:text-5xl">A private network, made useful for you.</h2>
              <p className="mt-7 max-w-lg text-base leading-8 text-muted-foreground">
                The Solas Guide is a wellness concierge for Bali. We listen to what you want from your stay, narrow a broad network to the people and places that may suit you, and make introductions where there is a good fit.
              </p>
              <div className="mt-7 border-l-2 border-accent pl-5">
                <p className="font-display text-xl leading-snug">More than a recommendation.</p>
                <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
                  From a practitioner to a retreat setting, workshop, or restorative experience, we help bring the relevant parts of your Bali stay into focus without turning it into a generic itinerary or booking platform.
                </p>
              </div>
            </div>
            <div className="relative min-h-[28rem] overflow-hidden md:min-h-full">
              <Image
                src="/images/solas-imagery/exec-1430506b-6ab6-4bc3-8f24-b0a816abc9a3.png"
                alt="A calm open-air Balinese interior surrounded by greenery"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </section>

          <section id="modalities" className="border-t border-border py-16 md:py-24">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">What we curate</p>
                <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight md:text-5xl">Wellness practices to meet you where you are.</h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                You do not need to know the right modality before you get in touch. A useful brief gives us the context to point you in the right direction.
              </p>
            </div>
            <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
              {modalityGroups.map((group) => (
                <div key={group.title} className="bg-card p-7 md:min-h-72 md:p-8">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{group.title}</p>
                  <ul className="mt-10 space-y-3" aria-label={group.title}>
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section id="how-it-works" className="border-t border-border bg-muted/30 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
              <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">Your Bali wellness experience, in three simple steps.</h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">Start with a free enquiry. It gives The Solas Guide the context to make a useful recommendation for your stay.</p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
              <div className="relative mx-auto min-h-[30rem] w-full max-w-sm overflow-hidden border border-border sm:min-h-[34rem]">
                <Image
                  src="/images/solas-imagery/how-it-works-brief.png"
                  alt="A visitor planning a Bali stay with a notebook and map at a quiet pavilion table"
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 32vw"
                />
              </div>

              <div className="space-y-1">
                {[
                  { n: "01", title: "Tell us what you are after", body: "Share when you are coming to Bali, what you would like from your stay, your budget, and any practices or experiences you are drawn to." },
                  { n: "02", title: "We find the right options", body: "We look across the guide and consider the practitioners, places, and experiences that best fit your brief." },
                  { n: "03", title: "We connect you", body: "Where there is a fit, we make a personal introduction and help you work through the practical next details directly." },
                ].map((step) => (
                  <article key={step.n} className={step.n === "01" ? "border border-border bg-card p-7 sm:p-8" : "border-l border-border px-7 py-6 sm:px-8"}>
                    <div className="flex items-baseline gap-4">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-accent">{step.n}</span>
                      <h3 className="font-display text-2xl leading-tight">{step.title}</h3>
                    </div>
                    <p className="mt-3 max-w-xl pl-7 text-sm leading-7 text-muted-foreground">{step.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="selected-practitioners" className="border-t border-border py-16 md:py-24">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">The people in the guide</p>
                <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight md:text-5xl">A practitioner network selected with care.</h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                The cards offer a glimpse of the people The Solas Guide knows. Your brief determines who is actually relevant to your stay.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {selectedPractitioners.map((practitioner) => (
                <PractitionerTeaserCard key={practitioner.name} {...practitioner} />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-start justify-between gap-5 border-t border-border pt-6 md:flex-row md:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">A private practitioner network</p>
                <p className="mt-2 max-w-2xl font-display text-2xl leading-tight md:text-3xl">40+ practitioners, with the context to help find the right fit.</p>
              </div>
              <a href="/find-a-practitioner" className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}>
                Let’s find the right practitioner for you <ArrowRight />
              </a>
            </div>
          </section>

          <section className="grid gap-3 border-t border-border py-16 md:grid-cols-[0.72fr_0.48fr_0.8fr] md:py-24">
            <div className="relative min-h-[27rem] overflow-hidden md:min-h-[36rem]">
              <Image src="/images/solas-imagery/why-solas-pavilion.png" alt="A quiet open-air pavilion and garden in Bali" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <div className="relative min-h-[20rem] overflow-hidden md:mt-20 md:min-h-[28rem]">
              <Image src="/images/solas-imagery/why-solas-planning.png" alt="A travel-planning table in a quiet Balinese interior" fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />
            </div>
            <div className="flex flex-col justify-end border border-border bg-muted/35 p-8 md:p-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Why The Solas Guide exists</p>
              <h2 className="mt-6 max-w-md font-display text-4xl leading-tight">Bali has so much to offer. Knowing where to begin is the hard part.</h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">
                The Solas Guide was created to make a high-quality wellness stay feel less like research and more like a useful conversation. Bring your dates, budget, and intention; we help you find a clearer way forward.
              </p>
            </div>
          </section>

          <section className="grid gap-8 border-t border-border py-16 md:grid-cols-[0.9fr_1.1fr] md:items-center md:py-24">
            <div className="relative min-h-[22rem] overflow-hidden md:min-h-[30rem]">
              <Image
                src="/images/solas-imagery/exec-02d0c4f5-376a-4a94-8501-b88ac59a9932.png"
                alt="A quiet Balinese pavilion overlooking a lush valley"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
              />
            </div>
            <div className="flex flex-col justify-center md:px-8 lg:px-14">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Why fit matters</p>
              <h2 className="mt-5 max-w-xl font-display text-4xl leading-tight md:text-5xl">The right person can change the shape of your stay.</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground">
                A practice or experience should fit more than a category. It should make sense for what you are looking for, who you are travelling with, and how you want your time in Bali to feel.
              </p>
              <div className="mt-7 max-w-xl border-l-2 border-accent pl-5">
                <p className="font-display text-xl leading-snug">The details you share help make the introduction more useful.</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">That is why The Solas Guide starts with a conversation, not a public list.</p>
              </div>
            </div>
          </section>

          <section className="grid gap-8 border-t border-border py-16 md:grid-cols-[0.75fr_1.25fr] md:py-24">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">A few practical details</p>
              <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">Questions before you begin.</h2>
            </div>
            <FaqList items={faqs} />
          </section>

          <section id="journeys" className="border-t border-border py-16 md:py-24">
            <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Start your journey</p>
                <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight md:text-5xl">Start with the Bali stay you want to create.</h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">Your initial enquiry is free. Share a few details and The Solas Guide will follow up personally.</p>
            </div>
            <a href="/find-a-practitioner" className="group flex min-h-72 flex-col justify-end border border-accent bg-accent p-8 text-accent-foreground transition-colors hover:bg-accent/90 md:p-10">
              <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
                <div>
                  <h3 className="font-display text-4xl md:text-5xl">Get Started</h3>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-accent-foreground/75">Share your dates, budget, and what you want from your time in Bali. The Solas Guide will help bring the relevant people and details together.</p>
                </div>
                <ArrowRight className="size-7 transition-transform group-hover:translate-x-1" />
              </div>
            </a>
            <div className="mt-10">
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Other ways The Solas Guide may help</p>
              <JourneyEntryCards items={secondaryJourneys} />
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
