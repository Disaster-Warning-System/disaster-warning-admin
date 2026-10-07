import type { Shelter } from "@/src/types/shelter";
export function shelterStatus(
  s: Pick<Shelter, "capacity" | "occupancy" | "operationalStatus">,
) {
  return s.occupancy >= s.capacity ? "Full" : s.operationalStatus;
}
export default function ShelterStatusBadge({
  shelter,
}: {
  shelter: Pick<Shelter, "capacity" | "occupancy" | "operationalStatus">;
}) {
  const status = shelterStatus(shelter);
  const color =
    status === "Open"
      ? "bg-emerald-100 text-emerald-800"
      : status === "Full"
        ? "bg-amber-100 text-amber-800"
        : "bg-slate-200 text-slate-700";
  return (
    <span
      className={
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold " + color
      }
    >
      {status}
    </span>
  );
}
