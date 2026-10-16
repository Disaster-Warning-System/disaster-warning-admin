import type { Shelter } from "../types/shelter";

/** Derives the displayed availability label from the current capacity and occupancy. */
export function shelterStatus(
  shelter: Pick<Shelter, "capacity" | "occupancy" | "operationalStatus">,
) {
  return shelter.occupancy >= shelter.capacity
    ? "Full"
    : shelter.operationalStatus;
}
