import type { AdminSession } from "../types/user";

const SESSION_STORAGE_KEY = "disaster-warning.admin-session.v1";
export const ADMIN_SESSION_EXPIRED_EVENT = "disaster-warning.admin-session-expired";

/** Read the officer session only in the browser; the API remains the source of authorization. */
export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!value) return null;
    const session = JSON.parse(value) as Partial<AdminSession>;
    if (
      typeof session.token !== "string" ||
      !session.user ||
      typeof session.user._id !== "string" ||
      typeof session.user.role !== "string"
    ) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session as AdminSession;
  } catch {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function saveAdminSession(session: AdminSession): void {
  if (typeof window === "undefined") {
    throw new Error("Sign in from the browser to start an admin session.");
  }
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearAdminSession(): void {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export function getAdminToken(): string | null {
  return getAdminSession()?.token ?? null;
}

export function isDistrictOfficer(session: AdminSession | null): boolean {
  return session?.user.role === "District Officer";
}
