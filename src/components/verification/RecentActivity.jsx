import Link from "next/link";
import { verificationStyles as ui } from "@/src/components/verification/verificationStyles";
import { formatDateTime } from "@/src/utils/verification";
import StatusBadge from "./StatusBadge";

export default function RecentActivity({ items }) {
  return (
    <section className={`${ui.card} p-5`}>
      <h2 className="text-lg font-bold text-[#16283D]">Recent decisions</h2>
      {items.length === 0 ? (
        <p className={`mt-3 text-sm ${ui.muted}`}>No decisions have been recorded yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-[#DDE5EE]">
          {items.map((item) => (
            <li key={item._id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                {item.report ? (
                  <Link
                    href={`/hazard-reports/${item.report._id}`}
                    className="font-semibold text-[#1877B9] hover:text-[#075B94]"
                  >
                    {item.report.reportId || "Report"} · {item.report.hazardType}
                  </Link>
                ) : (
                  <span className="font-semibold">Deleted report</span>
                )}
                <p className={`text-xs ${ui.muted}`}>
                  {item.officer?.name || "Unknown officer"} · {formatDateTime(item.createdAt)}
                </p>
              </div>
              <StatusBadge status={item.decision} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
