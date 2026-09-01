"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getLocations,
  practitioners,
  type Practitioner,
} from "@/lib/practitioners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PractitionerCard } from "@/components/practitioners/practitioner-card";
import { cn } from "@/lib/utils";

type FacetId =
  | "areas"
  | "approach"
  | "works-with"
  | "locations"
  | "format"
  | "languages";

type Facet = {
  id: FacetId;
  label: string;
  allLabel: string;
  options: readonly string[];
  valuesFor: (practitioner: Practitioner) => readonly string[];
};

function sortedUnique(values: readonly string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function optionsFrom(getValues: (practitioner: Practitioner) => readonly string[]) {
  return sortedUnique(practitioners.flatMap(getValues));
}

const facets: readonly Facet[] = [
  {
    id: "areas",
    label: "Areas of support",
    allLabel: "All areas",
    options: optionsFrom((practitioner) => practitioner.areasOfSupport ?? []),
    valuesFor: (practitioner) => practitioner.areasOfSupport ?? [],
  },
  {
    id: "approach",
    label: "Approach",
    allLabel: "All approaches",
    options: optionsFrom((practitioner) =>
      practitioner.approach ? [practitioner.approach] : [],
    ),
    valuesFor: (practitioner) =>
      practitioner.approach ? [practitioner.approach] : [],
  },
  {
    id: "works-with",
    label: "Works with",
    allLabel: "All audiences",
    options: optionsFrom((practitioner) => practitioner.worksWith ?? []),
    valuesFor: (practitioner) => practitioner.worksWith ?? [],
  },
  {
    id: "locations",
    label: "Location",
    allLabel: "All locations",
    options: optionsFrom(getLocations),
    valuesFor: getLocations,
  },
  {
    id: "format",
    label: "In-person or online",
    allLabel: "All formats",
    options: optionsFrom((practitioner) => practitioner.delivery ?? []),
    valuesFor: (practitioner) => practitioner.delivery ?? [],
  },
  {
    id: "languages",
    label: "Languages",
    allLabel: "All languages",
    options: optionsFrom((practitioner) => practitioner.languages ?? []),
    valuesFor: (practitioner) => practitioner.languages ?? [],
  },
];

type Selection = Record<FacetId, readonly string[]>;

const emptySelection: Selection = {
  areas: [],
  approach: [],
  "works-with": [],
  locations: [],
  format: [],
  languages: [],
};

function matchesQuery(practitioner: Practitioner, query: string) {
  const term = query.trim().toLowerCase();
  if (term === "") return true;

  return [
    practitioner.name,
    practitioner.location,
    practitioner.summary,
    ...practitioner.modalities,
    ...(practitioner.areasOfSupport ?? []),
    practitioner.approach ?? "",
    ...(practitioner.worksWith ?? []),
    ...(practitioner.languages ?? []),
    ...(practitioner.delivery ?? []),
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
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
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
              aria-controls="practitioner-filter-dialog"
              onClick={() => setFiltersOpen(true)}
              className="w-32 justify-between px-3"
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
              id="practitioner-filter-dialog"
              role={filtersOpen ? "dialog" : undefined}
              aria-modal={filtersOpen ? true : undefined}
              aria-labelledby={filtersOpen ? "mobile-filters-title" : undefined}
              onKeyDown={(event) => {
                if (event.key === "Escape") setFiltersOpen(false);
              }}
              className={cn(
                filtersOpen
                  ? "fixed inset-0 z-50 flex items-end bg-foreground/45 p-3 sm:items-center sm:justify-center sm:p-6"
                  : "hidden",
              )}
            >
              <div className="max-h-[88dvh] w-full overflow-y-auto border border-border bg-card p-5 shadow-xl sm:max-w-3xl sm:p-7">
                <div className="mb-6 flex items-center justify-between">
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

                <div className="mt-7 grid grid-cols-2 gap-3">
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
                  <PractitionerCard practitioner={practitioner} />
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
    <div className="grid gap-5 sm:grid-cols-2">
      {facets.map((facet) => (
        <div key={facet.id}>
          <label
            htmlFor={`${facet.id}-filter`}
            className="review-label block text-muted-foreground"
          >
            {facet.label}
          </label>
          <select
            id={`${facet.id}-filter`}
            value={selection[facet.id][0] ?? ""}
            onChange={(event) => setFacetValue(facet.id, event.target.value)}
            disabled={facet.options.length === 0}
            className="mt-3 min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none disabled:bg-muted/35 disabled:text-muted-foreground disabled:opacity-100"
          >
            <option value="">
              {facet.options.length === 0 ? "No options listed" : facet.allLabel}
            </option>
            {facet.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}

    </div>
  );
}
