"use client";

import { useState, type FormEvent } from "react";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import type {
  CreateShelterInput,
  Shelter,
  UpdateShelterInput,
} from "@/src/types/shelter";

type Props =
  | { mode: "create"; onSubmit: (value: CreateShelterInput) => Promise<void> }
  | {
      mode: "update";
      shelter: Shelter;
      onSubmit: (value: UpdateShelterInput) => Promise<void>;
    };

export default function ShelterForm(props: Props) {
  const initial = props.mode === "update" ? props.shelter : undefined;
  const [name, setName] = useState(initial?.name || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [capacity, setCapacity] = useState(String(initial?.capacity || ""));
  const [occupancy, setOccupancy] = useState(String(initial?.occupancy ?? 0));
  const [status, setStatus] = useState<"Open" | "Closed">(
    initial?.operationalStatus || "Open",
  );
  const [remarks, setRemarks] = useState(initial?.remarks || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsedCapacity = Number(capacity);
    const parsedOccupancy = Number(occupancy);

    if (props.mode === "create" && !name.trim()) {
      setError("Shelter name is required. Enter a name.");
      return;
    }
    if (props.mode === "create" && !location.trim()) {
      setError("Shelter location is required. Enter a location.");
      return;
    }
    if (props.mode === "create" && !capacity.trim()) {
      setError("Capacity is required. Enter a whole number greater than 0.");
      return;
    }
    if (
      props.mode === "create" &&
      (!Number.isInteger(parsedCapacity) || parsedCapacity < 1)
    ) {
      setError("Capacity must be a whole number greater than 0. Enter a valid capacity.");
      return;
    }
    if (!occupancy.trim()) {
      setError("Current occupancy is required. Enter a whole number from 0 up to capacity.");
      return;
    }
    if (!Number.isInteger(parsedOccupancy) || parsedOccupancy < 0) {
      setError("Current occupancy must be a whole number from 0 up to capacity.");
      return;
    }
    if (
      parsedOccupancy >
      (props.mode === "update" ? props.shelter.capacity : parsedCapacity)
    ) {
      setError("Current occupancy cannot exceed capacity. Enter a lower occupancy.");
      return;
    }

    setSaving(true);
    try {
      if (props.mode === "create") {
        await props.onSubmit({
          name: name.trim(),
          location: location.trim(),
          capacity: parsedCapacity,
          occupancy: parsedOccupancy,
          operationalStatus: status,
          remarks: remarks.trim(),
        });
      } else {
        await props.onSubmit({
          occupancy: parsedOccupancy,
          operationalStatus: status,
          remarks: remarks.trim(),
        });
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save shelter.");
    } finally {
      setSaving(false);
    }
  }

  const currentCapacity = props.mode === "update" ? props.shelter.capacity : parsedOrZero(capacity);
  const availableSpaces = Math.max(currentCapacity - parsedOrZero(occupancy), 0);

  return (
    <form onSubmit={submit} className={`${ui.card} space-y-5 p-5 sm:p-6`}>
      {props.mode === "create" ? (
        <>
          <Field label="Shelter name" value={name} set={setName} />
          <Field label="Location" value={location} set={setLocation} />
          <Field label="Capacity" value={capacity} set={setCapacity} numeric />
        </>
      ) : (
        <div className="rounded-xl bg-[#f4f7f9] p-4">
          <strong className="text-[#183447]">{props.shelter.name}</strong>
          <p className={`mt-1 text-sm ${ui.muted}`}>
            {props.shelter.location} · Capacity {props.shelter.capacity}
          </p>
        </div>
      )}

      <Field label="Current occupancy" value={occupancy} set={setOccupancy} numeric />
      <p className="-mt-3 text-sm text-[#71818b]">
        Available spaces: <span className="font-semibold text-[#183447]">{availableSpaces}</span>
      </p>

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
        {saving ? "Saving..." : props.mode === "create" ? "Register shelter" : "Save update"}
      </button>
    </form>
  );
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
