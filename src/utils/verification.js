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
