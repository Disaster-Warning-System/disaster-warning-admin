"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ShelterForm from "@/src/components/shelters/ShelterForm";
import { createShelter } from "@/src/services/api/shelterApi";
import type { CreateShelterInput } from "@/src/types/shelter";
export default function CreateShelterPage() {
  const router = useRouter();
  async function submit(v: CreateShelterInput) {
    await createShelter(v);
    router.push("/shelters");
  }
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <Link href="/shelters" className="font-semibold text-blue-700">
        ← Back to shelters
      </Link>
      <header>
        <h1 className="text-3xl font-bold">Register a shelter</h1>
        <p className="mt-2 text-slate-600">
          Add a shelter and its current availability.
        </p>
      </header>
      <ShelterForm mode="create" onSubmit={submit} />
    </main>
  );
}
