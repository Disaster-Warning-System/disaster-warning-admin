'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import HazardReportDetails from '@/src/components/hazard-reports/HazardReportDetails';
import { getHazardReport } from '@/src/services/api/hazardReportApi';
import type { HazardReport } from '@/src/types/hazardReport';

export default function HazardReportPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<HazardReport | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      void getHazardReport(params.id).then(setReport).catch(() => setError('Unable to load hazard report.'));
    }
  }, [params.id]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 bg-zinc-50 px-6 py-10">
      <h1 className="text-3xl font-semibold text-zinc-900">Hazard report</h1>
      {error ? <p className="mt-6 text-red-600">{error}</p> : report ? <div className="mt-8"><HazardReportDetails report={report} /></div> : <p className="mt-6 text-zinc-500">Loading report...</p>}
    </main>
  );
}
