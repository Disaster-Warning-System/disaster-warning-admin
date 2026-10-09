import Image from 'next/image';

import { hazardPhotoUrl } from '@/src/services/api/hazardReportApi';
import type { HazardReport } from '@/src/types/hazardReport';

export default function HazardReportDetails({ report }: { report: HazardReport }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">{report.hazardType}</h2>
          <p className="mt-1 text-sm text-zinc-500">{new Date(report.createdAt).toLocaleString()}</p>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">{report.status}</span>
      </div>
      <p className="mt-4 text-zinc-700">{report.description}</p>
      <p className="mt-3 text-sm text-zinc-500">
        {report.location.address || `${report.location.latitude}, ${report.location.longitude}`}
      </p>
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-zinc-800">Photo evidence</h3>
        {report.photoFileId ? (
          <Image
            className="mt-2 max-h-80 w-auto rounded-lg border border-zinc-200 object-contain"
            src={hazardPhotoUrl(report.photoFileId)}
            alt="Submitted hazard evidence"
            width={640}
            height={480}
            unoptimized
          />
        ) : (
          <p className="mt-2 text-sm text-zinc-500">No photo attached</p>
        )}
      </div>
    </article>
  );
}
