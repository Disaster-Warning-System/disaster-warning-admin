import Link from "next/link";
import type { Shelter } from "@/src/types/shelter";
import ShelterStatusBadge from "./ShelterStatusBadge";
export default function ShelterTable({ shelters }: { shelters: Shelter[] }) {
  if (!shelters.length)
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-slate-600">
        No shelters registered yet.
      </div>
    );
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {[
              "Shelter",
              "Location",
              "Capacity",
              "Occupancy",
              "Available",
              "Status",
              "",
            ].map((x) => (
              <th key={x || "action"} className="p-4">
                {x || "Action"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {shelters.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="p-4 font-semibold">{s.name}</td>
              <td className="p-4">{s.location}</td>
              <td className="p-4">{s.capacity}</td>
              <td className="p-4">{s.occupancy}</td>
              <td className="p-4">{s.availableSpaces}</td>
              <td className="p-4">
                <ShelterStatusBadge shelter={s} />
              </td>
              <td className="p-4">
                <Link
                  className="font-semibold text-blue-700"
                  href={"/shelters/" + s.id}
                >
                  Manage
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
