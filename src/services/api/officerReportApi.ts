import apiClient from '@/src/api/axios';
import type { HazardReport } from '@/src/types/hazardReport';

type ReportsResponse = { data: HazardReport[] };
type ReportResponse = { data: HazardReport };

export async function getOfficerReports(status = 'Pending Verification') {
  const response = await apiClient.get<ReportsResponse>('/reports', { params: { status } });
  return response.data.data;
}

export async function getOfficerReport(id: string) {
  const response = await apiClient.get<ReportResponse>(`/reports/${encodeURIComponent(id)}`);
  return response.data.data;
}

export async function verifyOfficerReport(
  id: string,
  decision: 'Verified' | 'Rejected' | 'Needs More Information',
  remarks: string,
) {
  const response = await apiClient.post<ReportResponse>(`/reports/${encodeURIComponent(id)}/verification`, {
    decision,
    remarks,
  });
  return response.data.data;
}
