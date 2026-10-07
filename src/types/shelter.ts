export type ShelterOperationalStatus = "Open" | "Closed";
export type Shelter = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  occupancy: number;
  operationalStatus: ShelterOperationalStatus;
  remarks: string;
  availableSpaces: number;
  availabilityStatus: ShelterOperationalStatus | "Full";
  createdAt: string;
  updatedAt: string;
};
export type CreateShelterInput = {
  name: string;
  location: string;
  capacity: number;
  occupancy: number;
  operationalStatus: ShelterOperationalStatus;
  remarks: string;
};
export type UpdateShelterInput = Pick<
  CreateShelterInput,
  "occupancy" | "operationalStatus" | "remarks"
>;
