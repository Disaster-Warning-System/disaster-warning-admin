import {
  HAZARD_TYPES,
  REPORT_STATUSES,
  SORT_OPTIONS,
  type HazardType,
  type ReportFilters,
  type ReportSort,
  type ReportStatus,
} from "../types/verification.ts";

export const DEFAULT_FILTERS: ReportFilters = {
  status: "Pending Verification",
  hazardType: "",
  district: "",
  search: "",
  sort: "newest",
  page: 1,
};

type ParamReader = { get(name: string): string | null };

/** Reads queue filters from the page URL, falling back to defaults for anything missing or invalid. */
export function filtersFromParams(params: ParamReader): ReportFilters {
  const status = params.get("status");
  const hazardType = params.get("hazardType");
  const sort = params.get("sort");
  const page = Number(params.get("page"));
  return {
    status: REPORT_STATUSES.includes(status as ReportStatus) ? (status as ReportStatus) : DEFAULT_FILTERS.status,
    hazardType: HAZARD_TYPES.includes(hazardType as HazardType) ? (hazardType as HazardType) : "",
    district: params.get("district")?.trim() ?? "",
    search: params.get("search")?.trim() ?? "",
    sort: SORT_OPTIONS.includes(sort as ReportSort) ? (sort as ReportSort) : DEFAULT_FILTERS.sort,
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

/**
 * Builds the query string for both GET /api/reports and the queue page URL. Empty filters are
 * omitted so the backend applies its own defaults and the URL stays readable.
 */
export function buildReportQuery(filters: Partial<ReportFilters>): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.hazardType) params.set("hazardType", filters.hazardType);
  if (filters.district?.trim()) params.set("district", filters.district.trim());
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.sort && filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  return params.toString();
}
