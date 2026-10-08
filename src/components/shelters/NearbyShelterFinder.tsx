"use client";

import { useMemo, useState } from "react";
import OpenStreetMapPicker from "@/src/components/shelters/OpenStreetMapPicker";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import type { Shelter, ShelterLocationPoint } from "@/src/types/shelter";
import { distanceBetweenPointsKm } from "@/src/utils/geo";

export default function NearbyShelterFinder({ shelters }: { shelters: Shelter[] }) {
  const [incidentPoint, setIncidentPoint] = useState<ShelterLocationPoint | null>(null);
  const nearestShelters = useMemo(() => {
    if (!incidentPoint) return [];
    return shelters
      .filter((shelter) => shelter.locationPoint)
      .map((shelter) => ({
        shelter,
        distanceKm: distanceBetweenPointsKm(incidentPoint, shelter.locationPoint!),
      }))
      .sort((first, second) => first.distanceKm - second.distanceKm)
      .slice(0, 5);
  }, [incidentPoint, shelters]);

  return (
    <section className={`${ui.card} space-y-4 p-4 sm:p-5`}>
      <p className={`text-sm ${ui.muted}`}>
        Select an incident point on the map. Results show the five closest registered shelters with straight-line distance and current capacity.
      </p>
      <OpenStreetMapPicker
        value={incidentPoint}
        onChange={setIncidentPoint}
        title="Incident location"
        description="Click the incident location or drag the pin. The selected point is used only to find nearby shelters."
      />
      {!incidentPoint ? (
        <p role="status" className={`text-sm ${ui.muted}`}>
          Choose an incident point to see nearby shelters.
        </p>
      ) : nearestShelters.length === 0 ? (
        <p role="status" className={`text-sm ${ui.muted}`}>
          No shelters have map coordinates yet.
        </p>
      ) : (
        <ol className="space-y-2" aria-label="Nearest shelters">
          {nearestShelters.map(({ shelter, distanceKm }) => (
            <li
              key={shelter.id}
              className="flex flex-col justify-between gap-2 rounded-xl bg-[#F5F7FA] p-3 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <p className="break-words font-semibold text-[#16283D]">{shelter.name}</p>
                <p className={`text-sm ${ui.muted}`}>{shelter.location}</p>
              </div>
              <p className="shrink-0 text-sm text-[#16283D]">
                {distanceKm.toFixed(1)} km · {shelter.availabilityStatus} · {shelter.availableSpaces}/{shelter.capacity} spaces free
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
