import type { ShelterLocationPoint } from "../types/shelter";

export type ShelterFormValidationInput = {
  mode: "create" | "update";
  name: string;
  location: string;
  locationPoint: ShelterLocationPoint | null;
  capacity: number;
  occupancy: number;
  occupancyText: string;
  maximumCapacity: number;
};

/** Return the first actionable form error, or null when the shelter form can be reviewed. */
export function getShelterFormValidationError(
  values: ShelterFormValidationInput,
): string | null {
  if (values.mode === "create" && !values.name.trim()) {
    return "Shelter name is required. Enter a name.";
  }
  if (!values.location.trim()) {
    return "Shelter location is required. Enter a location or address.";
  }
  if (
    values.mode === "create" &&
    (!Number.isInteger(values.capacity) || values.capacity < 1)
  ) {
    return "Capacity must be a whole number greater than 0. Enter a valid capacity.";
  }
  if (!values.locationPoint) {
    return "Map location is required. Select or enter a valid map point.";
  }
  if (!values.occupancyText.trim()) {
    return "Current occupancy is required. Enter a whole number from 0 up to capacity.";
  }
  if (!Number.isInteger(values.occupancy) || values.occupancy < 0) {
    return "Current occupancy must be a whole number from 0 up to capacity.";
  }
  if (values.occupancy > values.maximumCapacity) {
    return "Current occupancy cannot exceed capacity. Enter a lower occupancy.";
  }
  return null;
}
