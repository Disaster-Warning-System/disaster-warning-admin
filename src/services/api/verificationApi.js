import {
  ADMIN_SESSION_EXPIRED_EVENT,
  clearAdminSession,
  getAdminToken,
} from "../../lib/auth.ts";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export class VerificationApiError extends Error {
  constructor(message, statusCode = null) {
    super(message);
    this.name = "VerificationApiError";
    this.statusCode = statusCode;
  }
}

async function request(path, { method = "GET", body } = {}) {
  const token = getAdminToken();
  if (!token) {
    window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
    throw new VerificationApiError("Your session has ended. Sign in again.", 401);
  }

  let response;
  try {
    response = await fetch(`${API}${path}`, {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new VerificationApiError("Unable to reach the server. Check the connection and try again.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Handled below: a failed or empty body still gets a readable error
  }

  if (response.status === 401) {
    clearAdminSession();
    window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
    throw new VerificationApiError("Your session has ended. Sign in again.", 401);
  }

  if (!response.ok || !payload?.success) {
    throw new VerificationApiError(
      payload?.message || "The server could not complete the request. Try again.",
      response.status,
    );
  }

  return payload;
}

export function photoUrl(fileId) {
  return `${API}/api/uploads/hazard-photo/${encodeURIComponent(fileId)}`;
}

export async function getDashboard() {
  return (await request("/api/officer/dashboard")).data;
}

/** Returns { count, total, page, pages, data } for one page of the queue. */
export async function listReports(query = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const { count, total, page, pages, data } = await request(`/api/reports?${params}`);
  return { count, total, page, pages, data: Array.isArray(data) ? data : [] };
}

export async function getReport(id) {
  return (await request(`/api/reports/${encodeURIComponent(id)}`)).data;
}

/** body: { decision, remarks, checklist?, severity? }. Resolves to { report, verification }. */
export async function submitDecision(id, body) {
  return (
    await request(`/api/reports/${encodeURIComponent(id)}/verification`, { method: "POST", body })
  ).data;
}

export async function reopenReport(id, remarks) {
  return (
    await request(`/api/reports/${encodeURIComponent(id)}/reopen`, {
      method: "POST",
      body: { remarks },
    })
  ).data;
}

export async function getWarningDraft(id) {
  return (await request(`/api/reports/${encodeURIComponent(id)}/warning-draft`)).data;
}
