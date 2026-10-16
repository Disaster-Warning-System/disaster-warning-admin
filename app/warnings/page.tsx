"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWarnings } from "@/src/services/api/warningApi";

type DeliveryLog = { channel: string; status: string; acceptedCount?: number; failedCount?: number };
type WarningItem = { alertId: string; hazardType: string; headline: string; targetAreas: string[]; status: string; severity: string; recipientCount: number; issuedAt: string; supersedesAlertId?: string; deliveryLogs?: DeliveryLog[] };

export default function WarningsPage() {
  const [warnings, setWarnings] = useState<WarningItem[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getWarnings().then(setWarnings).catch((e) => setError(e.response?.data?.message || "Unable to load warnings."));
  }, []);

  return <main className="mx-auto max-w-6xl p-6 sm:p-8">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold">Issued warnings</h1><p className="mt-1 text-sm text-slate-600">Track delivery outcomes and prepare linked updates.</p></div>
      <Link href="/warnings/create" className="button-primary">Issue warning</Link>
    </header>
    {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {!warnings.length && !error ? <p className="rounded-xl border bg-white p-6 text-sm text-slate-600">No warnings have been issued.</p> : null}
    <div className="space-y-3">{warnings.map((warning) => <article key={warning.alertId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{warning.alertId} · {warning.hazardType}</p><h2 className="mt-1 text-lg font-bold">{warning.headline}</h2><p className="mt-1 text-sm text-slate-600">{warning.targetAreas?.join(", ")}</p></div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{warning.status} · {warning.severity}</span>
      </div>
      <p className="mt-3 text-sm text-slate-700">{warning.recipientCount} unique recipients · {new Date(warning.issuedAt).toLocaleString()}</p>
      {warning.supersedesAlertId && <p className="mt-1 text-xs text-slate-500">Updates {warning.supersedesAlertId}</p>}
      <div className="mt-3 flex flex-wrap gap-2">{warning.deliveryLogs?.map((log) => <span key={log.channel} className="rounded bg-slate-100 px-2 py-1 text-xs">{log.channel}: {log.status} ({log.acceptedCount || 0} accepted, {log.failedCount || 0} failed)</span>)}</div>
      <div className="mt-4 flex gap-3"><Link className="text-sm font-semibold text-blue-700 underline" href={`/warnings/${encodeURIComponent(warning.alertId)}`}>Delivery details</Link><Link className="text-sm font-semibold text-blue-700 underline" href={`/warnings/create?supersedesAlertId=${encodeURIComponent(warning.alertId)}`}>Escalate or update</Link></div>
    </article>)}</div>
  </main>;
}
