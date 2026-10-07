"use client";

import Link from "next/link";
import ShelterTable from "@/src/components/shelters/ShelterTable";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import { useShelters } from "@/src/hooks/useShelters";

export default function SheltersPage() {
  const { shelters, loading, error, refresh } = useShelters();

  return (
    <main className={ui.page}>
      <div className={ui.container}>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#176fa8]">
              District response
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#183447]">
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

        <section className="grid gap-4 sm:grid-cols-3">
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

        <div className="flex justify-end">
          <button
            onClick={() => void refresh()}
            className={ui.secondaryLink}
            type="button"
          >
            Refresh shelters
          </button>
        </div>

        {loading ? (
          <p role="status" className={`${ui.card} p-8 text-center ${ui.muted}`}>
            Loading shelters...
          </p>
        ) : error ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </p>
        ) : (
          <ShelterTable shelters={shelters} />
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className={`${ui.card} p-5`}>
      <p className={`text-sm ${ui.muted}`}>{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#183447]">{value}</p>
    </div>
  );
}
