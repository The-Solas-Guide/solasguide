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
  imageAlt?: string;
  imagePosition?: string;
};

const guideItems: Record<GuideCategory, readonly GuideItem[]> = {
  people: [
    {
      title: "Riza Sukman",
      location: "Ubud",
      description: "Somatic Experiencing · Bodywork · Breathwork",
      image: "/images/people/riza-sukman.jpg",
      imageAlt: "Portrait of Riza Sukman",
    },
    {
      title: "Pablo Castro",
      location: "Ubud",
      description: "Breathwork · Water work · Water therapy",
      image: "/images/people/pablo-castro.jpg",
      imageAlt: "Portrait of Pablo Castro",
    },
    {
      title: "Wayan Marcus Wistika",
      location: "Ubud",
      description: "Vinyasa · Power yoga · Hatha",
      image: "/images/people/marcus-wistika.jpg",
      imageAlt: "Wayan Marcus Wistika practising yoga outdoors",
      imagePosition: "object-[72%_center]",
    },
    {
      title: "Pak Merta Ada",
      location: "Sanur",
      description: "Bali Usada health meditation",
      image: "/images/people/pak-merta-ada.jpg",
      imageAlt: "Portrait of Pak Merta Ada",
    },
    {
      title: "Cat Wheeler",
      location: "Ubud",
      description: "Usui Reiki · Teaching · Private sessions",
      image: "/images/people/cat-wheeler.jpg",
      imageAlt: "Cat Wheeler seated with her dog",
      imagePosition: "object-left",
    },
    {
      title: "Ibu Jero",
      location: "Jimbaran · Denpasar",
      description: "Balinese traditional practice · High priestess",
      image: "/images/people/ibu-jero.jpg",
      imageAlt: "Ibu Jero standing at a Balinese water temple",
    },
    {
      title: "Sook Fun Chen",
      location: "Seminyak · Ubud",
      description: "Pilates · Gyrotonic · Rolfing",
      image: "/images/people/sook-fun-chen.jpg",
      imageAlt: "Portrait of Sook Fun Chen",
    },
    {
      title: "Rachel Ellery",
      location: "Ubud",
      description: "Osteopathy · Functional anatomy · Pilates",
      image: "/images/people/rachel-ellery.jpg",
      imageAlt: "Rachel Ellery holding an anatomical spine model",
    },
  ],
  places: [
    {
      title: "COMO Shambhala Estate",
      location: "Near Ubud",
      description: "Meetings · Wellness seminars · Resort buyout",
      image: "/images/venues/como-shambhala-estate.jpg",
      imageAlt: "Outdoor gathering space at COMO Shambhala Estate",
    },
    {
      title: "Intaaya",
      location: "Nusa Penida",
      description: "Private buyout · Leadership retreats · 26–38 guests",
      image: "/images/venues/intaaya.jpg",
      imageAlt: "A group dining beneath Intaaya's bamboo pavilion",
    },
    {
      title: "Fivelements Retreat Bali",
      location: "Mambal",
      description: "Meeting spaces · Group retreats · Programme support",
      image: "/images/venues/fivelements-retreat-bali.jpg",
      imageAlt: "A meeting room at Fivelements Retreat Bali",
    },
    {
      title: "REVĪVŌ Wellness Resort",
      location: "Nusa Dua",
      description: "Corporate events · Hosted retreats · Wellness facilities",
      image: "/images/venues/revivo-wellness-resort.webp",
      imageAlt: "Pool and gardens at REVĪVŌ Wellness Resort",
    },
    {
      title: "Desa Hay",
      location: "Tumbak Bayuh",
      description: "Full buyout · Meeting space · Dedicated team",
      image: "/images/venues/desa-hay.webp",
      imageAlt: "Pool and thatched pavilion at Desa Hay",
    },
    {
      title: "Nirvana Life Bali",
      location: "Canggu",
      description: "Corporate wellness · Group programming · Full-service facilities",
      image: "/images/venues/nirvana-life-bali.webp",
      imageAlt: "A group wellness session at Nirvana Life Bali",
    },
    {
      title: "Sava Bali",
      location: "Batukaru",
      description: "Up to 30 guests · Shala · Villas and lodges",
      image: "/images/venues/sava-bali.jpg",
      imageAlt: "A group sharing breakfast at Sava Bali",
    },
    {
      title: "Bloomfield Bali",
      location: "Umalas",
      description: "Hotel buyout · Group stays · Wellness events",
      image: "/images/venues/bloomfield-bali.jpg",
      imageAlt: "A long group dining table at Bloomfield Bali",
    },
  ],
  experiences: [
    {
      title: "A leadership offsite",
      location: "Nusa Penida",
      description: "Strategy sessions · Group facilitation · Private setting at Intaaya",
      image: "/images/experiences/leadership-offsite.jpg",
      imageAlt: "A facilitated group session overlooking the ocean at Intaaya",
    },
    {
      title: "A private Balinese cooking class",
      location: "Ubud",
      description: "A hands-on class shaped for private and corporate groups at Casa Luna",
      image: "/images/experiences/private-cooking-class.jpg",
      imageAlt: "A cooking teacher leading a class at Casa Luna Cooking School",
    },
    {
      title: "Ancient Sound Healing",
      location: "Ubud",
      description: "A group sound experience inside the purpose-built Pyramids of Chi",
      image: "/images/experiences/ancient-sound-healing.jpg",
      imageAlt: "The Pyramids of Chi surrounded by tropical gardens near Ubud",
    },
    {
      title: "A guided rice-field ride",
      location: "Near Ubud",
      description: "An easy guided cycling route through villages, rice fields and temple country",
      image: "/images/experiences/rice-field-cycling.jpg",
      imageAlt: "A cyclist riding through rice fields near COMO Shambhala Estate",
    },
    {
      title: "A daily wellness immersion",
      location: "Near Ubud",
      description: "Massage · Scheduled movement · Hydrotherapy at COMO Shambhala Estate",
      image: "/images/experiences/wellness-immersion.jpg",
      imageAlt: "A guest having breakfast overlooking the forest at COMO Shambhala Estate",
    },
    {
      title: "A facilitated strategy session",
      location: "Mambal",
      description: "A dedicated meeting space with programme support at Fivelements",
      image: "/images/venues/fivelements-retreat-bali.jpg",
      imageAlt: "A meeting room prepared for a group at Fivelements Retreat Bali",
    },
    {
      title: "A group wellness programme",
      location: "Canggu",
      description: "Movement · Breathwork · Recovery · Group dining at Nirvana Life Bali",
      image: "/images/venues/nirvana-life-bali.webp",
      imageAlt: "A group wellness session at Nirvana Life Bali",
    },
    {
      title: "A hosted retreat day",
      location: "Batukaru",
      description: "Shared meals · Group practice · Time together at Sava Bali",
      image: "/images/venues/sava-bali.jpg",
      imageAlt: "A group sharing breakfast during a retreat at Sava Bali",
    },
  ],
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
            <article key={item.title} className="group relative min-w-0 overflow-hidden bg-foreground">
              <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image
                  src={item.image}
                  alt={item.imageAlt ?? ""}
                  fill
                  className={cn("object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]", item.imagePosition)}
                  sizes="(max-width: 1023px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-white/80 sm:text-[0.62rem]">
                    {item.location}
                  </p>
                  <h3 className="mt-1.5 font-display text-base leading-[1.05] text-balance sm:text-xl">{item.title}</h3>
                  <p className="mt-2 text-[0.66rem] leading-[1.45] text-white/80 sm:text-xs sm:leading-5">{item.description}</p>
                </div>
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
