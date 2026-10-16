"use client";

import Link from "next/link";
import NearbyShelterFinder from "@/src/components/shelters/NearbyShelterFinder";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import { useShelters } from "@/src/hooks/useShelters";

export default function NearbySheltersPage() {
  const { shelters, loading, error } = useShelters();

  return (
    <main className={ui.page}>
      <div className={`${ui.container} max-w-5xl`}>
        <Link href="/shelters" className={ui.secondaryLink}>
          ← Back to shelter dashboard
        </Link>
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1877B9]">
            District response
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#16283D] sm:text-3xl">
            Find nearby shelters for an incident
          </h1>
          <p className={`mt-2 text-sm sm:text-base ${ui.muted}`}>
            Choose an incident location to rank registered shelters by distance and review their current capacity.
          </p>
        </header>

        {loading ? (
          <p role="status" className={`${ui.card} p-8 text-center ${ui.muted}`}>
            Loading shelters...
          </p>
        ) : error ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </p>
        ) : (
          <NearbyShelterFinder shelters={shelters} />
        )}
      </div>
    </main>
  );
}
