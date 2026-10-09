import type {
  DashboardData,
  DecisionInput,
  DecisionResult,
  ReportDetails,
  ReportFilters,
  ReportListResponse,
  WarningDraft,
} from "../../types/verification.ts";
import { buildReportQuery } from "../../utils/reportQuery.ts";
import { apiRequest } from "./apiClient.ts";

// Officer endpoints for Component 2 (Verify Hazard Report). All require a DMC Officer token.

const reportPath = (id: string) => `/api/reports/${encodeURIComponent(id)}`;

export async function getDashboard(): Promise<DashboardData> {
  return (await apiRequest<{ data: DashboardData }>("/api/officer/dashboard")).data;
}

export async function listReports(filters: Partial<ReportFilters>): Promise<ReportListResponse> {
  const query = buildReportQuery(filters);
  const body = await apiRequest<ReportListResponse>(`/api/reports${query ? `?${query}` : ""}`);
  return { count: body.count, total: body.total, page: body.page, pages: body.pages, data: body.data ?? [] };
}

export async function getReport(id: string): Promise<ReportDetails> {
  return (await apiRequest<{ data: ReportDetails }>(reportPath(id))).data;
}

export async function submitDecision(id: string, input: DecisionInput): Promise<DecisionResult> {
  const body = await apiRequest<{ data: DecisionResult }>(`${reportPath(id)}/verification`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return body.data;
}

export async function reopenReport(id: string, remarks: string): Promise<void> {
  await apiRequest(`${reportPath(id)}/reopen`, {
    method: "POST",
    body: JSON.stringify({ remarks }),
  });
}

export async function getWarningDraft(id: string): Promise<WarningDraft> {
  return (await apiRequest<{ data: WarningDraft }>(`${reportPath(id)}/warning-draft`)).data;
}
