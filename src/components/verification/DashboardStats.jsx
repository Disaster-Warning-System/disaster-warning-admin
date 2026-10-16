import Link from "next/link";
import { REPORT_STATUS } from "@/src/utils/verification";

function queueHref(status) {
  return `/hazard-reports?status=${encodeURIComponent(status)}`;
}

function StatTile({ label, value, href, tone = "default", hint }) {
  const tones = {
    default: "border-[#DDE5EE]",
    warning: "border-amber-300 bg-amber-50",
    danger: "border-red-300 bg-red-50",
  };
  return (
    <Link
      href={href}
      className={`block rounded-2xl border bg-white p-4 shadow-sm transition hover:border-[#1877B9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9] ${tones[tone]}`}
    >
      <p className="text-sm font-semibold text-[#6B7C8F]">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-[#16283D]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#6B7C8F]">{hint}</p> : null}
    </Link>
  );
}

export default function DashboardStats({ stats }) {
  const counts = stats.statusCounts || {};
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <StatTile
        label="Pending"
        value={stats.pendingCount}
        href={queueHref(REPORT_STATUS.PENDING)}
        tone={stats.pendingCount > 0 ? "warning" : "default"}
      />
      <StatTile
        label="Overdue"
        value={stats.overdueCount}
        href={queueHref(REPORT_STATUS.PENDING)}
        tone={stats.overdueCount > 0 ? "danger" : "default"}
        hint="Waiting more than 30 min"
      />
      <StatTile
        label="Waiting on citizen"
        value={counts[REPORT_STATUS.NEEDS_INFO] ?? 0}
        href={queueHref(REPORT_STATUS.NEEDS_INFO)}
      />
      <StatTile
        label="Verified"
        value={counts[REPORT_STATUS.VERIFIED] ?? 0}
        href={queueHref(REPORT_STATUS.VERIFIED)}
      />
      <StatTile
        label="Rejected"
        value={counts[REPORT_STATUS.REJECTED] ?? 0}
        href={queueHref(REPORT_STATUS.REJECTED)}
      />
    </div>
  );
}
