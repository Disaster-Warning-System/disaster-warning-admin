import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import { formatDateTime } from "@/src/utils/verification";
import SeverityBadge from "./SeverityBadge";
import StatusBadge from "./StatusBadge";

const CHECKLIST_LABELS = {
  locationChecked: "Location checked",
  evidenceReviewed: "Evidence reviewed",
  duplicatesChecked: "Duplicates checked",
};

export default function VerificationHistory({ items }) {
  return (
    <section className={`${ui.card} p-5`}>
      <h2 className="text-lg font-bold text-[#16283D]">Decision history</h2>
      {items?.length ? (
        <ol className="mt-3 space-y-3">
          {items.map((item) => {
            const checked = Object.entries(item.checklist || {})
              .filter(([, value]) => value === true)
              .map(([key]) => CHECKLIST_LABELS[key] || key);
            return (
              <li key={item._id} className="rounded-xl border border-[#DDE5EE] p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.decision} />
                  <SeverityBadge severity={item.severity} />
                </div>
                <p className={`mt-1 text-xs ${ui.muted}`}>
                  {item.officer?.name || "Unknown officer"} · {formatDateTime(item.createdAt)}
                </p>
                {item.remarks ? (
                  <p className="mt-2 whitespace-pre-line text-sm text-[#16283D]">{item.remarks}</p>
                ) : null}
                {checked.length ? (
                  <p className={`mt-1 text-xs ${ui.muted}`}>✓ {checked.join(" · ")}</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className={`mt-3 text-sm ${ui.muted}`}>No decisions yet.</p>
      )}
    </section>
  );
}
