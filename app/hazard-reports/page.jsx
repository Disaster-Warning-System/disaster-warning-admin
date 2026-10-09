"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import Pagination from "@/src/components/verification/Pagination";
import ReportFilters from "@/src/components/verification/ReportFilters";
import ReportQueueTable from "@/src/components/verification/ReportQueueTable";
import { listReports } from "@/src/services/api/verificationApi";
import { buildQueueQuery, readQueueFilters } from "@/src/utils/verification";

const PAGE_SIZE = 20;

function ReportQueue() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = readQueueFilters(searchParams);
  const queryKey = searchParams.toString();

  // `key` is the query the shown result belongs to, so loading is derived instead of stored
  const [state, setState] = useState({ key: null, result: null, error: "" });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let active = true;
    const current = readQueueFilters(new URLSearchParams(queryKey));
    listReports({ ...current, limit: PAGE_SIZE })
      .then((result) => {
        if (active) setState({ key: queryKey, result, error: "" });
      })
      .catch((reason) => {
        if (active) {
          setState((previous) => ({
            ...previous,
            key: queryKey,
            error: reason?.message || "Unable to load reports.",
          }));
        }
      });
    return () => {
      active = false;
    };
  }, [queryKey, reloadCount]);

  const { result, error } = state;
  const loading = state.key !== queryKey;

  function retry() {
    setState((previous) => ({ ...previous, key: null, error: "" }));
    setReloadCount((count) => count + 1);
  }

  // Filters live in the URL so the back button and shared links keep the same view
  function updateFilters(changes) {
    const next = { ...filters, ...changes };
    if (!("page" in changes)) next.page = 1;
    const query = buildQueueQuery(next);
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="space-y-4">
      <ReportFilters
        key={`${filters.district}|${filters.search}`}
        filters={filters}
        onChange={updateFilters}
      />
      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}{" "}
          <button type="button" onClick={retry} className="font-semibold underline">
            Try again
          </button>
        </p>
      ) : result ? (
        <div className={`space-y-4 transition-opacity ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
          <ReportQueueTable reports={result.data} />
          <Pagination
            page={result.page}
            pages={result.pages}
            total={result.total}
            onPageChange={(page) => updateFilters({ page })}
          />
        </div>
      ) : (
        <p role="status" className={`text-sm ${ui.muted}`}>
          Loading reports...
        </p>
      )}
    </div>
  );
}

export default function HazardReportsPage() {
  return (
    <main className={ui.page}>
      <div className={ui.container}>
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1877B9]">Verification</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#16283D]">Hazard report queue</h1>
          <p className={`mt-1 text-sm ${ui.muted}`}>
            Pending reports waiting more than 30 minutes are marked overdue.
          </p>
        </header>
        <Suspense fallback={<p className={`text-sm ${ui.muted}`}>Loading reports...</p>}>
          <ReportQueue />
        </Suspense>
      </div>
    </main>
  );
}
