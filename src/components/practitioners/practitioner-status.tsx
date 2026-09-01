export function PractitionerDirectoryError() {
  return (
    <div
      role="status"
      className="border-x border-b border-border bg-card px-5 py-12 text-center sm:px-8 md:px-12 md:py-16 lg:px-16"
    >
      <h2 className="font-display text-2xl leading-tight">
        The Guide is unavailable right now.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
        Please try again later.
      </p>
    </div>
  );
}

export function PractitionerDirectoryInvalidFilters() {
  return (
    <div
      role="status"
      className="mb-8 border border-border bg-muted/35 px-5 py-4 text-sm leading-7 text-muted-foreground sm:px-6"
    >
      Some filters in this link are no longer available. The Guide is showing
      results using the remaining filters.
    </div>
  );
}

export function PractitionerDirectoryEmpty() {
  return (
    <div className="mt-8 border border-border bg-muted/20 px-6 py-12 text-center">
      <h2 className="font-display text-2xl leading-tight">
        No practitioners are published yet.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
        The Guide will appear here when the next profile is ready.
      </p>
    </div>
  );
}

export function PractitionerProfileError() {
  return (
    <div className="border-x border-b border-border bg-card px-5 py-16 text-center sm:px-8 md:px-12 md:py-20 lg:px-16">
      <h1 className="font-display text-3xl leading-tight sm:text-4xl">
        This profile is unavailable right now.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">
        Please try again later.
      </p>
    </div>
  );
}
