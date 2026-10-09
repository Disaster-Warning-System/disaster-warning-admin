import type { ShelterLocationPoint } from "@/src/types/shelter";

const EARTH_RADIUS_KM = 6371.0088;

/** Returns great-circle distance in kilometers between two GeoJSON points. */
export function distanceBetweenPointsKm(
  origin: ShelterLocationPoint,
  destination: ShelterLocationPoint,
): number {
  const [originLongitude, originLatitude] = origin.coordinates;
  const [destinationLongitude, destinationLatitude] = destination.coordinates;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(destinationLatitude - originLatitude);
  const longitudeDelta = toRadians(destinationLongitude - originLongitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(originLatitude)) *
      Math.cos(toRadians(destinationLatitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}
