import { ADMIN_SESSION_EXPIRED_EVENT, clearAdminSession, getAdminToken } from "../../lib/auth.ts";

/** Base URL of the backend; configured with NEXT_PUBLIC_API_URL (see .env.example). */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

/** Every failed API call becomes an ApiError; status is null when the server could not be reached. */
export class ApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type Envelope = { success?: boolean; message?: string; errors?: string[] } & Record<string, unknown>;

/** Turns a relative backend path such as "/api/uploads/hazard-photo/<id>" into an absolute URL. */
export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return API_BASE_URL + (path.startsWith("/") ? path : `/${path}`);
}

/**
 * Shared JSON client: prefixes the base URL, attaches the officer's Bearer token and unwraps the
 * backend's `{ success, message }` envelope. A 401 clears the session and broadcasts
 * ADMIN_SESSION_EXPIRED_EVENT so the active auth gate can send the officer back to login.
 * Returns the whole envelope; callers pick `data` or the pagination fields they need.
 */
export async function apiRequest<T extends object>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new ApiError("Unable to reach the server. Check your connection and try again.", null);
  }

  let body: Envelope | null = null;
  try {
    body = (await response.json()) as Envelope;
  } catch {
    body = null;
  }

  if (response.status === 401) handleUnauthorized();

  if (!response.ok || !body || body.success === false) {
    const message = body?.errors?.join(", ") || body?.message || `Request failed (${response.status}).`;
    throw new ApiError(message, response.status);
  }
  return body as T;
}

function handleUnauthorized(): void {
  clearAdminSession();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
  }
}
