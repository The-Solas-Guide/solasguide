"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Dialog } from "radix-ui";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  emptyDirectoryFilters,
  parseDirectoryFilters,
  serializeDirectoryFilters,
  type DirectoryFacetType,
  type DirectoryFilters,
  type Practitioner,
  type PractitionerTermType,
} from "@/lib/practitioners";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PractitionerCard } from "@/components/practitioners/practitioner-card";
import {
  PractitionerDirectoryEmpty,
  PractitionerDirectoryError,
  PractitionerDirectoryInvalidFilters,
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
  /** Stable taxonomy slug used in shareable directory URLs. */
  slug?: string;
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
        slug: term.slug,
        sortOrder: term.sortOrder,
      });
    }
  }

  return [...options.values()]
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.label.localeCompare(right.label),
    )
    .map(({ value, label, slug }) => ({ value, label, slug }));
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
    formatOptions.push({
      value: "in-person",
      label: "In-person",
      slug: "in-person",
    });
  }
  if (practitioners.some((practitioner) => practitioner.offersOnline)) {
    formatOptions.push({ value: "online", label: "Online", slug: "online" });
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
  availablePractitioners?: readonly Practitioner[];
  filters?: DirectoryFilters;
  invalidFilters?: boolean;
  error?: boolean;
};

const directoryFacetTypes: readonly DirectoryFacetType[] = [
  "areas",
  "approach",
  "works-with",
  "locations",
  "format",
  "languages",
];

const directoryParameterNames = [
  "search",
  "query",
  "q",
  ...directoryFacetTypes,
] as const;

function emptySelectionForFacets(facets: readonly Facet[]): Selection {
  return Object.fromEntries(
    facets.map((facet) => [facet.id, []]),
  ) as unknown as Selection;
}

function selectionFromFilters(
  filters: DirectoryFilters,
  facets: readonly Facet[],
): Selection {
  const selection = emptySelectionForFacets(facets);
  for (const facet of facets) {
    const values = filters[facet.id];
    selection[facet.id] = values.flatMap((value) => {
      const option = facet.options.find(
        (candidate) => (candidate.slug ?? candidate.value) === value,
      );
      return option ? [option.value] : [];
    });
  }
  return selection;
}

function optionUrlValue(facet: Facet, value: string) {
  return facet.options.find((option) => option.value === value)?.slug ?? value;
}

function filtersFromSelection(
  selection: Selection,
  facets: readonly Facet[],
  query: string,
): DirectoryFilters {
  const valuesByFacet: Record<FacetId, readonly string[]> = {
    areas: [],
    approach: [],
    "works-with": [],
    locations: [],
    format: [],
    languages: [],
  };

  for (const facet of facets) {
    valuesByFacet[facet.id] = selection[facet.id].map((value) =>
      optionUrlValue(facet, value),
    );
  }

  return { query, ...valuesByFacet } as unknown as DirectoryFilters;
}

function removeDirectoryParameters(params: URLSearchParams) {
  for (const name of directoryParameterNames) params.delete(name);
}

export function PractitionerDirectory({
  practitioners,
  availablePractitioners = practitioners,
  filters = emptyDirectoryFilters,
  invalidFilters = false,
  error = false,
}: PractitionerDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamString = searchParams.toString();
  const [isPending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const facets = useMemo(
    () => getFacetDefinitions(availablePractitioners),
    [availablePractitioners],
  );
  const urlFilters = useMemo(
    () => parseDirectoryFilters(new URLSearchParams(searchParamString)),
    [searchParamString],
  );
  const [queryState, setQueryState] = useState(() => ({
    source: searchParamString,
    value: filters.query,
  }));
  const [selectionState, setSelectionState] = useState(() => ({
    source: searchParamString,
    value: selectionFromFilters(filters, facets),
  }));
  const searchDebounce = useRef<number | null>(null);
  const latestSearchParamString = useRef(searchParamString);
  const query =
    queryState.source === searchParamString ||
    isPending
      ? queryState.value
      : urlFilters.query;
  const canonicalSelection = useMemo(
    () => selectionFromFilters(urlFilters, facets),
    [facets, urlFilters],
  );
  const selection =
    selectionState.source === searchParamString ||
    isPending
      ? selectionState.value
      : canonicalSelection;

  useEffect(() => {
    latestSearchParamString.current = searchParamString;
  }, [searchParamString]);

  useEffect(() => {
    return () => {
      if (searchDebounce.current !== null) {
        window.clearTimeout(searchDebounce.current);
      }
    };
  }, []);

  const updateUrl = useCallback(
    (params: URLSearchParams, mode: "push" | "replace" = "push") => {
      const queryString = params.toString();
      const href = queryString ? `${pathname}?${queryString}` : pathname;
      latestSearchParamString.current = queryString;
      startTransition(() => {
        if (mode === "replace") {
          router.replace(href, { scroll: false });
        } else {
          router.push(href, { scroll: false });
        }
      });
      return queryString;
    },
    [pathname, router],
  );

  function handleSearchChange(value: string) {
    setQueryState({ source: searchParamString, value });
    if (searchDebounce.current !== null) {
      window.clearTimeout(searchDebounce.current);
    }
    searchDebounce.current = window.setTimeout(() => {
      const params = new URLSearchParams(latestSearchParamString.current);
      params.delete("search");
      params.delete("query");
      params.delete("q");
      const trimmed = value.trim();
      if (trimmed) params.set("search", trimmed);
      const destination = updateUrl(params, "replace");
      setQueryState({ source: destination, value: trimmed });
      searchDebounce.current = null;
    }, 250);
  }

  const activeFilters = facets.flatMap((facet) =>
    selection[facet.id].map((value) => ({
      facetId: facet.id,
      facetLabel: facet.label,
      value,
      label:
        facet.options.find((option) => option.value === value)?.label ?? value,
      urlValue: optionUrlValue(facet, value),
    })),
  );
  const hasActiveFilters = activeFilters.length > 0 || query.trim() !== "";

  function navigateSelection(nextSelection: Selection) {
    const params = new URLSearchParams(latestSearchParamString.current);
    removeDirectoryParameters(params);
    const serializedFilters = serializeDirectoryFilters(
      filtersFromSelection(nextSelection, facets, query),
    );
    for (const [key, value] of serializedFilters) {
      params.append(key, value);
    }
    const destination = updateUrl(params);
    setSelectionState({ source: destination, value: nextSelection });
  }

  function toggleValue(facetId: FacetId, value: string) {
    const selected = selection[facetId];
    const nextSelection = {
      ...selection,
      [facetId]: selected.includes(value)
        ? selected.filter((entry) => entry !== value)
        : [...selected, value],
    };
    navigateSelection(nextSelection);
  }

  function setFacetValue(facetId: FacetId, value: string) {
    const nextSelection = {
      ...selection,
      [facetId]: value === "" ? [] : [value],
    };
    navigateSelection(nextSelection);
  }

  function clearFilters() {
    const nextSelection = emptySelectionForFacets(facets);
    navigateSelection(nextSelection);
  }

  function clearAll() {
    if (searchDebounce.current !== null) {
      window.clearTimeout(searchDebounce.current);
      searchDebounce.current = null;
    }
    const params = new URLSearchParams(latestSearchParamString.current);
    removeDirectoryParameters(params);
    const destination = updateUrl(params);
    setQueryState({ source: destination, value: "" });
    setSelectionState({
      source: destination,
      value: emptySelectionForFacets(facets),
    });
  }

  if (error) return <PractitionerDirectoryError />;

  return (
    <div className="border-x border-b border-border bg-card px-5 py-12 sm:px-8 md:px-12 md:py-16 lg:px-16">
      <div>
        {invalidFilters ? <PractitionerDirectoryInvalidFilters /> : null}
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
                onChange={(event) => handleSearchChange(event.target.value)}
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
                        onClick={clearFilters}
                        className="px-2 text-[0.62rem] tracking-[0.08em] whitespace-nowrap"
                      >
                        Clear filters
                      </Button>
                      <Dialog.Close asChild>
                        <Button
                          type="button"
                          className="px-2 text-[0.62rem] tracking-[0.08em] whitespace-nowrap"
                        >
                          Show {practitioners.length} results
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
            <p
              aria-busy={isPending}
              aria-live="polite"
              className="text-sm text-muted-foreground"
            >
              Showing{" "}
              <span className="font-semibold text-foreground">
                {practitioners.length}
              </span>{" "}
              of {availablePractitioners.length} practitioners
            </p>
            {isPending ? (
              <span className="text-sm text-muted-foreground" role="status">
                Updating results…
              </span>
            ) : null}
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

          {practitioners.length === 0 ? (
            availablePractitioners.length === 0 ? (
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
              {practitioners.map((practitioner) => (
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
