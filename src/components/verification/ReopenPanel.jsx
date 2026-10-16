"use client";

import { useState } from "react";
import { verificationStyles as ui } from "@/src/components/verification/verificationStyles";
import { reopenReport } from "@/src/services/api/verificationApi";

/** Sends a wrongly rejected report back to the verification queue. */
export default function ReopenPanel({ report, onReopened, onConflict }) {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!remarks.trim()) {
      setError("Explain why this report should be reviewed again.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      onReopened(await reopenReport(report._id, remarks.trim()));
    } catch (reason) {
      if (reason?.statusCode === 409) {
        onConflict(reason.message);
        return;
      }
      setError(reason?.message || "The report could not be reopened. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className={`${ui.card} space-y-4 p-5`} noValidate>
      <div>
        <h2 className="text-lg font-bold text-[#16283D]">Rejected</h2>
        {report.rejectionReason ? (
          <p className="mt-1 text-sm text-[#16283D]">
            <span className="font-semibold">Reason:</span> {report.rejectionReason}
          </p>
        ) : null}
      </div>
      <label className={ui.label}>
        Why reopen this report?
        <textarea
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          rows={3}
          className={ui.input}
        />
      </label>
      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={submitting} className={`${ui.primaryButton} sm:w-full`}>
        {submitting ? "Reopening..." : "Reopen for verification"}
      </button>
    </form>
  );
}
