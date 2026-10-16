import { REPORT_STATUS } from "@/src/utils/verification";

const STATUS_STYLES = {
  [REPORT_STATUS.PENDING]: "bg-amber-50 text-amber-800 ring-amber-200",
  [REPORT_STATUS.VERIFIED]: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  [REPORT_STATUS.REJECTED]: "bg-red-50 text-red-800 ring-red-200",
  [REPORT_STATUS.NEEDS_INFO]: "bg-sky-50 text-sky-800 ring-sky-200",
  Reopened: "bg-violet-50 text-violet-800 ring-violet-200",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLES[status] || "bg-zinc-100 text-zinc-700 ring-zinc-200"
      }`}
    >
      {status}
    </span>
  );
}
