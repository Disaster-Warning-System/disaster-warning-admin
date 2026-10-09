import type { Checklist, Decision, ReportDetails } from "../types/verification.ts";

export type DecisionBlocker = "location" | "evidence" | "remarks";

/** True when the report has any photo or evidence the officer must look at before verifying. */
export function reportHasEvidence(report: Pick<ReportDetails, "photoUrl" | "evidence">): boolean {
  return Boolean(report.photoUrl) || (report.evidence?.length ?? 0) > 0;
}

/**
 * Lists what still stops the officer from submitting, matching the backend's rules: Verify needs
 * the location check (plus the evidence check when evidence exists); Reject and Needs More
 * Information need remarks. An empty list means the decision can go to the confirm step.
 */
export function decisionBlockers(
  decision: Decision,
  checklist: Checklist,
  remarks: string,
  hasEvidence: boolean,
): DecisionBlocker[] {
  const blockers: DecisionBlocker[] = [];
  if (decision === "Verified") {
    if (!checklist.locationChecked) blockers.push("location");
    if (hasEvidence && !checklist.evidenceReviewed) blockers.push("evidence");
  } else if (!remarks.trim()) {
    blockers.push("remarks");
  }
  return blockers;
}

export function canSubmitDecision(
  decision: Decision,
  checklist: Checklist,
  remarks: string,
  hasEvidence: boolean,
): boolean {
  return decisionBlockers(decision, checklist, remarks, hasEvidence).length === 0;
}
