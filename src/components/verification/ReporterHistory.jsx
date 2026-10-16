import { verificationStyles as ui } from "@/src/components/verification/verificationStyles";

export default function ReporterHistory({ history }) {
  return (
    <section className={`${ui.card} p-5`}>
      <h2 className="text-lg font-bold text-[#16283D]">Reporter history</h2>
      {history ? (
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ["Other reports", history.total],
            ["Verified", history.verified],
            ["Rejected", history.rejected],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[#F5F7FA] p-3">
              <dt className={`text-xs font-semibold ${ui.muted}`}>{label}</dt>
              <dd className="mt-1 text-xl font-bold tabular-nums text-[#16283D]">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className={`mt-3 text-sm ${ui.muted}`}>Anonymous report, no history available.</p>
      )}
    </section>
  );
}
