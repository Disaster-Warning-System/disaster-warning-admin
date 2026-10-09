"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import WarningDraftCard from "@/src/components/verification/WarningDraftCard";
import { getWarningDraft } from "@/src/services/api/verificationApi";

export default function WarningDraftPage() {
  const { id } = useParams();
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getWarningDraft(id)
      .then(setDraft)
      .catch((reason) => setError(reason?.message || "Unable to prepare the warning draft."));
  }, [id]);

  return (
    <main className={ui.page}>
      <div className={`${ui.container} max-w-3xl`}>
        <Link href={`/hazard-reports/${id}`} className={`${ui.secondaryLink} text-sm`}>
          ← Back to report
        </Link>
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1877B9]">Verification</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#16283D]">Warning draft</h1>
          <p className={`mt-1 text-sm ${ui.muted}`}>
            Pre-filled from the verified report. The Issue Warning team reviews and sends it.
          </p>
        </header>
        {error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : draft ? (
          <WarningDraftCard draft={draft} />
        ) : (
          <p role="status" className={`text-sm ${ui.muted}`}>
            Preparing draft...
          </p>
        )}
      </div>
    </main>
  );
}
