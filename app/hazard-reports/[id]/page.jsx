"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import AdditionalInfoList from "@/src/components/verification/AdditionalInfoList";
import DecisionPanel from "@/src/components/verification/DecisionPanel";
import NearbyReports from "@/src/components/verification/NearbyReports";
import ReopenPanel from "@/src/components/verification/ReopenPanel";
import ReportEvidence from "@/src/components/verification/ReportEvidence";
import ReporterHistory from "@/src/components/verification/ReporterHistory";
import VerificationHistory from "@/src/components/verification/VerificationHistory";
import { getReport } from "@/src/services/api/verificationApi";
import { REPORT_STATUS } from "@/src/utils/verification";

function Notice({ tone, children }) {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  };
  return (
    <p role="status" className={`rounded-xl border p-3 text-sm ${tones[tone]}`}>
      {children}
    </p>
  );
}

function ActionPanel({ report, onDone, onConflict }) {
  if (report.status === REPORT_STATUS.PENDING) {
    return (
      <DecisionPanel
        key={report.updatedAt}
        report={report}
        onDecided={({ report: updated }) => onDone(`Report marked as ${updated.status}.`)}
        onConflict={onConflict}
      />
    );
  }
  if (report.status === REPORT_STATUS.REJECTED) {
    return (
      <ReopenPanel
        report={report}
        onReopened={() => onDone("Report reopened and returned to the queue.")}
        onConflict={onConflict}
      />
    );
  }
  if (report.status === REPORT_STATUS.VERIFIED) {
    return (
      <section className={`${ui.card} space-y-3 p-5`}>
        <h2 className="text-lg font-bold text-[#16283D]">Verified</h2>
        <p className={`text-sm ${ui.muted}`}>
          Prepare a public warning from this report for the Issue Warning team.
        </p>
        <Link href={`/hazard-reports/${report._id}/warning-draft`} className={`${ui.primaryButton} sm:w-full`}>
          Draft warning
        </Link>
      </section>
    );
  }
  return (
    <section className={`${ui.card} space-y-2 p-5`}>
      <h2 className="text-lg font-bold text-[#16283D]">Waiting on the citizen</h2>
      <p className={`text-sm ${ui.muted}`}>
        The citizen has been asked for more information. The report returns to the queue when they reply.
      </p>
      {report.remarks ? (
        <p className="text-sm text-[#16283D]">
          <span className="font-semibold">Your request:</span> {report.remarks}
        </p>
      ) : null}
    </section>
  );
}

export default function HazardReportReviewPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!id) return undefined;
    let active = true;
    getReport(id)
      .then((data) => {
        if (!active) return;
        setReport(data);
        setError("");
      })
      .catch((reason) => {
        if (active) setError(reason?.message || "Unable to load the report.");
      });
    return () => {
      active = false;
    };
  }, [id, reloadCount]);

  function reloadWithNotice(nextNotice) {
    setNotice(nextNotice);
    setReloadCount((count) => count + 1);
  }

  function handleDone(message) {
    reloadWithNotice({ tone: "success", message });
  }

  // Another officer acted first: show what changed instead of the stale form
  function handleConflict(message) {
    reloadWithNotice({ tone: "warning", message: `${message}. The latest version is shown below.` });
  }

  return (
    <main className={ui.page}>
      <div className={ui.container}>
        <Link href="/hazard-reports" className={`${ui.secondaryLink} text-sm`}>
          ← Back to queue
        </Link>
        {notice ? <Notice tone={notice.tone}>{notice.message}</Notice> : null}
        {error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : report ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div className="space-y-6">
              <ReportEvidence report={report} />
              <AdditionalInfoList items={report.additionalInfo} />
              <NearbyReports reports={report.nearbyReports} />
            </div>
            <div className="space-y-6 lg:sticky lg:top-6">
              <ActionPanel report={report} onDone={handleDone} onConflict={handleConflict} />
              <ReporterHistory history={report.reporterHistory} />
              <VerificationHistory items={report.verifications} />
            </div>
          </div>
        ) : (
          <p role="status" className={`text-sm ${ui.muted}`}>
            Loading report...
          </p>
        )}
      </div>
    </main>
  );
}
