"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ADMIN_SESSION_EXPIRED_EVENT,
  clearAdminSession,
  getAdminSession,
  isDistrictOfficer,
} from "@/src/lib/auth";
import type { AdminSession } from "@/src/types/user";

export default function ShelterAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const verifySession = () => {
      // Defer storage reads until after hydration so server and browser markup match.
      Promise.resolve().then(() => {
        if (!active) return;
        const currentSession = getAdminSession();
        if (!isDistrictOfficer(currentSession)) {
          if (currentSession) clearAdminSession();
          router.replace("/login");
          return;
        }
        setSession(currentSession);
        setReady(true);
      });
    };
    const handleExpiredSession = () => {
      setSession(null);
      setReady(false);
      router.replace("/login");
    };

    verifySession();
    window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, handleExpiredSession);
    return () => {
      active = false;
      window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, handleExpiredSession);
    };
  }, [router]);

  function signOut() {
    clearAdminSession();
    router.replace("/login");
  }

  if (!ready || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4 text-[#16283D]">
        <p role="status" className="rounded-xl border border-[#DDE5EE] bg-white px-5 py-4 text-sm">
          Checking District Officer access...
        </p>
      </main>
    );
  }

  return (
    <>
      <header className="border-b border-[#DDE5EE] bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-semibold text-[#16283D]">
            {session.user.name} <span className="font-normal text-[#6B7C8F]">· District Officer</span>
          </p>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-[#DDE5EE] px-4 py-2 text-sm font-semibold text-[#1877B9] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9]"
          >
            Sign out
          </button>
        </div>
      </header>
      {children}
    </>
  );
}
