"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ADMIN_SESSION_EXPIRED_EVENT,
  clearAdminSession,
  getAdminSession,
} from "@/src/lib/auth";
import { ROLES, hasRole, homePathFor } from "@/src/lib/roles";
import { clearWarningToken } from "@/src/lib/warningToken";
import AdminHeader from "./AdminHeader";

const AdminSessionContext = createContext(null);

export function useAdminSession() {
  return useContext(AdminSessionContext);
}

/** Shows children only to a signed-in officer whose role is in `roles`; the API still enforces access. */
export default function AdminAuthGate({ roles = [ROLES.DMC_OFFICER], children }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const rolesKey = roles.join("|");

  useEffect(() => {
    let active = true;
    const allowedRoles = rolesKey.split("|");

    // Defer storage reads until after hydration so server and browser markup match
    Promise.resolve().then(() => {
      if (!active) return;
      const currentSession = getAdminSession();
      if (!currentSession) {
        router.replace("/login");
        return;
      }
      if (!hasRole(currentSession, allowedRoles)) {
        // Signed in, but this area belongs to another role: send them to their own area
        router.replace(homePathFor(currentSession) ?? "/login");
        return;
      }
      setSession(currentSession);
    });

    const handleExpiredSession = () => {
      clearWarningToken();
      setSession(null);
      router.replace("/login");
    };
    window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, handleExpiredSession);
    return () => {
      active = false;
      window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, handleExpiredSession);
    };
  }, [router, rolesKey]);

  function signOut() {
    clearAdminSession();
    clearWarningToken();
    router.replace("/login");
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4 text-[#16283D]">
        <p role="status" className="rounded-xl border border-[#DDE5EE] bg-white px-5 py-4 text-sm">
          Checking officer access...
        </p>
      </main>
    );
  }

  return (
    <AdminSessionContext.Provider value={session}>
      <AdminHeader user={session.user} onSignOut={signOut} />
      {children}
    </AdminSessionContext.Provider>
  );
}
