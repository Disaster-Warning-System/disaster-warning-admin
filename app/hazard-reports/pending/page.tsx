'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getOfficerReports } from '@/src/services/api/officerReportApi';
import type { HazardReport } from '@/src/types/hazardReport';

export default function PendingReportsPage() {
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void getOfficerReports().then(setReports).catch(() => setError('Unable to load pending reports. Please sign in again.'));
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 bg-zinc-50 px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Pending hazard reports</h1>
          <p className="mt-2 text-zinc-600">Review citizen evidence before issuing a public warning.</p>
        </div>
        <Link href="/warnings/create" className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white">Issue warning</Link>
      </div>
      {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {!reports.length && !error ? <p className="p-8 text-center text-zinc-500">No reports are waiting for verification.</p> : (
          <div className="divide-y divide-zinc-200">
            {reports.map((report) => (
              <Link key={report._id} href={`/hazard-reports/${report._id}`} className="block p-5 hover:bg-zinc-50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-semibold text-zinc-900">{report.reportId || report.hazardType}</h2>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">{report.severity || 'Medium'}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-700">{report.hazardType}: {report.description}</p>
                <p className="mt-2 text-sm text-zinc-500">{report.district || report.location?.district || 'District not provided'} · {new Date(report.createdAt).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}