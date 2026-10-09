"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import Pagination from "@/src/components/verification/Pagination";
import ReportFilters from "@/src/components/verification/ReportFilters";
import ReportQueueTable from "@/src/components/verification/ReportQueueTable";
import { listReports } from "@/src/services/api/verificationApi";
import { REPORT_STATUS } from "@/src/utils/verification";

const PAGE_SIZE = 20;

function readFilters(searchParams) {
  return {
    status: searchParams.get("status") || REPORT_STATUS.PENDING,
    hazardType: searchParams.get("hazardType") || "",
    district: searchParams.get("district") || "",
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "newest",
    page: Math.max(Number.parseInt(searchParams.get("page") || "1", 10) || 1, 1),
  };
}

function ReportQueue() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = readFilters(searchParams);
  const queryKey = searchParams.toString();

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const current = readFilters(new URLSearchParams(queryKey));
    setLoading(true);
    setError("");
    listReports({ ...current, limit: PAGE_SIZE })
      .then(setResult)
      .catch((reason) => setError(reason?.message || "Unable to load reports."))
      .finally(() => setLoading(false));
  }, [queryKey]);

  useEffect(() => {
    load();
  }, [load]);

  // Filters live in the URL so the back button and shared links keep the same view
  function updateFilters(changes) {
    const next = { ...filters, ...changes };
    if (!("page" in changes)) next.page = 1;
    const params = new URLSearchParams();
    if (next.status !== REPORT_STATUS.PENDING) params.set("status", next.status);
    if (next.hazardType) params.set("hazardType", next.hazardType);
    if (next.district) params.set("district", next.district);
    if (next.search) params.set("search", next.search);
    if (next.sort !== "newest") params.set("sort", next.sort);
    if (next.page > 1) params.set("page", String(next.page));
    const query = params.toString();
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
          <button type="button" onClick={load} className="font-semibold underline">
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
