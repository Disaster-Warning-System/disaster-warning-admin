"use client";

import apiClient from "../../api/axios.js";
import { DISTRICTS, RIVER_BASINS } from "../../constants/areas.ts";

export { apiClient };

export const SEVERITY_OPTIONS = ["Advisory", "Watch", "Warning", "Evacuation Order"];
export const TARGET_MODE_OPTIONS = ["District", "River Basin"];
export const LANGUAGE_OPTIONS = ["Sinhala", "Tamil", "English"];
export const CHANNEL_OPTIONS = [
  { value: "SMS", label: "SMS" },
  { value: "Email", label: "Email" },
  { value: "Push", label: "Push notifications" },
];

export const AREA_OPTIONS: Record<string, string[]> = {
  District: DISTRICTS,
  "River Basin": RIVER_BASINS,
};

export type WarningForm = {
  hazardType: string;
  headline: string;
  instructions: string;
  severity: string;
  targetMode: string;
  targetAreas: string[];
  languages: string[];
  channels: string[];
  sourceReportId?: string;
  supersedesAlertId?: string;
  minimumAcknowledged?: boolean;
  conflictAcknowledged?: boolean;
};

export type WarningPreview = {
  targetAreas: string[];
  recipientCount: number;
  minimumRecipients: number;
  belowMinimum: boolean;
  noRecipients: boolean;
  conflicts: Array<{ alertId: string; headline: string; severity: string; targetAreas: string[]; status: string; issuedAt: string }>;
  conflictWindowMinutes: number;
};

export function validateWarningForm(form: Partial<WarningForm>, step: number) {
  const errors: Record<string, string> = {};
  if (!form.targetAreas?.length) errors.targetAreas = "Select at least one target area.";
  if (!form.severity || !SEVERITY_OPTIONS.includes(form.severity)) errors.severity = "Select a valid severity.";
  if (!form.targetMode || !TARGET_MODE_OPTIONS.includes(form.targetMode)) errors.targetMode = "Select a valid target mode.";
  if (step >= 2) {
    if (!form.headline?.trim()) errors.headline = "Headline is required.";
    if (!form.instructions?.trim()) errors.instructions = "Instructions are required.";
    if (!form.languages?.length) errors.languages = "Select at least one language.";
    if (!form.channels?.length) errors.channels = "Select at least one delivery channel.";
  }
  return errors;
}

export function previewWarning(form: WarningForm) {
  return apiClient.post<WarningPreview>("/alerts/preview", {
    severity: form.severity,
    targetMode: form.targetMode,
    targetAreas: form.targetAreas,
    channels: form.channels,
    supersedesAlertId: form.supersedesAlertId,
  }).then((response) => response.data);
}

export async function saveWarningDraft(form: WarningForm, alertId?: string) {
  const body = {
    ...form,
    headline: form.headline.trim(),
    instructions: form.instructions.trim(),
    channels: form.channels,
  };
  const response = alertId
    ? await apiClient.put(`/alerts/drafts/${encodeURIComponent(alertId)}`, body)
    : await apiClient.post("/alerts/drafts", body);
  return response.data.draft;
}

export const getWarningDrafts = () => apiClient.get("/alerts/drafts").then((response) => response.data.drafts);
export const getWarningDraft = (alertId: string) => apiClient.get(`/alerts/drafts/${encodeURIComponent(alertId)}`).then((response) => response.data.draft);
export const deleteWarningDraft = (alertId: string) => apiClient.delete(`/alerts/drafts/${encodeURIComponent(alertId)}`);
export const getWarnings = () => apiClient.get("/alerts").then((response) => response.data);
export const getWarning = (alertId: string) => apiClient.get(`/alerts/${encodeURIComponent(alertId)}`).then((response) => response.data.alert);

export function submitWarning(form: WarningForm) {
  return apiClient.post("/alerts", {
    hazardType: form.hazardType,
    headline: form.headline.trim(),
    instructions: form.instructions.trim(),
    severity: form.severity,
    targetMode: form.targetMode,
    targetAreas: form.targetAreas,
    languages: form.languages,
    channels: form.channels,
    sourceReportId: form.sourceReportId || undefined,
    supersedesAlertId: form.supersedesAlertId || undefined,
    minimumAcknowledged: form.minimumAcknowledged === true,
    conflictAcknowledged: form.conflictAcknowledged === true,
  });
}
