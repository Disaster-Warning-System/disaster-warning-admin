import { shelterStatus } from "@/src/utils/shelterStatus";
import type { Shelter } from "@/src/types/shelter";

export default function ShelterStatusBadge({
  shelter,
}: {
  shelter: Pick<Shelter, "capacity" | "occupancy" | "operationalStatus">;
}) {
  const status = shelterStatus(shelter);
  const tone =
    status === "Open"
      ? "bg-[#E5F4ED] text-[#087A4B]"
      : status === "Full"
        ? "bg-[#fff3d6] text-[#755400]"
        : "bg-[#EEF3F8] text-[#16283D]";

  return (
    <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-bold ${tone}`}>
      {status}
    </span>
  );
}
