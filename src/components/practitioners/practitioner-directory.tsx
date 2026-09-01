"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useMemo, useState } from "react";
import type { Practitioner, PractitionerTermType } from "@/lib/practitioners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PractitionerCard } from "@/components/practitioners/practitioner-card";
import {
  PractitionerDirectoryEmpty,
  PractitionerDirectoryError,
} from "@/components/practitioners/practitioner-status";

export type FacetId =
  | "areas"
  | "approach"
  | "works-with"
  | "locations"
  | "format"
  | "languages";

export type FacetOption = {
  value: string;
  label: string;
};

type Facet = {
  id: FacetId;
  label: string;
  allLabel: string;
  options: readonly FacetOption[];
  valuesFor: (practitioner: Practitioner) => readonly string[];
};

export type Selection = Record<FacetId, readonly string[]>;

export const emptySelection: Selection = {
  areas: [],
  approach: [],
  "works-with": [],
  locations: [],
  format: [],
  languages: [],
};

function termOptions(
  practitioners: readonly Practitioner[],
  type: PractitionerTermType,
): FacetOption[] {
  const options = new Map<string, FacetOption & { sortOrder: number }>();
  for (const practitioner of practitioners) {
    for (const term of practitioner.terms) {
      if (term.type !== type || options.has(term.id)) continue;
      options.set(term.id, {
        value: term.id,
        label: term.name,
        sortOrder: term.sortOrder,
      });
    }
  }

  return [...options.values()]
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.label.localeCompare(right.label),
    )
    .map(({ value, label }) => ({ value, label }));
}

function termsFor(practitioner: Practitioner, type: PractitionerTermType) {
  return practitioner.terms
    .filter((term) => term.type === type)
    .map((term) => term.id);
}

export function getFacetDefinitions(
  practitioners: readonly Practitioner[],
): readonly Facet[] {
  const formatOptions: FacetOption[] = [];
  if (practitioners.some((practitioner) => practitioner.offersInPerson)) {
    formatOptions.push({ value: "in-person", label: "In-person" });
  }
  if (practitioners.some((practitioner) => practitioner.offersOnline)) {
    formatOptions.push({ value: "online", label: "Online" });
  }

  return [
    {
      id: "areas",
      label: "Areas of support",
      allLabel: "All areas",
      options: termOptions(practitioners, "support_area"),
      valuesFor: (practitioner) => termsFor(practitioner, "support_area"),
    },
    {
      id: "approach",
      label: "Approach",
      allLabel: "All approaches",
      options: termOptions(practitioners, "approach"),
      valuesFor: (practitioner) => termsFor(practitioner, "approach"),
    },
    {
      id: "works-with",
      label: "Works with",
      allLabel: "All audiences",
      options: termOptions(practitioners, "works_with"),
      valuesFor: (practitioner) => termsFor(practitioner, "works_with"),
    },
    {
      id: "locations",
      label: "Location",
      allLabel: "All locations",
      options: termOptions(practitioners, "location"),
      valuesFor: (practitioner) => termsFor(practitioner, "location"),
    },
    {
      id: "format",
      label: "In-person or online",
      allLabel: "All formats",
      options: formatOptions,
      valuesFor: (practitioner) => [
        ...(practitioner.offersInPerson ? ["in-person"] : []),
        ...(practitioner.offersOnline ? ["online"] : []),
      ],
    },
    {
      id: "languages",
      label: "Languages",
      allLabel: "All languages",
      options: termOptions(practitioners, "language"),
      valuesFor: (practitioner) => termsFor(practitioner, "language"),
    },
  ];
}

export function matchesQuery(practitioner: Practitioner, query: string) {
  const term = query.trim().toLowerCase();
  if (term === "") return true;

  return [
    practitioner.name,
    practitioner.descriptor ?? "",
    practitioner.summary ?? "",
    practitioner.about ?? "",
    ...practitioner.terms.map((linkedTerm) => linkedTerm.name),
  ]
    .join(" ")
    .toLowerCase()
    .includes(term);
}

export function matchesFacets(
  practitioner: Practitioner,
  selection: Selection,
  facets: readonly Facet[],
) {
  return facets.every((facet) => {
    const selected = selection[facet.id];
    if (selected.length === 0) return true;

    const values = facet.valuesFor(practitioner);
    return selected.some((value) => values.includes(value));
  });
}

type PractitionerDirectoryProps = {
  practitioners: readonly Practitioner[];
  error?: boolean;
};

export function PractitionerDirectory({
  practitioners,
  error = false,
}: PractitionerDirectoryProps) {
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<Selection>(emptySelection);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const facets = useMemo(
    () => getFacetDefinitions(practitioners),
    [practitioners],
  );

  const results = useMemo(
    () =>
      practitioners.filter(
        (practitioner) =>
          matchesQuery(practitioner, query) &&
          matchesFacets(practitioner, selection, facets),
      ),
    [facets, practitioners, query, selection],
  );

  const activeFilters = facets.flatMap((facet) =>
    selection[facet.id].map((value) => ({
      facetId: facet.id,
      facetLabel: facet.label,
      value,
      label:
        facet.options.find((option) => option.value === value)?.label ?? value,
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

  if (error) return <PractitionerDirectoryError />;

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
              />
            </div>

            <Dialog.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
              <Dialog.Trigger asChild>
                <Button
                  type="button"
                  variant="outline"
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
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/45" />
                <Dialog.Content
                  id="practitioner-filter-dialog"
                  className="fixed inset-0 z-50 flex items-end p-3 outline-none sm:items-center sm:justify-center sm:p-6"
                >
                  <div className="max-h-[88dvh] w-full overflow-y-auto border border-border bg-card p-5 shadow-xl sm:max-w-3xl sm:p-7">
                    <div className="mb-6 flex items-center justify-between">
                      <Dialog.Title asChild>
                        <h2 className="font-display text-2xl">Filters</h2>
                      </Dialog.Title>
                      <Dialog.Close asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Close filters"
                        >
                          <X className="size-5" aria-hidden="true" />
                        </Button>
                      </Dialog.Close>
                    </div>

                    <FilterFields
                      facets={facets}
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
                      <Dialog.Close asChild>
                        <Button
                          type="button"
                          className="px-2 text-[0.62rem] tracking-[0.08em] whitespace-nowrap"
                        >
                          Show {results.length} results
                        </Button>
                      </Dialog.Close>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
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
                    aria-label={`Remove ${filter.facetLabel} filter ${filter.label}`}
                    className="inline-flex min-h-9 items-center gap-2 border border-border bg-muted/40 px-3 text-xs text-foreground transition-colors hover:border-foreground/45"
                  >
                    <span className="text-muted-foreground">
                      {filter.facetLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    {filter.label}
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {results.length === 0 ? (
            practitioners.length === 0 ? (
              <PractitionerDirectoryEmpty />
            ) : (
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
            )
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
  facets,
  selection,
  setFacetValue,
}: {
  facets: readonly Facet[];
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
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
