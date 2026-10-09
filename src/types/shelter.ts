export type ShelterOperationalStatus = "Open" | "Closed";

export type ShelterLocationPoint = {
  type: "Point";
  /** GeoJSON order: longitude, then latitude. */
  coordinates: [longitude: number, latitude: number];
};

export type Shelter = {
  id: string;
  name: string;
  location: string;
  locationPoint?: ShelterLocationPoint | null;
  capacity: number;
  occupancy: number;
  operationalStatus: ShelterOperationalStatus;
  remarks: string;
  imageId?: string | null;
  availableSpaces: number;
  availabilityStatus: ShelterOperationalStatus | "Full";
  createdAt: string;
  updatedAt: string;
};

export type CreateShelterInput = {
  name: string;
  location: string;
  locationPoint: ShelterLocationPoint;
  capacity: number;
  occupancy: number;
  operationalStatus: ShelterOperationalStatus;
  remarks: string;
  imageId?: string | null;
};

export type UpdateShelterInput = Pick<
  CreateShelterInput,
  "location" | "locationPoint" | "occupancy" | "operationalStatus" | "remarks"
> & { imageId?: string | null };

export type ShelterOccupancyHistoryEntry = {
  id?: string;
  _id?: string;
  occupancy: number;
  operationalStatus: ShelterOperationalStatus;
  changedAt: string;
};

export type ShelterOccupancyHistory = {
  shelter: Pick<Shelter, "id" | "name" | "capacity">;
  entries: ShelterOccupancyHistoryEntry[];
};
