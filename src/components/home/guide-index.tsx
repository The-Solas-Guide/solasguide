"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = ["people", "places", "experiences"] as const;

type GuideCategory = (typeof categories)[number];

type GuideItem = {
  title: string;
  location: string;
  description: string;
  image: string;
  imagePosition?: string;
};

const guideItems: Record<GuideCategory, readonly GuideItem[]> = {
  people: [
    ["Maya S.", "Ubud", "Somatic practice · Breathwork · Private sessions", "journey-practitioner.png"],
    ["Adi W.", "Canggu", "Movement · Bodywork · Retreat support", "exec-1430506b-6ab6-4bc3-8f24-b0a816abc9a3.png"],
    ["Leila R.", "Sanur", "Meditation · Sound practice · Group facilitation", "how-it-works-brief.png"],
    ["Sam K.", "Uluwatu", "Yoga · Mindfulness · Private guidance", "exec-02d0c4f5-376a-4a94-8501-b88ac59a9932.png"],
    ["Ayu P.", "Gianyar", "Balinese practice · Ceremony · Small groups", "why-solas-pavilion.png"],
    ["Niko T.", "Pererenan", "Breathwork · Movement · Group sessions", "exec-0d9fb98c-c711-4865-bdba-64d9d5bb91d3.png"],
    ["Sari D.", "North Bali", "Meditation · Restorative practice · Retreats", "why-solas-planning.png"],
    ["Ravi M.", "Central Bali", "Bodywork · Mobility · Personal sessions", "solas-guide-hero.png"],
  ].map(([title, location, description, image]) => ({
    title,
    location,
    description,
    image: `/images/solas-imagery/${image}`,
  })),
  places: [
    ["Fivelements Retreat Bali", "Mambal", "Riverside retreat setting · Wellness programmes", "why-solas-pavilion.png"],
    ["COMO Shambhala Estate", "Near Ubud", "Wellness estate · Personal programmes", "solas-guide-hero.png"],
    ["Desa Seni", "Canggu", "Retreat setting · Yoga · Wellness", "exec-1430506b-6ab6-4bc3-8f24-b0a816abc9a3.png"],
    ["The Yoga Barn", "Ubud", "Studios · Classes · Retreats", "journey-practitioner.png"],
    ["Usada Bali", "Ubud", "Holistic wellness centre · Private sessions", "exec-0d9fb98c-c711-4865-bdba-64d9d5bb91d3.png"],
    ["Ubud Bodyworks Centre", "Ubud", "Bodywork · Massage · Grounded practice", "why-solas-planning.png"],
    ["Bali Usada", "Bali", "Meditation programmes · Learning", "how-it-works-brief.png"],
    ["Bali Meditation Center", "Ubud", "Meditation · Quiet practice · Learning", "exec-02d0c4f5-376a-4a94-8501-b88ac59a9932.png"],
  ].map(([title, location, description, image]) => ({
    title,
    location,
    description,
    image: `/images/solas-imagery/${image}`,
  })),
  experiences: [
    ["A personal wellness programme", "Near Ubud", "A stay shaped around individual priorities", "solas-guide-hero.png"],
    ["Daily yoga and movement", "Ubud", "A varied programme of classes and practices", "journey-practitioner.png"],
    ["A riverside retreat", "Mambal", "A considered programme in a quiet natural setting", "why-solas-pavilion.png"],
    ["Private bodywork", "Ubud", "One-to-one sessions with an experienced practitioner", "why-solas-planning.png"],
    ["Meditation learning", "Bali", "Structured practice for different levels of experience", "how-it-works-brief.png"],
    ["Retreat planning support", "By arrangement", "People, places and practical context brought together", "exec-1430506b-6ab6-4bc3-8f24-b0a816abc9a3.png"],
    ["A small-group practice", "Central Bali", "A format shaped around a group and its purpose", "exec-0d9fb98c-c711-4865-bdba-64d9d5bb91d3.png"],
    ["A restorative day", "Bali", "A considered mix of space, practice and time", "exec-02d0c4f5-376a-4a94-8501-b88ac59a9932.png"],
  ].map(([title, location, description, image]) => ({
    title,
    location,
    description,
    image: `/images/solas-imagery/${image}`,
  })),
};

const categoryCopy: Record<GuideCategory, string> = {
  people: "People",
  places: "Places",
  experiences: "Experiences",
};

export function GuideIndex() {
  const [activeCategory, setActiveCategory] = useState<GuideCategory>("people");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectTab(index: number) {
    const category = categories[index];
    setActiveCategory(category);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % categories.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + categories.length) % categories.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = categories.length - 1;

    if (nextIndex !== undefined) {
      event.preventDefault();
      selectTab(nextIndex);
    }
  }

  return (
    <section aria-labelledby="guide-index-heading" className="border-x border-b border-border bg-card px-5 py-14 sm:px-8 md:px-12 md:py-20 lg:px-16">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="review-label text-accent">Explore the guide</p>
          <h2 id="guide-index-heading" className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] md:text-5xl">
            People, places and experiences that can shape your time in Bali.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-7 text-muted-foreground">
          Explore what you might ask us about. Share what you need, and we will recommend a relevant direction.
        </p>
      </div>

      <div aria-label="Guide preview categories" className="mt-9 flex border-b border-border" role="tablist">
        {categories.map((category, index) => {
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              ref={(element) => { tabRefs.current[index] = element; }}
              id={`guide-tab-${category}`}
              type="button"
              role="tab"
              aria-controls={`guide-panel-${category}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveCategory(category)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={cn(
                "relative min-h-11 flex-1 px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition-colors sm:flex-none sm:px-8",
                isActive ? "text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {categoryCopy[category]}
            </button>
          );
        })}
      </div>

      <div
        id={`guide-panel-${activeCategory}`}
        role="tabpanel"
        aria-labelledby={`guide-tab-${activeCategory}`}
        className="mt-5"
      >
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border lg:grid-cols-4">
          {guideItems[activeCategory].map((item) => (
            <article key={item.title} className="min-w-0 bg-card">
              <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className={cn("object-cover", item.imagePosition)}
                  sizes="(max-width: 1023px) 50vw, 25vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/75 to-transparent px-3 pt-10 pb-3 text-background sm:px-4">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em]">{item.location}</p>
                </div>
              </div>
              <div className="min-h-32 p-3 sm:p-4">
                <h3 className="font-display text-lg leading-tight sm:text-xl">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-sm">{item.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <Link href="/find-a-match" className={cn(buttonVariants(), "shrink-0")}>
            Tell us what you need <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
