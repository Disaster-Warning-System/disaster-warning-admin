'use client';

import { useEffect, useState } from 'react';

import HazardReportTable from '@/src/components/hazard-reports/HazardReportTable';
import { getHazardReports } from '@/src/services/api/hazardReportApi';
import type { HazardReport } from '@/src/types/hazardReport';

export default function HazardReportsPage() {
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void getHazardReports().then(setReports).catch(() => setError('Unable to load hazard reports.'));
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 bg-zinc-50 px-6 py-10">
      <h1 className="text-3xl font-semibold text-zinc-900">Hazard reports</h1>
      <p className="mt-2 text-zinc-600">Review submitted reports and their evidence.</p>
      {error ? <p className="mt-6 text-red-600">{error}</p> : <div className="mt-8"><HazardReportTable reports={reports} /></div>}
    </main>
  );
}
