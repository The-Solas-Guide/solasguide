"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
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

  return [practitioner.name, practitioner.location, practitioner.summary, ...practitioner.modalities]
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

  const results = useMemo(
    () =>
      practitioners.filter(
        (practitioner) => matchesQuery(practitioner, query) && matchesFacets(practitioner, selection),
      ),
    [query, selection],
  );

  const activeFilters = facets.flatMap((facet) =>
    selection[facet.id].map((value) => ({ facetId: facet.id, facetLabel: facet.label, value })),
  );
  const hasActiveFilters = activeFilters.length > 0 || query.trim() !== "";
  const selectedCount = activeFilters.length;

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

  function clearAll() {
    setQuery("");
    setSelection(emptySelection);
  }

  return (
    <div className="border-x border-b border-border bg-card px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:px-16">
      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
        <div className="lg:contents">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <p className="review-label text-muted-foreground">Refine</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={filtersOpen}
              aria-controls="practitioner-filters"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal aria-hidden="true" />
              Filters{selectedCount > 0 ? ` (${selectedCount})` : ""}
            </Button>
          </div>

          <aside
            id="practitioner-filters"
            aria-label="Filter practitioners"
            className={cn(
              "mt-4 border-t border-border pt-6 lg:mt-0 lg:block lg:border-t-0 lg:pt-0",
              filtersOpen ? "block" : "hidden",
            )}
          >
            <div className="space-y-8">
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
                  placeholder="Name, practice or place"
                  className="mt-3"
                />
              </div>

              {facets.map((facet) => (
                <fieldset key={facet.id} className="border-0 p-0">
                  <legend className="review-label text-muted-foreground">{facet.label}</legend>
                  <div className="mt-3 space-y-0.5">
                    {facet.options.map((option) => {
                      const checked = selection[facet.id].includes(option);

                      return (
                        <label
                          key={option}
                          className="flex min-h-9 cursor-pointer items-center gap-3 text-sm text-foreground"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleValue(facet.id, option)}
                            className="size-4 shrink-0 accent-accent"
                          />
                          <span className={cn(checked ? "text-foreground" : "text-muted-foreground")}>
                            {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              <p className="border-t border-border pt-6 text-xs leading-6 text-muted-foreground">
                Filters for Approach, Works with, In-person or online, and Language are not shown.
                The published profiles do not yet record that information, and this prototype only
                filters on what they state.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-8 lg:mt-0">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <p aria-live="polite" className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{results.length}</span> of{" "}
              {practitioners.length} practitioners
            </p>
            {hasActiveFilters ? (
              <Button type="button" variant="link" onClick={clearAll} className="border-0 text-sm">
                Clear all
              </Button>
            ) : null}
          </div>

          {activeFilters.length > 0 ? (
            <ul aria-label="Active filters" className="mt-4 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <li key={`${filter.facetId}-${filter.value}`}>
                  <button
                    type="button"
                    onClick={() => toggleValue(filter.facetId, filter.value)}
                    aria-label={`Remove ${filter.facetLabel} filter ${filter.value}`}
                    className="inline-flex min-h-9 items-center gap-2 border border-border bg-muted/40 px-3 text-xs text-foreground transition-colors hover:border-foreground/45"
                  >
                    {filter.value}
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {results.length === 0 ? (
            <div className="mt-10 border border-border bg-muted/20 px-6 py-14 text-center">
              <h2 className="font-display text-2xl leading-tight">No practitioners match yet.</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
                Try a different term, or remove a filter to widen the search across the founding
                cohort.
              </p>
              <Button type="button" variant="outline" onClick={clearAll} className="mt-7">
                Clear all filters
              </Button>
            </div>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {results.map((practitioner) => (
                <li key={practitioner.slug} className="min-w-0">
                  <article className="group flex h-full min-w-0 flex-col overflow-hidden border border-border/75 bg-muted/20 transition-colors duration-300 hover:border-accent/55">
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
                      <h3 className="mt-1 font-display text-xl leading-[1.08] text-balance">
                        {practitioner.hasPublishedProfile ? (
                          <Link
                            href={`/practitioners/${practitioner.slug}`}
                            className="transition-colors hover:text-accent"
                          >
                            {practitioner.name}
                          </Link>
                        ) : (
                          practitioner.name
                        )}
                      </h3>
                      <p className="mt-2.5 line-clamp-3 text-sm leading-5 text-muted-foreground">
                        {practitioner.summary}
                      </p>
                      <div className="mt-auto border-t border-border/80 pt-3">
                        <span className="sr-only">Areas of support</span>
                        <p className="text-[0.68rem] leading-4 text-muted-foreground">
                          {practitioner.modalities.join(" · ")}
                        </p>
                        {practitioner.hasPublishedProfile ? (
                          <Link
                            href={`/practitioners/${practitioner.slug}`}
                            className="mt-3 inline-flex min-h-9 items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-foreground transition-colors hover:text-accent"
                          >
                            View editorial profile
                            <ArrowRight className="size-4" aria-hidden="true" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
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
