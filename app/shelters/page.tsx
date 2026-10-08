"use client";

import Link from "next/link";
import { useState } from "react";
import ShelterTable from "@/src/components/shelters/ShelterTable";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import { useShelters } from "@/src/hooks/useShelters";

export default function SheltersPage() {
  const { shelters, loading, error, refresh } = useShelters();
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredShelters = normalizedSearchTerm
    ? shelters.filter((shelter) =>
        [
          shelter.name,
          shelter.location,
          shelter.operationalStatus,
          shelter.availabilityStatus,
          shelter.remarks,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearchTerm),
      )
    : shelters;

  return (
    <main className={ui.page}>
      <div className={ui.container}>
        <header className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1877B9]">
              District response
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#16283D] sm:text-3xl">
              Shelter dashboard
            </h1>
            <p className={`mt-2 text-sm sm:text-base ${ui.muted}`}>
              Review capacity and coordinate shelter availability.
            </p>
          </div>
          <Link href="/shelters/create" className={ui.primaryButton}>
            Register new shelter
          </Link>
        </header>

        <section className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <Metric label="Registered shelters" value={shelters.length} />
          <Metric
            label="Available spaces"
            value={shelters.reduce((total, shelter) => total + shelter.availableSpaces, 0)}
          />
          <Metric
            label="At capacity"
            value={shelters.filter((shelter) => shelter.occupancy >= shelter.capacity).length}
          />
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">Search shelters</span>
            <input
              type="text"
              inputMode="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, location, or status"
              className="min-h-11 w-full rounded-xl border border-[#DDE5EE] bg-white px-4 py-2.5 pr-12 text-base text-[#16283D] outline-none placeholder:text-[#6B7C8F] focus:border-[#1877B9] focus:ring-2 focus:ring-[#1877B9]/20 sm:text-sm"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear shelter search"
                className="absolute inset-y-0 right-2 my-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-xl text-[#6B7C8F] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9]"
              >
                <span aria-hidden="true">×</span>
              </button>
            ) : null}
          </label>
          <button
            onClick={() => void refresh()}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-[#DDE5EE] bg-white px-4 py-2.5 text-sm font-semibold text-[#1877B9] transition hover:bg-[#E8F2FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9]"
            type="button"
          >
            Refresh shelters
          </button>
        </div>

        {!loading && !error ? (
          <p aria-live="polite" className={`text-sm ${ui.muted}`}>
            {normalizedSearchTerm
              ? `Showing ${filteredShelters.length} of ${shelters.length} shelters`
              : `${shelters.length} shelters`}
          </p>
        ) : null}

        {loading ? (
          <p role="status" className={`${ui.card} p-8 text-center ${ui.muted}`}>
            Loading shelters...
          </p>
        ) : error ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </p>
        ) : filteredShelters.length === 0 && normalizedSearchTerm ? (
          <div className={`${ui.card} p-6 text-center sm:p-8`}>
            <p className="font-semibold text-[#16283D]">No shelters match “{searchTerm.trim()}”.</p>
            <p className={`mt-1 text-sm ${ui.muted}`}>
              Try a different name, location, or status.
            </p>
          </div>
        ) : (
          <ShelterTable shelters={filteredShelters} />
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className={`${ui.card} p-5`}>
      <p className={`text-sm ${ui.muted}`}>{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#16283D] sm:text-3xl">{value}</p>
    </div>
  );
}
