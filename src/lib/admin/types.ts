/** The lifecycle shared by records that appear on the public site. */
export type PublicLifecycle = "draft" | "published" | "archived";

/** Taxonomy records use activation rather than public publishing. */
export type TaxonomyLifecycle = "active" | "inactive" | "archived";

/** Private records use workflow status. Archive state stays independent. */
export type OperationalWorkflow =
  | "new"
  | "contacted"
  | "reviewing"
  | "accepted"
  | "declined"
  | "closed";

export type CustomerEnquiryWorkflow = "new" | "contacted" | "closed";
export type PractitionerInterestWorkflow =
  | "new"
  | "reviewing"
  | "accepted"
  | "declined"
  | "closed";

export type ArchiveState = "active" | "archived";

export type RelationshipBlocker = {
  name: string;
  href: string;
  reason: string;
};

export type TableSort = {
  id: string;
  direction: "asc" | "desc";
};

export type AdminTableQueryState = {
  search: string;
  filters: Record<string, string[]>;
  status: string;
  page: number;
  pageSize: number;
  sort?: TableSort;
};

export const defaultAdminTableQuery: AdminTableQueryState = {
  search: "",
  filters: {},
  status: "all",
  page: 1,
  pageSize: 50,
  sort: undefined,
};

const pageSizes = new Set([10, 25, 50, 100]);

export function parseAdminTableQuery(
  params: URLSearchParams,
  defaults: AdminTableQueryState = defaultAdminTableQuery,
): AdminTableQueryState {
  const pageValue = Number(params.get("page"));
  const pageSizeValue = Number(params.get("pageSize"));
  const direction = params.get("dir");
  const sortId = params.get("sort");
  const sort: TableSort | undefined =
    sortId && (direction === "asc" || direction === "desc")
      ? { id: sortId, direction: direction as TableSort["direction"] }
      : undefined;
  const filters: Record<string, string[]> = {};

  for (const [key, value] of params.entries()) {
    if (!key.startsWith("filter.") || !value) continue;
    const id = key.slice("filter.".length);
    if (id) filters[id] = value.split(",").filter(Boolean);
  }

  return {
    search: params.get("q") ?? defaults.search,
    filters,
    status: params.get("status") ?? defaults.status,
    page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : defaults.page,
    pageSize: pageSizes.has(pageSizeValue) ? pageSizeValue : defaults.pageSize,
    sort,
  };
}

export function serializeAdminTableQuery(state: AdminTableQueryState) {
  const params = new URLSearchParams();
  if (state.search) params.set("q", state.search);
  if (state.status && state.status !== "all") params.set("status", state.status);
  if (state.page > 1) params.set("page", String(state.page));
  if (state.pageSize !== defaultAdminTableQuery.pageSize) {
    params.set("pageSize", String(state.pageSize));
  }
  if (state.sort) {
    params.set("sort", state.sort.id);
    params.set("dir", state.sort.direction);
  }
  for (const [id, values] of Object.entries(state.filters)) {
    if (values.length) params.set(`filter.${id}`, values.join(","));
  }
  return params.toString();
}

export function adminTableQueryKey(state: AdminTableQueryState) {
  return serializeAdminTableQuery(state);
}
