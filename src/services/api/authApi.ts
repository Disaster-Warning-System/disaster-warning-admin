import type { AdminLoginInput, AdminSession } from "../../types/user";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export class AdminAuthError extends Error {
  readonly statusCode: number | null;

  constructor(message: string, statusCode: number | null = null) {
    super(message);
    this.name = "AdminAuthError";
    this.statusCode = statusCode;
  }
}

/** Authenticate against the existing backend JWT login endpoint; staff accounts are provisioned separately. */
export async function loginAdmin(input: AdminLoginInput): Promise<AdminSession> {
  let response: Response;
  try {
    response = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new AdminAuthError("Unable to reach the server. Check the connection and try again.");
  }

  let payload: { success?: boolean; data?: AdminSession; message?: string };
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new AdminAuthError("The server returned an invalid login response.", response.status);
  }

  if (!response.ok || !payload.success || !payload.data?.token || !payload.data.user) {
    throw new AdminAuthError(
      payload.message || "Sign in failed. Check your email and password.",
      response.status,
    );
  }

  return payload.data;
}

export type PublicRegistrationInput = {
  name: string;
  email: string;
  password: string;
  district: string;
  riverBasins: string[];
  phoneNumber?: string;
  role: "Citizen" | "Volunteer";
};

export class PublicRegistrationError extends Error {
  readonly statusCode: number | null;

  constructor(message: string, statusCode: number | null = null) {
    super(message);
    this.name = "PublicRegistrationError";
    this.statusCode = statusCode;
  }
}

/** Create a community account through the same public endpoint used by mobile. */
export async function registerPublicUser(input: PublicRegistrationInput): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new PublicRegistrationError("Unable to reach the server. Check the connection and try again.");
  }

  let payload: { success?: boolean; data?: { token?: string; user?: { _id?: string } }; message?: string };
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new PublicRegistrationError("The server returned an invalid registration response.", response.status);
  }

  if (!response.ok || !payload.success || !payload.data?.token || !payload.data.user?._id) {
    throw new PublicRegistrationError(
      payload.message || "Registration failed. Check your details and try again.",
      response.status,
    );
  }
}
