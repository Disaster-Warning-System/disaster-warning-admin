// Values mirror the backend's src/utils/constants.js so filters and forms match what it accepts
export const HAZARD_TYPES = ["Flood", "Landslide", "Cyclone", "Fire", "Earthquake", "Other"];

export const SEVERITIES = ["Low", "Medium", "High"];

export const REPORT_STATUS = {
  PENDING: "Pending Verification",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  NEEDS_INFO: "Needs More Information",
};

export const REPORT_STATUSES = Object.values(REPORT_STATUS);

export function hasEvidence(report) {
  return Boolean(report?.photoFileId) || (report?.evidence?.length ?? 0) > 0;
}

/** Same rules the backend enforces, so the officer sees the problem before submitting. */
export function validateDecision({ decision, remarks, checklist, report }) {
  if (!decision) return "Choose a decision.";
  if (decision !== REPORT_STATUS.VERIFIED && !remarks?.trim()) {
    return decision === REPORT_STATUS.REJECTED
      ? "Enter the reason for rejecting this report."
      : "Tell the citizen what information you need.";
  }
  if (decision === REPORT_STATUS.VERIFIED) {
    if (!checklist?.locationChecked) return "Confirm that you checked the reported location.";
    if (hasEvidence(report) && !checklist?.evidenceReviewed) {
      return "Confirm that you reviewed the attached evidence.";
    }
  }
  return "";
}

/** Reads the queue filters from the URL, filling in the backend's defaults. */
export function readQueueFilters(searchParams) {
  const status = searchParams.get("status");
  const sort = searchParams.get("sort");
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  return {
    status: REPORT_STATUSES.includes(status) ? status : REPORT_STATUS.PENDING,
    hazardType: HAZARD_TYPES.includes(searchParams.get("hazardType"))
      ? searchParams.get("hazardType")
      : "",
    district: searchParams.get("district") || "",
    search: searchParams.get("search") || "",
    sort: sort === "severity" ? "severity" : "newest",
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

/** Builds the URL query for the filters, leaving out defaults so links stay short. */
export function buildQueueQuery(filters) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== REPORT_STATUS.PENDING) params.set("status", filters.status);
  if (filters.hazardType) params.set("hazardType", filters.hazardType);
  if (filters.district) params.set("district", filters.district);
  if (filters.search) params.set("search", filters.search);
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function formatAge(minutes) {
  if (!Number.isFinite(minutes) || minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.floor(hours / 24)} d`;
}

export function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

export function describeLocation(location) {
  if (!location) return "Location not provided";
  const parts = [];
  if (location.address) parts.push(location.address);
  if (location.district) parts.push(location.district);
  if (Number.isFinite(location.latitude) && Number.isFinite(location.longitude)) {
    parts.push(`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`);
  }
  return parts.length ? parts.join(" · ") : "Location not provided";
}
