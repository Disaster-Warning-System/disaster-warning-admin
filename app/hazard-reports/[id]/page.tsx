'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import Image from 'next/image';
import Link from 'next/link';
import { hazardPhotoUrl } from '@/src/services/api/hazardReportApi';
import { getOfficerReport, verifyOfficerReport } from '@/src/services/api/officerReportApi';
import type { HazardReport } from '@/src/types/hazardReport';

export default function HazardReportPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<HazardReport | null>(null);
  const [error, setError] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      void getOfficerReport(params.id).then(setReport).catch(() => setError('Unable to load hazard report. Please sign in again.'));
    }
  }, [params.id]);

  async function decide(decision: 'Verified' | 'Rejected' | 'Needs More Information') {
    if (decision !== 'Verified' && !remarks.trim()) {
      setError('Remarks are required for this decision.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      setReport(await verifyOfficerReport(params.id, decision, remarks));
    } catch {
      setError('Unable to save the verification decision.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 bg-zinc-50 px-6 py-10">
      <Link href="/hazard-reports/pending" className="text-sm text-blue-700">Back to pending reports</Link>
      <h1 className="mt-4 text-3xl font-semibold text-zinc-900">Review hazard report</h1>
      {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      {!report && !error && <p className="mt-6 text-zinc-500">Loading report...</p>}
      {report && (
        <article className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-500">{report.reportId}</p>
              <h2 className="mt-1 text-2xl font-semibold text-zinc-900">{report.hazardType}</h2>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">{report.status}</span>
          </div>
          <p className="mt-5 text-zinc-700">{report.description}</p>
          <p className="mt-3 text-sm text-zinc-500">{report.location.address || `${report.location.latitude}, ${report.location.longitude}`}</p>
          {report.photoFileId && <Image className="mt-5 max-h-80 w-auto rounded-lg border object-contain" src={hazardPhotoUrl(report.photoFileId)} alt="Submitted hazard evidence" width={640} height={480} unoptimized />}
          {report.status === 'Pending Verification' && (
            <div className="mt-8 border-t border-zinc-200 pt-6">
              <label htmlFor="remarks" className="block text-sm font-medium text-zinc-700">Officer remarks</label>
              <textarea id="remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} rows={4} className="mt-2 w-full rounded-lg border border-zinc-300 p-3" />
              <div className="mt-4 flex flex-wrap gap-3">
                <button disabled={submitting} onClick={() => void decide('Verified')} className="rounded-lg bg-green-700 px-4 py-2 font-medium text-white disabled:opacity-60">Verify report</button>
                <button disabled={submitting} onClick={() => void decide('Needs More Information')} className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white disabled:opacity-60">Request information</button>
                <button disabled={submitting} onClick={() => void decide('Rejected')} className="rounded-lg bg-red-700 px-4 py-2 font-medium text-white disabled:opacity-60">Reject report</button>
              </div>
            </div>
          )}
          {report.status === 'Verified' && (
            <Link
              href={`/warnings/create?reportId=${encodeURIComponent(report._id)}`}
              className="mt-8 inline-block rounded-lg bg-blue-700 px-4 py-2 font-medium text-white"
            >
              Issue warning from this verified report
            </Link>
          )}
          {report.verifications?.length ? <section className="mt-8 border-t border-zinc-200 pt-6"><h3 className="font-semibold text-zinc-900">Verification history</h3>{report.verifications.map((verification) => <p key={verification._id} className="mt-2 text-sm text-zinc-600">{verification.decision} by {verification.officer?.name || 'officer'}: {verification.remarks || 'No remarks'}</p>)}</section> : null}
        </article>
      )}
    </main>
  );
}
