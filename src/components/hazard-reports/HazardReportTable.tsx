import HazardReportDetails from './HazardReportDetails';
import type { HazardReport } from '@/src/types/hazardReport';

export default function HazardReportTable({ reports }: { reports: HazardReport[] }) {
  return (
    <div className="grid gap-4">
      {reports.length ? reports.map((report) => <HazardReportDetails key={report._id} report={report} />) : (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">No hazard reports found.</p>
      )}
    </div>
  );
}
