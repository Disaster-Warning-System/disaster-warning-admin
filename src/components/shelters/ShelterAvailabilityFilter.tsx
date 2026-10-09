"use client";

import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";

export type ShelterAvailabilityFilterValue = "all" | "available" | "full" | "open" | "closed";

type Props = {
  value: ShelterAvailabilityFilterValue;
  onChange: (value: ShelterAvailabilityFilterValue) => void;
};

export default function ShelterAvailabilityFilter({ value, onChange }: Props) {
  return (
    <label className={`${ui.label} min-w-0 sm:w-56`}>
      Filter availability
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ShelterAvailabilityFilterValue)}
        className={ui.input}
      >
        <option value="all">All shelters</option>
        <option value="available">Has available spaces</option>
        <option value="full">At capacity</option>
        <option value="open">Operational: Open</option>
        <option value="closed">Operational: Closed</option>
      </select>
    </label>
  );
}
