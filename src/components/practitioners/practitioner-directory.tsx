"use client";

import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  areaOfSupportOptions,
  getLocations,
  locationOptions,
  practitioners,
  type Practitioner,
} from "@/lib/practitioners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FacetId = "areas" | "locations";

type Facet = {
  id: FacetId;
  label: string;
  options: readonly string[];
  valuesFor: (practitioner: Practitioner) => readonly string[];
};

const facets: readonly Facet[] = [
  {
    id: "areas",
    label: "Areas of support",
    options: areaOfSupportOptions,
    valuesFor: (practitioner) => practitioner.modalities,
  },
  {
    id: "locations",
    label: "Location",
    options: locationOptions,
    valuesFor: getLocations,
  },
];

type Selection = Record<FacetId, readonly string[]>;

const emptySelection: Selection = { areas: [], locations: [] };

function matchesQuery(practitioner: Practitioner, query: string) {
  const term = query.trim().toLowerCase();
  if (term === "") return true;

  return [
    practitioner.name,
    practitioner.location,
    practitioner.summary,
    ...practitioner.modalities,
  ]
    .join(" ")
    .toLowerCase()
    .includes(term);
}

function matchesFacets(practitioner: Practitioner, selection: Selection) {
  return facets.every((facet) => {
    const selected = selection[facet.id];
    if (selected.length === 0) return true;

    const values = facet.valuesFor(practitioner);
    return selected.some((value) => values.includes(value));
  });
}

export function PractitionerDirectory() {
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<Selection>(emptySelection);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const closeFiltersRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;

    closeFiltersRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [filtersOpen]);

  const results = useMemo(
    () =>
      practitioners.filter(
        (practitioner) =>
          matchesQuery(practitioner, query) &&
          matchesFacets(practitioner, selection),
      ),
    [query, selection],
  );

  const activeFilters = facets.flatMap((facet) =>
    selection[facet.id].map((value) => ({
      facetId: facet.id,
      facetLabel: facet.label,
      value,
    })),
  );
  const hasActiveFilters = activeFilters.length > 0 || query.trim() !== "";

  function toggleValue(facetId: FacetId, value: string) {
    setSelection((current) => {
      const selected = current[facetId];
      return {
        ...current,
        [facetId]: selected.includes(value)
          ? selected.filter((entry) => entry !== value)
          : [...selected, value],
      };
    });
  }

  function setFacetValue(facetId: FacetId, value: string) {
    setSelection((current) => ({
      ...current,
      [facetId]: value === "" ? [] : [value],
    }));
  }

  function clearAll() {
    setQuery("");
    setSelection(emptySelection);
  }

  return (
    <div className="border-x border-b border-border bg-card px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:px-16">
      <div>
        <aside
          id="practitioner-filters"
          aria-label="Filter practitioners"
          className="border-b border-border pb-6"
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 md:grid-cols-2 md:items-start md:gap-5 xl:grid-cols-5 xl:gap-6">
            <div>
              <label
                htmlFor="practitioner-search"
                className="review-label block text-muted-foreground"
              >
                Search the Guide
              </label>
              <Input
                id="practitioner-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name or practice"
                className="mt-3"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              aria-haspopup="dialog"
              aria-expanded={filtersOpen}
              aria-controls="mobile-practitioner-filters"
              onClick={() => setFiltersOpen(true)}
              className="w-32 justify-between px-3 md:hidden"
            >
              Filters
              <span className="flex items-center">
                {activeFilters.length > 0 ? (
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[0.62rem] text-background">
                    {activeFilters.length}
                  </span>
                ) : (
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                )}
              </span>
            </Button>

            <div
              id="mobile-practitioner-filters"
              role={filtersOpen ? "dialog" : undefined}
              aria-modal={filtersOpen ? true : undefined}
              aria-labelledby={filtersOpen ? "mobile-filters-title" : undefined}
              onKeyDown={(event) => {
                if (event.key === "Escape") setFiltersOpen(false);
              }}
              className={cn(
                filtersOpen
                  ? "fixed inset-0 z-50 flex items-end bg-foreground/45 p-3"
                  : "hidden",
                "md:contents",
              )}
            >
              <div className="max-h-[88dvh] w-full overflow-y-auto border border-border bg-card p-5 shadow-xl md:contents">
                <div className="mb-6 flex items-center justify-between md:hidden">
                  <h2
                    id="mobile-filters-title"
                    className="font-display text-2xl"
                  >
                    Filters
                  </h2>
                  <Button
                    ref={closeFiltersRef}
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Close filters"
                    onClick={() => setFiltersOpen(false)}
                  >
                    <X className="size-5" aria-hidden="true" />
                  </Button>
                </div>

                <FilterFields
                  selection={selection}
                  setFacetValue={setFacetValue}
                />

                <div className="mt-7 grid grid-cols-2 gap-3 md:hidden">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelection(emptySelection)}
                    className="px-2 text-[0.62rem] tracking-[0.08em] whitespace-nowrap"
                  >
                    Clear filters
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="px-2 text-[0.62rem] tracking-[0.08em] whitespace-nowrap"
                  >
                    Show {results.length} results
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {results.length}
              </span>{" "}
              of {practitioners.length} practitioners
            </p>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="link"
                onClick={clearAll}
                className="border-0 text-sm"
              >
                Clear all
              </Button>
            ) : null}
          </div>

          {activeFilters.length > 0 ? (
            <ul
              aria-label="Active filters"
              className="mt-4 flex flex-wrap gap-2"
            >
              {activeFilters.map((filter) => (
                <li key={`${filter.facetId}-${filter.value}`}>
                  <button
                    type="button"
                    onClick={() => toggleValue(filter.facetId, filter.value)}
                    aria-label={`Remove ${filter.facetLabel} filter ${filter.value}`}
                    className="inline-flex min-h-9 items-center gap-2 border border-border bg-muted/40 px-3 text-xs text-foreground transition-colors hover:border-foreground/45"
                  >
                    <span className="text-muted-foreground">
                      {filter.facetLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    {filter.value}
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {results.length === 0 ? (
            <div className="mt-8 border border-border bg-muted/20 px-6 py-12 text-center">
              <h2 className="font-display text-2xl leading-tight">
                No practitioners match yet.
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
                Try a different term, or remove a filter to widen your search.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={clearAll}
                className="mt-7"
              >
                Clear all filters
              </Button>
            </div>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((practitioner) => (
                <li key={practitioner.slug} className="min-w-0">
                  <article className="group h-full min-w-0 overflow-hidden border border-border/75 bg-muted/20 transition-colors duration-300 hover:border-accent/55 hover:bg-muted/30">
                    {practitioner.hasPublishedProfile ? (
                      <Link
                        href={`/practitioners/${practitioner.slug}`}
                        className="flex h-full min-w-0 flex-col focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
                      >
                        <PractitionerCard practitioner={practitioner} />
                      </Link>
                    ) : (
                      <div className="flex h-full min-w-0 flex-col">
                        <PractitionerCard practitioner={practitioner} />
                      </div>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterFields({
  selection,
  setFacetValue,
}: {
  selection: Selection;
  setFacetValue: (facetId: FacetId, value: string) => void;
}) {
  return (
    <div className="grid gap-5 md:contents">
      <div>
        <label
          htmlFor="pathway-filter"
          className="review-label block text-muted-foreground"
        >
          Pathway
        </label>
        <select
          id="pathway-filter"
          disabled
          className="mt-3 min-h-11 w-full rounded-md border border-border bg-muted/35 px-3 text-sm text-muted-foreground disabled:opacity-100"
        >
          <option>All pathways</option>
        </select>
      </div>

      {facets.map((facet) => (
        <div key={facet.id}>
          <label
            htmlFor={`${facet.id}-filter`}
            className="review-label block text-muted-foreground"
          >
            {facet.id === "areas" ? "Modality" : facet.label}
          </label>
          <select
            id={`${facet.id}-filter`}
            value={selection[facet.id][0] ?? ""}
            onChange={(event) => setFacetValue(facet.id, event.target.value)}
            className="mt-3 min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            <option value="">
              {facet.id === "areas" ? "All modalities" : "All locations"}
            </option>
            {facet.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div>
        <label
          htmlFor="format-filter"
          className="review-label block text-muted-foreground"
        >
          Format
        </label>
        <select
          id="format-filter"
          disabled
          className="mt-3 min-h-11 w-full rounded-md border border-border bg-muted/35 px-3 text-sm text-muted-foreground disabled:opacity-100"
        >
          <option>All formats</option>
        </select>
      </div>
    </div>
  );
}

function PractitionerCard({ practitioner }: { practitioner: Practitioner }) {
  return (
    <>
      <div className="relative aspect-[5/4] overflow-hidden bg-muted">
        <Image
          src={practitioner.image}
          alt={practitioner.imageAlt}
          fill
          className={cn(
            "object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-[1.025]",
            practitioner.imagePosition,
          )}
          sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 28vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {practitioner.location}
        </p>
        <h3 className="mt-2 font-display text-xl leading-[1.08] text-balance">
          {practitioner.name}
        </h3>
        <p className="mt-3 min-h-[3.75rem] line-clamp-3 text-sm leading-5 text-muted-foreground">
          {practitioner.summary}
        </p>
        <div className="mt-4 min-h-8 border-t border-border/80 pt-3">
          <span className="sr-only">Areas of support</span>
          <p className="text-[0.68rem] leading-4 text-muted-foreground">
            {practitioner.modalities.join(" · ")}
          </p>
        </div>
      </div>
    </>
  );
}
