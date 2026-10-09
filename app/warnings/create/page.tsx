import { Suspense } from "react";
import CreateAlert from "../../../src/components/createAllerrt/CreateAlert";

export default function CreateWarningPage() {
  return (
    <Suspense fallback={<main className="p-8 text-zinc-600">Loading warning form...</main>}>
      <CreateAlert />
    </Suspense>
  );
}