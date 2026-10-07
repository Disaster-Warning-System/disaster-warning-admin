import Link from "next/link";
import type { Shelter } from "@/src/types/shelter";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import ShelterStatusBadge from "./ShelterStatusBadge";

export default function ShelterTable({ shelters }: { shelters: Shelter[] }) {
  if (!shelters.length) {
    return (
      <div className={`${ui.card} p-8 text-center`}>
        <p className="font-semibold text-[#183447]">No shelters registered yet.</p>
        <p className={`mt-1 text-sm ${ui.muted}`}>
          Register a shelter to begin coordinating availability.
        </p>
      </div>
    );
  }

  return (
    <div className={`${ui.card} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f4f7f9] text-xs uppercase tracking-wide text-[#71818b]">
            <tr>
              {["Shelter", "Location", "Capacity", "Occupancy", "Available", "Status", ""].map((heading, index) => (
                <th key={heading || `action-${index}`} className="whitespace-nowrap px-4 py-3 font-semibold">
                  {heading || "Action"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8eef1]">
            {shelters.map((shelter) => (
              <tr key={shelter.id} className="transition hover:bg-[#f8fafb]">
                <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#183447]">{shelter.name}</td>
                <td className="px-4 py-4 text-[#71818b]">{shelter.location}</td>
                <td className="px-4 py-4 text-[#344b5a]">{shelter.capacity}</td>
                <td className="px-4 py-4 text-[#344b5a]">{shelter.occupancy}</td>
                <td className="px-4 py-4 font-semibold text-[#183447]">{shelter.availableSpaces}</td>
                <td className="px-4 py-4"><ShelterStatusBadge shelter={shelter} /></td>
                <td className="px-4 py-4">
                  <Link className={ui.secondaryLink} href={`/shelters/${shelter.id}`}>
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
