"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import { getShelterOccupancyHistory } from "@/src/services/api/shelterApi";
import type { ShelterOccupancyHistory } from "@/src/types/shelter";
import { shelterStatus } from "@/src/utils/shelterStatus";

export default function ShelterOccupancyHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const [history, setHistory] = useState<ShelterOccupancyHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getShelterOccupancyHistory(id)
      .then((result) => {
        if (active) setHistory(result);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Could not load shelter history.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const entries = history
    ? [...history.entries].sort(
        (first, second) => Date.parse(second.changedAt) - Date.parse(first.changedAt),
      )
    : [];

  return (
    <main className={ui.page}>
      <div className="mx-auto w-full max-w-3xl space-y-5 sm:space-y-6">
        <Link href={`/shelters/${id}`} className={ui.secondaryLink}>
          ← Back to shelter details
        </Link>

        <header>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1877B9]">
            Shelter records
          </p>
          <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-[#16283D] sm:text-3xl">
            Occupancy history
          </h1>
          {history ? (
            <p className={`mt-2 ${ui.muted}`}>
              {history.shelter.name} · Capacity {history.shelter.capacity}
            </p>
          ) : null}
        </header>

        {loading ? (
          <p role="status" className={`${ui.card} p-8 text-center ${ui.muted}`}>
            Loading occupancy history...
          </p>
        ) : error ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </p>
        ) : entries.length === 0 ? (
          <section className={`${ui.card} p-5 sm:p-6`}>
            <h2 className="font-semibold text-[#16283D]">No occupancy history recorded</h2>
            <p className={`mt-2 text-sm ${ui.muted}`}>
              Changes saved before history tracking was added cannot be reconstructed. New shelter registrations and later occupancy or status changes will appear here.
            </p>
          </section>
        ) : (
          <ol aria-label="Shelter occupancy changes" className="space-y-3">
            {entries.map((entry, index) => {
              const status = shelterStatus({
                capacity: history!.shelter.capacity,
                occupancy: entry.occupancy,
                operationalStatus: entry.operationalStatus,
              });
              const changedAt = new Date(entry.changedAt);
              const dateLabel = Number.isNaN(changedAt.getTime())
                ? entry.changedAt
                : changedAt.toLocaleString("en-LK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  });

              return (
                <li key={entry.id || entry._id || `${entry.changedAt}-${index}`} className={`${ui.card} p-4 sm:p-5`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[#16283D]">
                        {entry.occupancy} of {history!.shelter.capacity} people
                      </p>
                      <p className={`mt-1 text-sm ${ui.muted}`}>{dateLabel}</p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-[#F5F7FA] px-3 py-1 text-xs font-bold text-[#16283D]">
                      {status}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}
