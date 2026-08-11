import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const recognisedVenues = [
  {
    name: "Bambu Indah",
    type: "Boutique compound",
    location: "Sayan",
    styles: ["Heritage Javanese", "river-edge"],
    // Provisional stand-in until approved venue imagery is available.
    image: "/images/venues/desa-hay.webp",
    imageAlt: "A tropical compound pavilion and pool",
  },
  {
    name: "Como Shambhala Estate",
    type: "Wellness estate",
    location: "Begawan",
    styles: ["Modern jungle", "clinical-grade"],
    image: "/images/venues/como-shambhala-estate.jpg",
    imageAlt: "Outdoor gathering space at COMO Shambhala Estate",
  },
  {
    name: "Buahan, a Banyan Tree Escape",
    type: "Private villa estate",
    location: "Buahan",
    styles: ["No-walls architecture", "ridge-top"],
    // Provisional stand-in until approved venue imagery is available.
    image: "/images/venues/fivelements-retreat-bali.jpg",
    imageAlt: "An open-air retreat pavilion in the jungle",
  },
  {
    name: "Capella Ubud",
    type: "Tented camp",
    location: "Keliki",
    styles: ["Bill Bensley design", "expedition aesthetic"],
    // Provisional stand-in until approved venue imagery is available.
    image: "/images/venues/sava-bali.jpg",
    imageAlt: "A secluded retreat setting in Bali",
  },
] as const;

export function RecognisedVenues() {
  return (
    <section
      id="venues"
      aria-labelledby="venues-heading"
      className="border-x border-b border-border bg-muted/35 px-5 py-14 sm:px-8 md:px-12 md:py-20 lg:px-16"
      data-reveal
    >
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="review-label text-muted-foreground">Recognised venues</p>
          <h2
            id="venues-heading"
            className="mt-4 font-display text-3xl leading-[1.08] text-balance sm:text-4xl md:text-5xl md:leading-[1.05]"
          >
            Places that can hold what you are looking for.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
            Compounds, estates and clinical-wellness properties recognised with
            the same care as the facilitators who work within them.
          </p>
        </div>
        <Link
          href="/find-a-match"
          className="inline-flex min-h-11 items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.13em] text-foreground transition-colors hover:text-accent lg:self-end"
        >
          Ask about a venue <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {recognisedVenues.map((venue) => (
          <article
            key={venue.name}
            className="group flex min-w-0 flex-col overflow-hidden border border-border bg-card"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
              <Image
                src={venue.image}
                alt={venue.imageAlt}
                fill
                className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
                sizes="(max-width: 1023px) 50vw, 25vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-3 sm:p-4">
              <h3 className="min-h-[2.5rem] font-display text-lg leading-tight sm:min-h-[3rem] sm:text-xl">
                {venue.name}
              </h3>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span>{venue.type}</span>
                <span aria-hidden="true" className="px-1.5 text-border">
                  ·
                </span>
                <span>{venue.location}</span>
              </p>
              <ul className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t border-border pt-3">
                {venue.styles.map((style, index) => (
                  <li
                    key={style}
                    className={cn(
                      "flex items-center gap-1.5 text-[0.7rem] leading-4 text-muted-foreground sm:text-xs sm:leading-5",
                    )}
                  >
                    {index > 0 ? (
                      <span aria-hidden="true" className="text-border">
                        ·
                      </span>
                    ) : null}
                    <span className="whitespace-nowrap">{style}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
