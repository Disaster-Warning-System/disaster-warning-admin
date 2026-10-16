"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import OpenStreetMapPicker from "@/src/components/shelters/OpenStreetMapPicker";
import ShelterImageField from "@/src/components/shelters/ShelterImageField";
import { getShelterFormValidationError } from "@/src/utils/shelterFormValidation";
import { nextShelterFormStage, type ShelterFormStage } from "@/src/utils/shelterFormWorkflow";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import type {
  CreateShelterInput,
  Shelter,
  ShelterLocationPoint,
  UpdateShelterInput,
} from "@/src/types/shelter";

type Props =
  | { mode: "create"; onSubmit: (value: CreateShelterInput, imageFile: File | null) => Promise<"saved" | "queued" | void> }
  | {
      mode: "update";
      shelter: Shelter;
      onSubmit: (value: UpdateShelterInput, imageFile: File | null, removeImage: boolean) => Promise<"saved" | "queued" | void>;
    };

export default function ShelterForm(props: Props) {
  const initial = props.mode === "update" ? props.shelter : undefined;
  const [name, setName] = useState(initial?.name || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [locationPoint, setLocationPoint] = useState<ShelterLocationPoint | null>(
    initial?.locationPoint ?? null,
  );
  const [capacity, setCapacity] = useState(String(initial?.capacity || ""));
  const [occupancy, setOccupancy] = useState(String(initial?.occupancy ?? 0));
  const [status, setStatus] = useState<"Open" | "Closed">(
    initial?.operationalStatus || "Open",
  );
  const [remarks, setRemarks] = useState(initial?.remarks || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [stage, setStage] = useState<ShelterFormStage>("editing");
  const [completion, setCompletion] = useState<"saved" | "queued">("saved");
  const parsedCapacity = Number(capacity);
  const parsedOccupancy = Number(occupancy);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validationError = getShelterFormValidationError({
      mode: props.mode,
      name,
      location,
      locationPoint,
      capacity: parsedCapacity,
      occupancy: parsedOccupancy,
      occupancyText: occupancy,
      maximumCapacity: props.mode === "update" ? props.shelter.capacity : parsedCapacity,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setStage((current) => nextShelterFormStage(current, "valid-submit"));
  }

  async function confirmSave() {
    setSaving(true);
    setError("");
    setStage((current) => nextShelterFormStage(current, "confirm-save"));
    try {
      let result: "saved" | "queued" | void;
      if (props.mode === "create") {
        result = await props.onSubmit({
          name: name.trim(),
          location: location.trim(),
          locationPoint: locationPoint!,
          capacity: parsedCapacity,
          occupancy: parsedOccupancy,
          operationalStatus: status,
          remarks: remarks.trim(),
        }, imageFile);
      } else {
        result = await props.onSubmit({
          location: location.trim(),
          locationPoint: locationPoint!,
          occupancy: parsedOccupancy,
          operationalStatus: status,
          remarks: remarks.trim(),
          imageId: removeImage ? null : undefined,
        }, imageFile, removeImage);
      }
      setCompletion(result === "queued" ? "queued" : "saved");
      setStage((current) => nextShelterFormStage(current, "save-success"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save shelter.");
      setStage((current) => nextShelterFormStage(current, "save-failure"));
    } finally {
      setSaving(false);
    }
  }

  const currentCapacity = props.mode === "update" ? props.shelter.capacity : parsedOrZero(capacity);
  const availableSpaces = Math.max(currentCapacity - parsedOrZero(occupancy), 0);

  if (stage === "complete") {
    return (
      <section role="status" className={`${ui.card} space-y-4 p-5 sm:p-6`}>
        <h2 className="text-xl font-bold text-[#16283D]">
          {completion === "queued" ? "Update saved on this device" : "Shelter update complete"}
        </h2>
        <p className={ui.muted}>
          {completion === "queued"
            ? "The reviewed occupancy and status update is stored locally and will sync when this device reconnects."
            : props.mode === "create"
              ? "The shelter has been registered and is available on the shelter dashboard."
              : "The shelter record has been updated successfully."}
        </p>
        <Link href="/shelters" className={ui.primaryButton}>Return to shelter dashboard</Link>
      </section>
    );
  }

  if (stage === "review" || stage === "saving") {
    return (
      <section aria-labelledby="shelter-review-title" className={`${ui.card} space-y-5 p-5 sm:p-6`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1877B9]">Review before saving</p>
          <h2 id="shelter-review-title" className="mt-2 text-xl font-bold text-[#16283D]">
            {props.mode === "create" ? "Confirm shelter registration" : "Confirm shelter update"}
          </h2>
        </div>
        <dl className="grid gap-3 rounded-xl bg-[#F5F7FA] p-4 text-sm sm:grid-cols-2">
          {props.mode === "create" ? <ReviewValue label="Shelter name" value={name} /> : <ReviewValue label="Shelter name" value={props.shelter.name} />}
          <ReviewValue label="Location" value={location} />
          <ReviewValue label="Capacity" value={String(currentCapacity)} />
          <ReviewValue label="Occupancy" value={String(parsedOccupancy)} />
          <ReviewValue label="Available spaces" value={String(availableSpaces)} />
          <ReviewValue label="Operational status" value={status} />
          <ReviewValue label="Map point" value={locationPoint ? `${locationPoint.coordinates[1].toFixed(5)}, ${locationPoint.coordinates[0].toFixed(5)}` : "Not selected"} />
          <ReviewValue label="Shelter image" value={imageFile ? imageFile.name : removeImage ? "Remove current image" : initial?.imageId ? "Keep current image" : "No image"} />
          <ReviewValue label="Remarks" value={remarks.trim() || "None"} />
        </dl>
        {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" disabled={saving} onClick={() => setStage((current) => nextShelterFormStage(current, "back-to-edit"))} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#DDE5EE] px-5 py-3 font-semibold text-[#1877B9] disabled:opacity-60">Back to edit</button>
          <button type="button" disabled={saving} onClick={() => void confirmSave()} className={ui.primaryButton}>
            {saving ? "Saving shelter update..." : "Confirm and save"}
          </button>
        </div>
        {saving ? <p role="status" className={`text-sm ${ui.muted}`}>Saving your reviewed shelter changes. Please wait.</p> : null}
      </section>
    );
  }

  return (
    <form onSubmit={submit} className={`${ui.card} space-y-5 p-4 sm:p-6`}>
      {props.mode === "create" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Shelter name" value={name} set={setName} />
          <Field label="Shelter location or address" value={location} set={setLocation} />
          <Field label="Capacity" value={capacity} set={setCapacity} numeric />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-[#F5F7FA] p-4">
            <strong className="break-words text-[#16283D]">{props.shelter.name}</strong>
            <p className={`mt-1 text-sm ${ui.muted}`}>
              Capacity {props.shelter.capacity}
            </p>
          </div>
          <Field label="Shelter location or address" value={location} set={setLocation} />
        </div>
      )}

      <OpenStreetMapPicker value={locationPoint} onChange={setLocationPoint} />

      <ShelterImageField
        imageId={initial?.imageId}
        selectedFile={imageFile}
        onFileChange={setImageFile}
        removeImage={removeImage}
        onRemoveChange={setRemoveImage}
      />

      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
        <div>
          <Field label="Current occupancy" value={occupancy} set={setOccupancy} numeric />
          <p className="mt-2 text-sm text-[#6B7C8F]">
            Available spaces: <span className="font-semibold text-[#16283D]">{availableSpaces}</span>
          </p>
        </div>

        <label className={ui.label}>
          Operational status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "Open" | "Closed")}
            className={ui.input}
          >
            <option>Open</option>
            <option>Closed</option>
          </select>
        </label>
      </div>

      <label className={ui.label}>
        Remarks <span className={`font-normal ${ui.muted}`}>(optional)</span>
        <textarea
          value={remarks}
          maxLength={500}
          rows={3}
          onChange={(event) => setRemarks(event.target.value)}
          className={ui.input}
        />
      </label>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={saving} className={ui.primaryButton}>
        {props.mode === "create" ? "Review registration" : "Review update"}
      </button>
    </form>
  );
}

function ReviewValue({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[#6B7C8F]">{label}</dt><dd className="mt-1 break-words font-semibold text-[#16283D]">{value}</dd></div>;
}

function Field({
  label,
  value,
  set,
  numeric = false,
}: {
  label: string;
  value: string;
  set: (value: string) => void;
  numeric?: boolean;
}) {
  return (
    <label className={ui.label}>
      {label}
      <input
        type="text"
        inputMode={numeric ? "numeric" : undefined}
        value={value}
        onChange={(event) => set(event.target.value)}
        className={ui.input}
      />
    </label>
  );
}

function parsedOrZero(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

