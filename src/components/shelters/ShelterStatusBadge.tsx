import type { Shelter } from "@/src/types/shelter";

export function shelterStatus(
  shelter: Pick<Shelter, "capacity" | "occupancy" | "operationalStatus">,
) {
  return shelter.occupancy >= shelter.capacity
    ? "Full"
    : shelter.operationalStatus;
}

export default function ShelterStatusBadge({
  shelter,
}: {
  shelter: Pick<Shelter, "capacity" | "occupancy" | "operationalStatus">;
}) {
  const status = shelterStatus(shelter);
  const tone =
    status === "Open"
      ? "bg-[#e5f7ef] text-[#216448]"
      : status === "Full"
        ? "bg-[#fff3d6] text-[#755400]"
        : "bg-[#e9eef2] text-[#263746]";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tone}`}>
      {status}
    </span>
  );
}
