import Link from "next/link";
import Image from "next/image";
import { getShelterImageUrl } from "@/src/services/api/shelterApi";
import type { Shelter } from "@/src/types/shelter";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import ShelterStatusBadge from "./ShelterStatusBadge";

export default function ShelterTable({ shelters }: { shelters: Shelter[] }) {
  if (!shelters.length) {
    return (
      <div className={`${ui.card} p-6 text-center sm:p-8`}>
        <p className="font-semibold text-[#16283D]">No shelters registered yet.</p>
        <p className={`mt-1 text-sm ${ui.muted}`}>
          Register a shelter to begin coordinating availability.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Cards keep shelter details and actions readable without horizontal scrolling on phones. */}
      <div className="space-y-3 md:hidden">
        {shelters.map((shelter) => (
          <article key={shelter.id} className={`${ui.card} space-y-4 p-4`}>
            {shelter.imageId ? (
              <div className="relative h-40 overflow-hidden rounded-xl bg-[#F5F7FA]">
                <Image src={getShelterImageUrl(shelter.imageId)} alt={`${shelter.name} shelter`} fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
              </div>
            ) : null}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words font-semibold text-[#16283D]">{shelter.name}</h2>
                <p className={`mt-1 break-words text-sm ${ui.muted}`}>{shelter.location}</p>
              </div>
              <ShelterStatusBadge shelter={shelter} />
            </div>
            <dl className="grid grid-cols-3 gap-2 rounded-xl bg-[#F5F7FA] p-3">
              <Metric label="Capacity" value={shelter.capacity} />
              <Metric label="Occupancy" value={shelter.occupancy} />
              <Metric label="Available" value={shelter.availableSpaces} />
            </dl>
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#DDE5EE] px-4 py-2.5 font-semibold text-[#1877B9] transition hover:bg-[#E8F2FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9]"
              href={`/shelters/${shelter.id}`}
            >
              Manage shelter
            </Link>
          </article>
        ))}
      </div>

      {/* The detailed table is retained for tablet and desktop layouts. */}
      <div className={`${ui.card} hidden overflow-hidden md:block`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#F5F7FA] text-xs uppercase tracking-wide text-[#6B7C8F]">
              <tr>
                {["Shelter", "Location", "Capacity", "Occupancy", "Available", "Status", "Action"].map((heading) => (
                  <th key={heading} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5EE]">
              {shelters.map((shelter) => (
                <tr key={shelter.id} className="transition hover:bg-[#F5F7FA]">
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#16283D]">{shelter.name}</td>
                  <td className="px-4 py-4 text-[#6B7C8F]">{shelter.location}</td>
                  <td className="px-4 py-4 text-[#16283D]">{shelter.capacity}</td>
                  <td className="px-4 py-4 text-[#16283D]">{shelter.occupancy}</td>
                  <td className="px-4 py-4 font-semibold text-[#16283D]">{shelter.availableSpaces}</td>
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
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] leading-tight text-[#6B7C8F]">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold text-[#16283D]">{value}</dd>
    </div>
  );
}
