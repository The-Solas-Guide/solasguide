import Image from "next/image";
import { practitioners } from "@/lib/practitioners";
import { cn } from "@/lib/utils";

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

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {practitioners.map((practitioner) => (
          <article
            key={practitioner.slug}
            className="group flex min-w-0 flex-col overflow-hidden border border-border/75 bg-muted/20 transition-colors duration-300 hover:border-accent/55"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-muted sm:aspect-[3/4] xl:aspect-[4/5]">
              <Image
                src={practitioner.image}
                alt={practitioner.imageAlt}
                fill
                className={cn(
                  "object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.025]",
                  practitioner.imagePosition,
                )}
                sizes="(max-width: 1023px) 50vw, 25vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div>
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {practitioner.location}
                </p>
                <h3 className="mt-1 font-display text-xl leading-[1.08] text-balance xl:text-[1.35rem]">
                  {practitioner.name}
                </h3>
              </div>
              <p className="mt-2.5 line-clamp-3 text-sm leading-5 text-muted-foreground xl:text-[0.75rem] xl:leading-[1.15rem]">
                {practitioner.summary}
              </p>
              <div className="mt-3 border-t border-border/80 pt-3">
                <span className="sr-only">Primary practice</span>
                <p className="font-display text-base leading-5 text-foreground xl:text-lg">
                  {practitioner.modalities[0]}
                </p>
                {practitioner.modalities.length > 1 ? (
                  <div className="mt-1">
                    <span className="sr-only">Supporting practices</span>
                    <p className="text-[0.68rem] leading-4 text-muted-foreground">
                      {practitioner.modalities.slice(1).join(" · ")}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
