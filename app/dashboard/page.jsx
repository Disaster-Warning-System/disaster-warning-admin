"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminAuthGate, { useAdminSession } from "@/src/components/admin/AdminAuthGate";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";
import DashboardStats from "@/src/components/verification/DashboardStats";
import RecentActivity from "@/src/components/verification/RecentActivity";
import { isDmcOfficer } from "@/src/lib/roles";
import { getDashboard } from "@/src/services/api/verificationApi";

function VerificationOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let active = true;
    getDashboard()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((reason) => {
        if (active) setError(reason?.message || "Unable to load the dashboard.");
      });
    return () => {
      active = false;
    };
  }, [reloadCount]);

  function retry() {
    setError("");
    setReloadCount((count) => count + 1);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#16283D]">Hazard report verification</h2>
          <p className={`text-sm ${ui.muted}`}>Reports from citizens waiting for an officer&apos;s decision</p>
        </div>
        <Link href="/hazard-reports" className={ui.primaryButton}>
          Open report queue
        </Link>
      </div>
      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}{" "}
          <button type="button" onClick={retry} className="font-semibold underline">
            Try again
          </button>
        </p>
      ) : stats ? (
        <>
          <DashboardStats stats={stats} />
          <RecentActivity items={stats.recentActivity || []} />
        </>
      ) : (
        <p role="status" className={`text-sm ${ui.muted}`}>
          Loading dashboard...
        </p>
      )}
    </section>
  );
}

function ShelterOverview() {
  return (
    <section className={`${ui.card} flex flex-wrap items-center justify-between gap-4 p-5`}>
      <div>
        <h2 className="text-xl font-bold text-[#16283D]">Emergency shelters</h2>
        <p className={`text-sm ${ui.muted}`}>Manage shelter capacity, occupancy and operational status.</p>
      </div>
      <Link href="/shelters" className={ui.primaryButton}>
        Manage shelters
      </Link>
    </section>
  );
}

function DashboardContent() {
  const session = useAdminSession();
  return (
    <main className={ui.page}>
      <div className={ui.container}>
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1877B9]">Admin dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#16283D]">
            Welcome, {session.user.name}
          </h1>
        </header>
        {isDmcOfficer(session) ? <VerificationOverview /> : <ShelterOverview />}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AdminAuthGate>
      <DashboardContent />
    </AdminAuthGate>
  );
}
