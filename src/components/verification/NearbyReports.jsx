import Link from "next/link";
import { verificationStyles as ui } from "@/src/components/verification/verificationStyles";
import { formatDateTime } from "@/src/utils/verification";
import SeverityBadge from "./SeverityBadge";
import StatusBadge from "./StatusBadge";

/** Same hazard within about 5 km and 48 hours, to help spot duplicates. */
export default function NearbyReports({ reports }) {
  return (
    <section className={`${ui.card} p-5`}>
      <h2 className="text-lg font-bold text-[#16283D]">Similar reports nearby</h2>
      <p className={`text-xs ${ui.muted}`}>Same hazard type, about 5 km and 48 hours either side</p>
      {reports?.length ? (
        <ul className="mt-3 divide-y divide-[#DDE5EE]">
          {reports.map((item) => (
            <li key={item._id} className="py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/hazard-reports/${item._id}`}
                  className="font-semibold text-[#1877B9] hover:text-[#075B94]"
                >
                  {item.reportId}
                </Link>
                <SeverityBadge severity={item.severity} />
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-[#16283D]">{item.description}</p>
              <p className={`text-xs ${ui.muted}`}>
                {item.location?.district ? `${item.location.district} · ` : ""}
                {formatDateTime(item.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`mt-3 text-sm ${ui.muted}`}>No similar reports found.</p>
      )}
    </section>
  );
}
