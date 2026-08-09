import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const registryFacilitators = [
  {
    name: "Riza Sukman",
    location: "Ubud",
    modalities: ["Somatic Experiencing", "Bodywork", "Breathwork"],
    image: "/images/people/riza-sukman.jpg",
    imageAlt: "Portrait of Riza Sukman",
  },
  {
    name: "Pablo Castro",
    location: "Ubud",
    modalities: ["Breathwork", "Water work", "Water therapy"],
    image: "/images/people/pablo-castro.jpg",
    imageAlt: "Portrait of Pablo Castro",
  },
  {
    name: "Wayan Marcus Wistika",
    location: "Ubud",
    modalities: ["Vinyasa", "Power yoga", "Hatha"],
    image: "/images/people/marcus-wistika.jpg",
    imageAlt: "Wayan Marcus Wistika practising yoga outdoors",
    imagePosition: "object-[72%_center]",
  },
  {
    name: "Pak Merta Ada",
    location: "Sanur",
    modalities: ["Bali Usada health meditation"],
    image: "/images/people/pak-merta-ada.jpg",
    imageAlt: "Portrait of Pak Merta Ada",
  },
  {
    name: "Cat Wheeler",
    location: "Ubud",
    modalities: ["Usui Reiki", "Teaching", "Private sessions"],
    image: "/images/people/cat-wheeler.jpg",
    imageAlt: "Cat Wheeler seated with her dog",
    imagePosition: "object-left",
  },
  {
    name: "Ibu Jero",
    location: "Jimbaran, Denpasar",
    modalities: ["Balinese traditional practice", "High priestess"],
    image: "/images/people/ibu-jero.jpg",
    imageAlt: "Ibu Jero standing at a Balinese water temple",
  },
  {
    name: "Sook Fun Chen",
    location: "Seminyak, Ubud",
    modalities: ["Pilates", "Gyrotonic", "Rolfing"],
    image: "/images/people/sook-fun-chen.jpg",
    imageAlt: "Portrait of Sook Fun Chen",
  },
  {
    name: "Rachel Ellery",
    location: "Ubud",
    modalities: ["Osteopathy", "Functional anatomy", "Pilates"],
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
          <p className="review-label text-accent">The Registry</p>
          <h2
            id="registry-heading"
            className="mt-4 max-w-3xl font-display text-3xl leading-[1.08] text-balance sm:text-4xl md:text-5xl md:leading-[1.05]"
          >
            Facilitators recognised for the depth of their work.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-7 text-muted-foreground">
          Browse the register below. When you are ready, tell us what you are
          looking for and we will help make a thoughtful introduction.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {registryFacilitators.map((facilitator) => (
          <article
            key={facilitator.name}
            className="group flex min-w-0 flex-col overflow-hidden border border-border bg-background"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
              <Image
                src={facilitator.image}
                alt={facilitator.imageAlt}
                fill
                className={cn(
                  "object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]",
                  "imagePosition" in facilitator ? facilitator.imagePosition : undefined,
                )}
                sizes="(max-width: 1023px) 50vw, 25vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-3 sm:p-4">
              <h3 className="min-h-[2.5rem] font-display text-lg leading-tight sm:min-h-[3rem] sm:text-xl">
                {facilitator.name}
              </h3>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {facilitator.location}
              </p>
              <ul className="mt-auto flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t border-border pt-3">
                {facilitator.modalities.map((modality, index) => (
                  <li
                    key={modality}
                    className="flex items-center gap-1.5 text-[0.7rem] leading-4 text-muted-foreground sm:text-xs sm:leading-5"
                  >
                    {index > 0 ? (
                      <span aria-hidden="true" className="text-border">
                        ·
                      </span>
                    ) : null}
                    <span className="whitespace-nowrap">{modality}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex justify-stretch sm:justify-end">
        <Link href="/find-a-match" className={cn(buttonVariants(), "w-full shrink-0 sm:w-auto")}>
          Build Your Retreat <ArrowRight />
        </Link>
      </div>
    </section>
  );
}
