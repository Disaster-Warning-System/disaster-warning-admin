"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ShelterForm from "@/src/components/shelters/ShelterForm";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import { createShelter } from "@/src/services/api/shelterApi";
import type { CreateShelterInput } from "@/src/types/shelter";

export default function CreateShelterPage() {
  const router = useRouter();

  async function submit(values: CreateShelterInput) {
    await createShelter(values);
    router.push("/shelters");
  }

  return (
    <main className={ui.page}>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Link href="/shelters" className={ui.secondaryLink}>
          ← Back to shelters
        </Link>
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#176fa8]">
            District response
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#183447]">
            Register a shelter
          </h1>
          <p className={`mt-2 ${ui.muted}`}>
            Add a shelter and its current availability.
          </p>
        </header>
        <ShelterForm mode="create" onSubmit={submit} />
      </div>
    </main>
  );
}
