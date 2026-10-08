"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ShelterForm from "@/src/components/shelters/ShelterForm";
import ShelterStatusBadge from "@/src/components/shelters/ShelterStatusBadge";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import {
  deleteShelter,
  getShelter,
  updateShelter,
} from "@/src/services/api/shelterApi";
import type { Shelter, UpdateShelterInput } from "@/src/types/shelter";

export default function ShelterDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    getShelter(id)
      .then((value) => {
        if (active) setShelter(value);
      })
      .catch((reason) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Could not load shelter.");
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function submit(values: UpdateShelterInput) {
    await updateShelter(id, values);
    router.push("/shelters");
  }

  async function remove() {
    if (
      !shelter ||
      !window.confirm(`Delete ${shelter.name}? This permanently removes the shelter record.`)
    ) {
      return;
    }

    setDeleting(true);
    setDeleteError("");
    try {
      await deleteShelter(id);
      router.replace("/shelters");
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "Could not delete shelter.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (error) {
    return (
      <main className={ui.page}>
        <div className="mx-auto max-w-3xl">
          <Link href="/shelters" className={ui.secondaryLink}>← Back to shelters</Link>
          <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!shelter) {
    return (
      <main className={ui.page}>
        <div role="status" className={`${ui.card} mx-auto max-w-3xl p-8 text-center ${ui.muted}`}>
          Loading shelter...
        </div>
      </main>
    );
  }

  return (
    <main className={ui.page}>
      <div className="mx-auto w-full max-w-3xl space-y-5 sm:space-y-6">
        <Link href="/shelters" className={ui.secondaryLink}>
          ← Back to shelters
        </Link>
        <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1877B9]">
              Shelter details
            </p>
            <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-[#16283D] sm:text-3xl">
              {shelter.name}
            </h1>
            <p className={`mt-2 ${ui.muted}`}>{shelter.location}</p>
          </div>
          <ShelterStatusBadge shelter={shelter} />
        </header>

        <section className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
          <Metric label="Capacity" value={shelter.capacity} />
          <Metric label="Occupancy" value={shelter.occupancy} />
          <Metric label="Available spaces" value={shelter.availableSpaces} />
        </section>

        <ShelterForm mode="update" shelter={shelter} onSubmit={submit} />

        <section className="space-y-3 rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:p-5">
          <div>
            <h2 className="font-semibold text-[#16283D]">Delete shelter</h2>
            <p className={`mt-1 text-sm ${ui.muted}`}>
              Permanently remove this shelter and its record.
            </p>
          </div>
          {deleteError ? (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {deleteError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void remove()}
            disabled={deleting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {deleting ? "Deleting..." : "Delete shelter"}
          </button>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className={`${ui.card} p-4`}>
      <p className={`text-xs ${ui.muted}`}>{label}</p>
      <p className="mt-1 text-xl font-bold text-[#16283D]">{value}</p>
    </div>
  );
}
