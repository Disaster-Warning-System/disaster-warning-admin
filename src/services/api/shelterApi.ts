import type {
  CreateShelterInput,
  ShelterOccupancyHistory,
  Shelter,
  UpdateShelterInput,
} from "../../types/shelter";
import {
  ADMIN_SESSION_EXPIRED_EVENT,
  clearAdminSession,
  getAdminToken,
} from "../../lib/auth.ts";
const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");
type Envelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
};

/** Keeps the HTTP status available so the offline queue can distinguish outages from invalid updates. */
export class ShelterApiError extends Error {
  readonly statusCode: number | null;

  constructor(message: string, statusCode: number | null) {
    super(message);
    this.name = "ShelterApiError";
    this.statusCode = statusCode;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(API + path, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
        ...authorizationHeader(),
      },
    });
  } catch {
    throw new ShelterApiError("Unable to reach the shelter service.", null);
  }
  let body: Envelope<T>;
  try {
    body = (await response.json()) as Envelope<T>;
  } catch {
    throw new ShelterApiError("The shelter service returned an invalid response.", response.status);
  }
  if (response.status === 401) handleUnauthorized();
  if (!response.ok || !body.success)
    throw new ShelterApiError(
      body.errors?.join(", ") || body.message || "Shelter request failed.",
      response.status,
    );
  return body.data;
}

function authorizationHeader(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleUnauthorized(): void {
  clearAdminSession();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
  }
}

export const getShelters = () => request<Shelter[]>("/api/shelters");
export const getShelter = (id: string) =>
  request<Shelter>("/api/shelters/" + encodeURIComponent(id));
export const getShelterOccupancyHistory = (id: string) =>
  request<ShelterOccupancyHistory>(
    "/api/shelters/" + encodeURIComponent(id) + "/history",
  );
export const getShelterImageUrl = (imageId: string) =>
  API + "/api/shelters/images/" + encodeURIComponent(imageId);
export async function uploadShelterImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  let response: Response;
  try {
    response = await fetch(API + "/api/shelters/images", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json", ...authorizationHeader() },
    });
  } catch {
    throw new Error("Unable to reach the shelter service to upload the image.");
  }
  if (response.status === 401) handleUnauthorized();
  let body: Envelope<{ imageId: string }>;
  try {
    body = (await response.json()) as Envelope<{ imageId: string }>;
  } catch {
    throw new Error("The shelter service returned an invalid image response.");
  }
  if (!response.ok || !body.success || !body.data?.imageId) {
    throw new Error(body.errors?.join(", ") || body.message || "Shelter image upload failed.");
  }
  return body.data.imageId;
}
export const deleteShelterImage = (imageId: string) =>
  request<unknown>("/api/shelters/images/" + encodeURIComponent(imageId), {
    method: "DELETE",
  });
export const createShelter = (input: CreateShelterInput) =>
  request<Shelter>("/api/shelters", {
    method: "POST",
    body: JSON.stringify(input),
  });
export const updateShelter = (id: string, input: UpdateShelterInput) =>
  request<Shelter>("/api/shelters/" + encodeURIComponent(id), {
    method: "PATCH",
    body: JSON.stringify(input),
  });
export const deleteShelter = (id: string) =>
  request<Shelter>("/api/shelters/" + encodeURIComponent(id), {
    method: "DELETE",
  });
