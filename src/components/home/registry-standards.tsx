const standards = [
  {
    title: "Independent Review",
    copy: "We review professional history, training and the information that can be independently verified.",
  },
  {
    title: "Editorial Profile",
    copy: "Every profile is written and maintained by Solas to give readers a clear and consistent picture of the practitioner and their work.",
  },
  {
    title: "Thoughtful Introductions",
    copy: "If you would like help choosing, tell us what you are looking for and we’ll suggest who we think may be worth speaking to.",
  },
] as const;

export function RegistryStandards() {
  return (
    <section
      id="recognition"
      aria-labelledby="recognition-heading"
      className="border-x border-b border-border bg-muted/35 px-5 py-14 sm:px-8 md:px-12 md:py-20 lg:px-16"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div data-reveal>
          <p className="review-label text-muted-foreground">Recognition</p>
          <h2
            id="recognition-heading"
            className="mt-4 max-w-xl font-display text-3xl leading-[1.08] text-balance sm:text-4xl md:text-5xl md:leading-[1.05]"
          >
            Recognition is earned. Not purchased.
          </h2>
        </div>
        <div
          className="max-w-2xl space-y-5 text-sm leading-7 text-muted-foreground"
          data-reveal
          data-reveal-delay="1"
        >
          <p className="text-base leading-7 text-foreground">
            Every practitioner is reviewed before being recognised by The Solas Guide.
          </p>
          <p>
            We look at professional standing, experience, training and contribution to practice, and verify the claims we publish where they can be independently corroborated.
          </p>
          <p className="border-l border-accent pl-5 text-foreground">
            Recognition cannot be purchased.
            <br />
            It is the result of our review and editorial judgement.
          </p>
        </div>
      </div>

      <div
        className="mt-10 grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-3"
        data-reveal
        data-reveal-delay="1"
      >
        {standards.map((standard) => (
          <article
            key={standard.title}
            className="bg-card p-7 sm:p-8 lg:p-10"
          >
            <h3 className="font-display text-2xl leading-tight md:text-3xl">
              {standard.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{standard.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
