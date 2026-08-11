import Image from "next/image";
import { cn } from "@/lib/utils";

const registryPractitioners = [
  {
    name: "Riza Sukman",
    location: "Ubud",
    modalities: ["Somatic Experiencing", "Bodywork", "Breathwork"],
    summary:
      "Trained in Somatic Experiencing, with experience supporting retreat-intensive work.",
    image: "/images/people/riza-sukman.jpg",
    imageAlt: "Portrait of Riza Sukman",
  },
  {
    name: "Pablo Castro",
    location: "Ubud",
    modalities: ["Breathwork", "Water work", "Water therapy"],
    summary:
      "An Alchemy of Breath senior trainer with more than five years of experience across somatic, breathwork and water-based practice.",
    image: "/images/people/pablo-castro.jpg",
    imageAlt: "Portrait of Pablo Castro",
  },
  {
    name: "Wayan Marcus Wistika",
    location: "Ubud",
    modalities: ["Vinyasa", "Power yoga", "Hatha"],
    summary:
      "A Balinese E-RYT 500+ teacher whose work includes resorts, hotels, private villas and The Yoga Barn.",
    image: "/images/people/marcus-wistika.jpg",
    imageAlt: "Wayan Marcus Wistika practising yoga outdoors",
    imagePosition: "object-[72%_center]",
  },
  {
    name: "Pak Merta Ada",
    location: "Sanur",
    modalities: ["Bali Usada health meditation"],
    summary:
      "A teacher within the Bali Usada lineage who has shared this practice internationally since 1993.",
    image: "/images/people/pak-merta-ada.jpg",
    imageAlt: "Portrait of Pak Merta Ada",
  },
  {
    name: "Cat Wheeler",
    location: "Ubud",
    modalities: ["Usui Reiki", "Teaching", "Private sessions"],
    summary:
      "A Certified Reiki Master Teacher who has taught since 1998 and worked with more than 1,000 students.",
    image: "/images/people/cat-wheeler.jpg",
    imageAlt: "Cat Wheeler seated with her dog",
    imagePosition: "object-left",
  },
  {
    name: "Ibu Jero",
    location: "Jimbaran, Denpasar",
    modalities: ["Balinese traditional practice", "High priestess"],
    summary:
      "A fifth-generation Balinese Balian and Mangku whose practice includes private and group work.",
    image: "/images/people/ibu-jero.jpg",
    imageAlt: "Ibu Jero standing at a Balinese water temple",
  },
  {
    name: "Sook Fun Chen",
    location: "Seminyak, Ubud",
    modalities: ["Pilates", "Gyrotonic", "Rolfing"],
    summary:
      "Founder of Movement Matters Bali, with practice across Pilates, Gyrotonic, Rolfing and functional anatomy.",
    image: "/images/people/sook-fun-chen.jpg",
    imageAlt: "Portrait of Sook Fun Chen",
  },
  {
    name: "Rachel Ellery",
    location: "Ubud",
    modalities: ["Osteopathy", "Functional anatomy", "Pilates"],
    summary:
      "A British School of Osteopathy graduate with more than 26 years of professional practice.",
    image: "/images/people/rachel-ellery.jpg",
    imageAlt: "Rachel Ellery holding an anatomical spine model",
  },
] as const;

export function RegistryPreview() {
  return (
    <section
      id="registry"
      aria-labelledby="registry-heading"
      className="border-x border-b border-border bg-card px-5 py-14 sm:px-8 md:px-12 md:py-20 lg:px-16"
      data-reveal
    >
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="review-label text-accent">Volume One</p>
          <h2
            id="registry-heading"
            className="mt-4 max-w-3xl font-display text-3xl leading-[1.08] text-balance sm:text-4xl md:text-5xl md:leading-[1.05]"
          >
            Meet the Founding Practitioners
          </h2>
        </div>
        <div className="max-w-xl space-y-4 text-sm leading-7 text-muted-foreground lg:max-w-sm">
          <p>
            The inaugural edition of The Solas Guide brings together practitioners recognised for the quality of their work, depth of practice and professional standing.
          </p>
          <p>
            Browse the Guide or explore individual editorial profiles to understand who may be the right fit.
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {registryPractitioners.map((practitioner) => (
          <article
            key={practitioner.name}
            className="group flex min-w-0 flex-col overflow-hidden border border-border bg-background"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
              <Image
                src={practitioner.image}
                alt={practitioner.imageAlt}
                fill
                className={cn(
                  "object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]",
                  "imagePosition" in practitioner ? practitioner.imagePosition : undefined,
                )}
                sizes="(max-width: 1023px) 50vw, 25vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-3 sm:p-4">
              <h3 className="font-display text-lg leading-tight sm:text-xl">
                {practitioner.name}
              </h3>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {practitioner.location}
              </p>
              <div className="mt-5 border-t border-border pt-3">
                <p className="review-label text-[0.56rem] text-muted-foreground">Primary practice</p>
                <p className="mt-1 text-sm leading-5 text-foreground sm:text-base">
                  {practitioner.modalities[0]}
                </p>
                {practitioner.modalities.length > 1 ? (
                  <div className="mt-3">
                    <p className="review-label text-[0.56rem] text-muted-foreground">Supporting practices</p>
                    <p className="mt-1 text-[0.7rem] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
                      {practitioner.modalities.slice(1).join(" · ")}
                    </p>
                  </div>
                ) : null}
              </div>
              <p className="mt-4 border-t border-border pt-3 text-[0.72rem] leading-5 text-muted-foreground sm:text-xs sm:leading-5">
                {practitioner.summary}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
