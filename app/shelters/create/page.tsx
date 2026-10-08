"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ShelterForm from "@/src/components/shelters/ShelterForm";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import { createShelter, deleteShelterImage, uploadShelterImage } from "@/src/services/api/shelterApi";
import type { CreateShelterInput } from "@/src/types/shelter";

export default function CreateShelterPage() {
  const router = useRouter();

  async function submit(values: CreateShelterInput, imageFile: File | null) {
    let imageId: string | undefined;
    try {
      if (imageFile) imageId = await uploadShelterImage(imageFile);
      await createShelter({ ...values, ...(imageId ? { imageId } : {}) });
    } catch (error) {
      if (imageId) await deleteShelterImage(imageId).catch(() => undefined);
      throw error;
    }
    router.push("/shelters");
  }

  return (
    <main className={ui.page}>
      <div className="mx-auto w-full max-w-3xl space-y-5 sm:space-y-6">
        <Link href="/shelters" className={ui.secondaryLink}>
          ← Back to shelters
        </Link>
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1877B9]">
            District response
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#16283D] sm:text-3xl">
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
