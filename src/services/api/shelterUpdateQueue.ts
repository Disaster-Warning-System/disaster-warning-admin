import { ShelterApiError, updateShelter } from "@/src/services/api/shelterApi";
import type { UpdateShelterInput } from "@/src/types/shelter";
import {
  removeShelterQueueItem,
  shouldRetryShelterUpdate,
  upsertShelterQueueItem,
} from "@/src/services/api/shelterUpdateQueueCore";

const STORAGE_KEY = "disaster-warning.pending-shelter-updates.v1";
const CHANGE_EVENT = "shelter-pending-updates-changed";

export type PendingShelterUpdate = {
  queueId: string;
  shelterId: string;
  changes: UpdateShelterInput;
  queuedAt: string;
  lastError?: string;
};

export type ShelterSyncResult = { synced: number; pending: number };
let activeSync: Promise<ShelterSyncResult> | null = null;

function readQueue(): PendingShelterUpdate[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter(isPendingUpdate);
  } catch {
    // Corrupt or unavailable browser storage must not crash the shelter dashboard.
    return [];
  }
}

function isPendingUpdate(value: unknown): value is PendingShelterUpdate {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<PendingShelterUpdate>;
  return typeof record.queueId === "string" &&
    typeof record.shelterId === "string" &&
    typeof record.queuedAt === "string" &&
    !!record.changes && typeof record.changes === "object";
}

function writeQueue(updates: PendingShelterUpdate[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getPendingShelterUpdates(): PendingShelterUpdate[] {
  return readQueue();
}

export function getPendingShelterUpdate(shelterId: string): PendingShelterUpdate | undefined {
  return readQueue().find((update) => update.shelterId === shelterId);
}

export function queueShelterUpdate(shelterId: string, changes: UpdateShelterInput): void {
  if (typeof window === "undefined") {
    throw new Error("This update cannot be saved offline in the current environment.");
  }
  const updates = readQueue();
  const next: PendingShelterUpdate = {
    queueId: crypto.randomUUID(),
    shelterId,
    changes,
    queuedAt: new Date().toISOString(),
  };
  writeQueue(upsertShelterQueueItem(updates, next));
}

export function discardPendingShelterUpdate(queueId: string): void {
  writeQueue(removeShelterQueueItem(readQueue(), queueId));
}

export function subscribeToShelterUpdateQueue(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function syncPendingShelterUpdates(): Promise<ShelterSyncResult> {
  if (activeSync) return activeSync;
  activeSync = syncQueue().finally(() => { activeSync = null; });
  return activeSync;
}

async function syncQueue(): Promise<ShelterSyncResult> {
  if (typeof window === "undefined" || !window.navigator.onLine) {
    return { synced: 0, pending: readQueue().length };
  }
  let synced = 0;
  for (const update of readQueue()) {
    try {
      await updateShelter(update.shelterId, update.changes);
      discardPendingShelterUpdate(update.queueId);
      synced += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Shelter update could not sync.";
      const statusCode = error instanceof ShelterApiError ? error.statusCode : null;
      writeQueue(readQueue().map((item) =>
        item.queueId === update.queueId ? { ...item, lastError: message } : item,
      ));
      // Client validation failures need review; outages can retry automatically later.
      if (shouldRetryShelterUpdate(statusCode)) break;
    }
  }
  return { synced, pending: readQueue().length };
}
