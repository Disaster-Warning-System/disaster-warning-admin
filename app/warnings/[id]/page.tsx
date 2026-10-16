"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/src/api/axios.js";

type ProviderResult = { userId?: string; status: string; error?: string };
type DeliveryLog = { channel: string; status: string; acceptedCount?: number; failedCount?: number; eligibleCount?: number; attemptedCount?: number; reason?: string; providerResults?: ProviderResult[] };
type DeliveryWarning = { alertId: string; status: string; recipientCount: number; deliveryLogs: DeliveryLog[] };

export default function WarningPage() {
  const { id } = useParams<{ id: string }>();
  const [warning, setWarning] = useState<DeliveryWarning | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!id) return;
    apiClient.get(`/alerts/${encodeURIComponent(id)}/delivery-details`).then((response) => setWarning(response.data)).catch((e) => setError(e.response?.data?.message || "Unable to load delivery details."));
  }, [id]);
  if (error) return <main className="p-8"><p role="alert">{error}</p></main>;
  if (!warning) return <main className="p-8">Loading delivery details...</main>;
  return <main className="mx-auto max-w-4xl p-6 sm:p-8"><Link href="/warnings" className="text-sm text-blue-700 underline">← Warnings</Link><h1 className="mt-4 text-2xl font-bold">Delivery details: {warning.alertId}</h1><p className="mt-2">Status: <strong>{warning.status}</strong> · {warning.recipientCount} registered recipients</p><div className="mt-6 space-y-4">{warning.deliveryLogs?.map((log) => <section key={log.channel} className="rounded-xl border bg-white p-5"><h2 className="font-bold">{log.channel}: {log.status}</h2><p className="mt-1 text-sm">{log.acceptedCount || 0} accepted by provider · {log.attemptedCount || 0} attempted · {log.failedCount || 0} not delivered · {log.eligibleCount || 0} eligible</p>{log.reason && <p className="mt-2 text-sm text-red-700">{log.reason}</p>}{(log.providerResults?.length ?? 0) > 0 && <ul className="mt-3 max-h-64 space-y-1 overflow-auto text-xs text-slate-600">{log.providerResults?.map((result, index) => <li key={`${result.userId || "recipient"}-${index}`}>{result.userId || "Recipient"}: {result.status}{result.error ? ` — ${result.error}` : ""}</li>)}</ul>}</section>)}</div></main>;
}
