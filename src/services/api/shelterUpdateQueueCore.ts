import type { UpdateShelterInput } from "@/src/types/shelter";

export type ShelterQueueItem = {
  queueId: string;
  shelterId: string;
  changes: UpdateShelterInput;
  queuedAt: string;
  lastError?: string;
};

/** Keep one reviewed, latest update per shelter while preserving other queued shelters. */
export function upsertShelterQueueItem(
  queue: ShelterQueueItem[],
  next: ShelterQueueItem,
): ShelterQueueItem[] {
  const existingIndex = queue.findIndex((item) => item.shelterId === next.shelterId);
  const existing = existingIndex >= 0 ? queue[existingIndex] : undefined;
  const replacement = {
    ...next,
    queueId: existing?.queueId || next.queueId,
    changes: { ...existing?.changes, ...next.changes },
  };
  if (existingIndex < 0) return [...queue, replacement];
  return queue.map((item, index) => index === existingIndex ? replacement : item);
}

export function removeShelterQueueItem(
  queue: ShelterQueueItem[],
  queueId: string,
): ShelterQueueItem[] {
  return queue.filter((item) => item.queueId !== queueId);
}

/** Retry network and server failures; retain client errors for a user to correct. */
export function shouldRetryShelterUpdate(statusCode: number | null): boolean {
  return statusCode === null || statusCode >= 500;
}
