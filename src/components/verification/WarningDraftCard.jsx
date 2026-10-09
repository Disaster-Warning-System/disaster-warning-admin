"use client";

import { useState } from "react";
import Link from "next/link";
import { verificationStyles as ui } from "@/src/components/verification/verificationStyles";
import { describeLocation } from "@/src/utils/verification";

function draftAsText(draft) {
  return [
    `Headline: ${draft.headline}`,
    `Alert level: ${draft.severity}`,
    `Target areas: ${draft.targetAreas.join(", ") || "(choose areas)"}`,
    `Channels: ${draft.channels.join(", ")}`,
    `Source report: ${draft.sourceReport.reportId}`,
  ].join("\n");
}

/** Read-only handoff to the Issue Warning component, which owns creating and sending alerts. */
export default function WarningDraftCard({ draft }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(draftAsText(draft));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const rows = [
    ["Headline", draft.headline],
    ["Alert level", draft.severity],
    ["Target areas", draft.targetAreas.join(", ") || "No district on the report. Choose areas when issuing."],
    ["Channels", draft.channels.join(", ")],
  ];

  return (
    <section className={`${ui.card} space-y-5 p-5`}>
      <dl className="divide-y divide-[#DDE5EE]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
            <dt className={`text-sm font-semibold ${ui.muted}`}>{label}</dt>
            <dd className="text-[#16283D]">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="rounded-xl bg-[#F5F7FA] p-4 text-sm">
        <p className="font-semibold text-[#16283D]">
          Source: {draft.sourceReport.reportId} · {draft.sourceReport.hazardType}
        </p>
        <p className="mt-1 text-[#16283D]">{draft.sourceReport.description}</p>
        <p className={`mt-1 ${ui.muted}`}>{describeLocation(draft.sourceReport.location)}</p>
      </div>

      <p className={`text-sm ${ui.muted}`}>
        Instructions for the public are written on the Create Warning screen.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => void copy()} className={ui.primaryButton}>
          {copied ? "Copied" : "Copy draft"}
        </button>
        <Link
          href="/warnings/create"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#1877B9] px-5 py-3 font-semibold text-[#1877B9] hover:bg-[#E8F2FA]"
        >
          Go to Create Warning
        </Link>
      </div>
    </section>
  );
}
