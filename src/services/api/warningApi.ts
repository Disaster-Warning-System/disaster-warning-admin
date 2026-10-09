"use client";

import apiClient from "../../api/axios.js";

export const SEVERITY_OPTIONS = ["Advisory", "Watch", "Warning", "Evacuation Order"];
export const TARGET_MODE_OPTIONS = ["District", "River Basin"];
export const LANGUAGE_OPTIONS = ["Sinhala", "Tamil", "English"];
export const CHANNEL_OPTIONS = [
  { value: "SMS", label: "SMS" },
  { value: "Push", label: "Push notifications" },
];

export const AREA_OPTIONS: Record<string, string[]> = {
  District: ["Colombo", "Gampaha"],
  "River Basin": ["Kelani River Basin"],
};

const recipientEstimates: Record<string, number> = {
  Colombo: 1250,
  Gampaha: 980,
  "Kelani River Basin": 1680,
};

const simulatedRecipientIds: Record<string, string[]> = {
  Colombo: ["C001", "C002", "C003"],
  Gampaha: ["C003", "C004"],
  "Kelani River Basin": ["C002", "C005"],
};

export function estimateRecipients(areas: string[], targetMode: string) {
  // The backend resolves recipients during dispatch; this is an explicitly simulated preview estimate.
  if (!AREA_OPTIONS[targetMode]) return 0;
  const knownAreas = [...new Set(areas)].filter((area) => simulatedRecipientIds[area]);
  if (knownAreas.length > 0) {
    return new Set(knownAreas.flatMap((area) => simulatedRecipientIds[area])).size;
  }
  return [...new Set(areas)].reduce((total, area) => total + (recipientEstimates[area] || 0), 0);
}

export function validateWarningForm(form: {
  headline?: string;
  instructions?: string;
  severity?: string;
  targetMode?: string;
  targetAreas?: string[];
  languages?: string[];
  channels?: string[];
}, step: number) {
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

export function saveWarningDraft(form: unknown) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("dmc-warning-draft", JSON.stringify(form));
  }
}

export function submitWarning(form: {
  hazardType: string;
  headline: string;
  instructions: string;
  severity: string;
  targetMode: string;
  targetAreas: string[];
  languages: string[];
  channels: string[];
  sourceReportId?: string;
}) {
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
  });
}