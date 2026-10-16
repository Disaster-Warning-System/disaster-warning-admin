import Link from "next/link";
import { formatAge } from "@/src/utils/verification";
import SeverityBadge from "./SeverityBadge";
import StatusBadge from "./StatusBadge";

export default function ReportQueueTable({ reports }) {
  if (reports.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#DDE5EE] bg-white p-8 text-center text-sm text-[#6B7C8F]">
        No reports match these filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#DDE5EE] bg-white shadow-sm">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-[#DDE5EE] bg-[#F5F7FA] text-xs uppercase tracking-wide text-[#6B7C8F]">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Report</th>
            <th scope="col" className="px-4 py-3 font-semibold">Severity</th>
            <th scope="col" className="px-4 py-3 font-semibold">Description</th>
            <th scope="col" className="px-4 py-3 font-semibold">District</th>
            <th scope="col" className="px-4 py-3 font-semibold">Evidence</th>
            <th scope="col" className="px-4 py-3 font-semibold">Age</th>
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDE5EE]">
          {reports.map((report) => (
            <tr key={report._id} className={report.overdue ? "bg-red-50/60" : "hover:bg-[#F5F7FA]"}>
              <td className="px-4 py-3">
                <Link
                  href={`/hazard-reports/${report._id}`}
                  className="font-semibold text-[#1877B9] hover:text-[#075B94]"
                >
                  {report.reportId || "Open report"}
                </Link>
                <p className="text-xs text-[#6B7C8F]">{report.hazardType}</p>
              </td>
              <td className="px-4 py-3">
                <SeverityBadge severity={report.severity} />
              </td>
              <td className="max-w-xs px-4 py-3">
                <p className="line-clamp-2 text-[#16283D]">{report.description}</p>
              </td>
              <td className="px-4 py-3 text-[#16283D]">{report.district || "—"}</td>
              <td className="px-4 py-3 tabular-nums text-[#16283D]">{report.evidenceCount}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="tabular-nums text-[#16283D]">{formatAge(report.ageMinutes)}</span>
                {report.overdue ? (
                  <span className="ml-2 rounded-md bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
                    Overdue
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={report.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
