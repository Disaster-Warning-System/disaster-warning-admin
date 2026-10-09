"use client";

import { useState } from "react";
import { verificationStyles as ui } from "@/src/components/verification/verificationStyles";
import { submitDecision } from "@/src/services/api/verificationApi";
import {
  REPORT_STATUS,
  SEVERITIES,
  hasEvidence,
  validateDecision,
} from "@/src/utils/verification";

const DECISIONS = [
  {
    value: REPORT_STATUS.VERIFIED,
    label: "Verify",
    help: "The hazard is real and the details are accurate.",
    activeClass: "border-emerald-500 bg-emerald-50",
  },
  {
    value: REPORT_STATUS.NEEDS_INFO,
    label: "Ask for more information",
    help: "Your note is shown to the citizen, who can reply.",
    activeClass: "border-sky-500 bg-sky-50",
  },
  {
    value: REPORT_STATUS.REJECTED,
    label: "Reject",
    help: "The report is false, a duplicate or not a hazard.",
    activeClass: "border-red-500 bg-red-50",
  },
];

const CHECKLIST = [
  { key: "locationChecked", label: "I checked the reported location" },
  { key: "evidenceReviewed", label: "I reviewed the attached evidence" },
  { key: "duplicatesChecked", label: "I checked for duplicate reports" },
];

const REMARKS_LABELS = {
  [REPORT_STATUS.VERIFIED]: "Remarks (optional)",
  [REPORT_STATUS.NEEDS_INFO]: "What should the citizen send? (shown to them)",
  [REPORT_STATUS.REJECTED]: "Reason for rejecting (shown to the citizen)",
};

/** The officer's decision on a pending report. The officer decides; the backend only records it. */
export default function DecisionPanel({ report, onDecided, onConflict }) {
  const [decision, setDecision] = useState("");
  const [checklist, setChecklist] = useState({
    locationChecked: false,
    evidenceReviewed: false,
    duplicatesChecked: false,
  });
  const [severity, setSeverity] = useState(report.severity || "Medium");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const evidenceAttached = hasEvidence(report);

  async function submit(event) {
    event.preventDefault();
    const problem = validateDecision({ decision, remarks, checklist, report });
    setError(problem);
    if (problem) return;

    setSubmitting(true);
    try {
      const result = await submitDecision(report._id, {
        decision,
        remarks: remarks.trim(),
        checklist,
        severity,
      });
      onDecided(result);
    } catch (reason) {
      if (reason?.statusCode === 409) {
        onConflict(reason.message);
        return;
      }
      setError(reason?.message || "The decision could not be saved. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className={`${ui.card} space-y-5 p-5`} noValidate>
      <h2 className="text-lg font-bold text-[#16283D]">Your decision</h2>

      <fieldset className="space-y-2">
        <legend className={ui.label}>Checklist</legend>
        {CHECKLIST.map((item) => (
          <label key={item.key} className="flex min-h-10 items-center gap-3 text-sm text-[#16283D]">
            <input
              type="checkbox"
              checked={checklist[item.key]}
              onChange={(event) =>
                setChecklist((current) => ({ ...current, [item.key]: event.target.checked }))
              }
              className="h-5 w-5 accent-[#1877B9]"
            />
            <span>
              {item.label}
              {item.key === "locationChecked" ||
              (item.key === "evidenceReviewed" && evidenceAttached) ? (
                <span className={`ml-1 text-xs ${ui.muted}`}>(needed to verify)</span>
              ) : null}
            </span>
          </label>
        ))}
      </fieldset>

      <label className={ui.label}>
        Severity
        <select
          value={severity}
          onChange={(event) => setSeverity(event.target.value)}
          className="mt-1 block min-h-11 w-full rounded-xl border border-[#DDE5EE] bg-white px-3 text-sm outline-none focus:border-[#1877B9] focus:ring-2 focus:ring-[#1877B9]/20"
        >
          {SEVERITIES.map((value) => (
            <option key={value} value={value}>
              {value}
              {value === report.severity ? " (as reported)" : ""}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-2">
        <legend className={ui.label}>Decision</legend>
        {DECISIONS.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer gap-3 rounded-xl border-2 p-3 transition ${
              decision === option.value ? option.activeClass : "border-[#DDE5EE] hover:border-[#1877B9]"
            }`}
          >
            <input
              type="radio"
              name="decision"
              value={option.value}
              checked={decision === option.value}
              onChange={() => setDecision(option.value)}
              className="mt-1 h-4 w-4 accent-[#1877B9]"
            />
            <span>
              <span className="block text-sm font-semibold text-[#16283D]">{option.label}</span>
              <span className={`block text-xs ${ui.muted}`}>{option.help}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {decision ? (
        <label className={ui.label}>
          {REMARKS_LABELS[decision]}
          <textarea
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            rows={4}
            className={ui.input}
          />
        </label>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={submitting} className={`${ui.primaryButton} sm:w-full`}>
        {submitting ? "Saving..." : "Submit decision"}
      </button>
    </form>
  );
}
