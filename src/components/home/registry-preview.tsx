import { PractitionerCard } from "@/components/practitioners/practitioner-card";
import { practitioners } from "@/lib/practitioners";

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

      <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
        {practitioners.map((practitioner) => (
          <PractitionerCard
            key={practitioner.slug}
            practitioner={practitioner}
            variant="registry"
          />
        ))}
      </div>
    </section>
  );
}
