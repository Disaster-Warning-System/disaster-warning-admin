import type { HazardReport } from '@/src/types/hazardReport';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';

export function hazardPhotoUrl(fileId: string): string {
  return `${API_URL}/api/uploads/hazard-photo/${encodeURIComponent(fileId)}`;
}

export async function getHazardReports(): Promise<HazardReport[]> {
  const response = await fetch(`${API_URL}/api/hazard-reports`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Unable to load hazard reports.');
  }
  const body = (await response.json()) as { data?: HazardReport[] };
  return Array.isArray(body.data) ? body.data : [];
}

export async function getHazardReport(id: string): Promise<HazardReport> {
  const response = await fetch(`${API_URL}/api/hazard-reports/${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Unable to load the hazard report.');
  }
  const body = (await response.json()) as { data?: HazardReport };
  if (!body.data) {
    throw new Error('The server returned an invalid hazard report.');
  }
  return body.data;
}
