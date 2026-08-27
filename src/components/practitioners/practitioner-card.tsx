import Image from "next/image";
import Link from "next/link";
import type { Practitioner } from "@/lib/practitioners";
import { cn } from "@/lib/utils";

type PractitionerCardProps = {
  practitioner: Practitioner;
  variant?: "directory" | "registry";
};

export function PractitionerCard({
  practitioner,
  variant = "directory",
}: PractitionerCardProps) {
  const content = (
    <>
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          variant === "registry"
            ? "aspect-[4/5] sm:aspect-[3/4] xl:aspect-[4/5]"
            : "aspect-[5/4]",
        )}
      >
        {practitioner.image ? (
          <Image
            src={practitioner.image}
            alt={practitioner.imageAlt ?? ""}
            fill
            className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.025]"
            style={{
              objectPosition:
                practitioner.imageFocalX !== undefined &&
                practitioner.imageFocalY !== undefined
                  ? `${practitioner.imageFocalX}% ${practitioner.imageFocalY}%`
                  : undefined,
            }}
            sizes={
              variant === "registry"
                ? "(max-width: 767px) 100vw, 25vw"
                : "(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 28vw"
            }
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {practitioner.location ? (
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {practitioner.location}
          </p>
        ) : null}
        <h3 className="mt-2 font-display text-xl leading-[1.08] text-balance">
          {practitioner.name}
        </h3>
        {practitioner.summary ? (
          <p className="mt-2.5 min-h-[3.75rem] line-clamp-3 text-sm leading-5 text-muted-foreground">
            {practitioner.summary}
          </p>
        ) : null}
        <div className="mt-4 min-h-8 border-t border-border/80 pt-3">
          {practitioner.modalities.length > 0 ? (
            <>
              <span className="sr-only">Primary modality</span>
              <p className="text-[0.68rem] leading-4 text-muted-foreground">
                {[
                  practitioner.primaryModality ?? practitioner.modalities[0],
                  ...practitioner.modalities.filter(
                    (modality) =>
                      modality !==
                      (practitioner.primaryModality ?? practitioner.modalities[0]),
                  ),
                ]
                  .slice(0, 3)
                  .join(" · ")}
              </p>
            </>
          ) : null}
        </div>
      </div>
    </>
  );

  return (
    <article className="group h-full min-w-0 overflow-hidden border border-border/75 bg-muted/20 transition-colors duration-300 hover:border-accent/55 hover:bg-muted/30">
      {practitioner.hasPublishedProfile ? (
        <Link
          href={`/practitioners/${practitioner.slug}`}
          className="flex h-full min-w-0 flex-col focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
        >
          {content}
        </Link>
      ) : (
        <div className="flex h-full min-w-0 flex-col">{content}</div>
      )}
    </article>
  );
}
