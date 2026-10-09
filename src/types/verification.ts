// Types for the officer verification API (Component 2). They mirror the backend contract exactly.

export const HAZARD_TYPES = ["Flood", "Landslide", "Cyclone", "Fire", "Earthquake", "Other"] as const;
export type HazardType = (typeof HAZARD_TYPES)[number];

export const SEVERITIES = ["Low", "Medium", "High"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const REPORT_STATUSES = [
  "Pending Verification",
  "Needs More Information",
  "Verified",
  "Rejected",
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const DECISIONS = ["Verified", "Rejected", "Needs More Information"] as const;
export type Decision = (typeof DECISIONS)[number];

/** A history entry can also record a reopen, which is not an officer decision on a pending report. */
export type HistoryDecision = Decision | "Reopened";

export const SORT_OPTIONS = ["newest", "severity"] as const;
export type ReportSort = (typeof SORT_OPTIONS)[number];

export type Checklist = {
  locationChecked: boolean;
  evidenceReviewed: boolean;
  duplicatesChecked: boolean;
};

export type ReportListItem = {
  _id: string;
  reportId: string;
  hazardType: HazardType;
  severity: Severity;
  description: string;
  district: string;
  evidenceCount: number;
  status: ReportStatus;
  createdAt: string;
  ageMinutes: number;
  overdue: boolean;
};

export type ReportListResponse = {
  count: number;
  total: number;
  page: number;
  pages: number;
  data: ReportListItem[];
};

export type ReportFilters = {
  status: ReportStatus;
  hazardType: HazardType | "";
  district: string;
  search: string;
  sort: ReportSort;
  page: number;
  limit?: number;
};

export type OfficerRef = { _id: string; name: string };

export type Verification = {
  _id: string;
  decision: HistoryDecision;
  remarks: string;
  checklist?: Partial<Checklist>;
  severity?: Severity | null;
  officer: OfficerRef | null;
  createdAt: string;
};

export type AdditionalInfo = {
  message: string;
  photoFileId: string | null;
  addedAt: string;
};

export type NearbyReport = {
  _id: string;
  reportId: string;
  status: ReportStatus;
  severity: Severity;
  description: string;
  location: { district: string };
  createdAt: string;
};

export type ReportDetails = {
  _id: string;
  reportId: string;
  hazardType: HazardType;
  description: string;
  severity: Severity;
  status: ReportStatus;
  remarks: string;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
  location: {
    latitude: number | null;
    longitude: number | null;
    address: string;
    district: string;
  };
  photoUrl: string | null;
  evidence: { url: string; type: string }[];
  reportedBy: OfficerRef | string | null;
  reporterHistory: { total: number; verified: number; rejected: number } | null;
  nearbyReports: NearbyReport[];
  additionalInfo: AdditionalInfo[];
  verifications: Verification[];
};

export type DashboardActivity = {
  _id: string;
  decision: HistoryDecision;
  remarks: string;
  createdAt: string;
  report: { _id: string; reportId: string; hazardType: HazardType } | null;
  officer: OfficerRef | null;
};

export type DashboardData = {
  pendingCount: number;
  overdueCount: number;
  statusCounts: Record<ReportStatus, number>;
  recentActivity: DashboardActivity[];
};

export type DecisionInput = {
  decision: Decision;
  remarks: string;
  checklist: Checklist;
  severity?: Severity;
};

export type DecisionResult = {
  report: ReportDetails;
  verification: Verification;
};

export type WarningDraft = {
  headline: string;
  instruction: string;
  severity: "Warning" | "Watch" | "Advisory";
  targetAreas: string[];
  channels: string[];
  sourceReport: {
    _id: string;
    reportId: string;
    hazardType: HazardType;
    description: string;
    location: ReportDetails["location"];
  };
};
