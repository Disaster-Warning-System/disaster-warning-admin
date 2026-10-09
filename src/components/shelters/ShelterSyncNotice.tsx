"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  discardPendingShelterUpdate,
  getPendingShelterUpdates,
  subscribeToShelterUpdateQueue,
  syncPendingShelterUpdates,
  type PendingShelterUpdate,
} from "@/src/services/api/shelterUpdateQueue";

export default function ShelterSyncNotice() {
  const [updates, setUpdates] = useState<PendingShelterUpdate[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const refresh = () => setUpdates(getPendingShelterUpdates());
    refresh();
    const unsubscribe = subscribeToShelterUpdateQueue(refresh);
    const syncWhenOnline = () => void sync();
    const updateOnlineState = () => setIsOnline(window.navigator.onLine);
    const initialOnlineCheck = window.setTimeout(updateOnlineState, 0);
    window.addEventListener("online", syncWhenOnline);
    window.addEventListener("online", updateOnlineState);
    window.addEventListener("offline", updateOnlineState);
    if (window.navigator.onLine) void sync();
    return () => {
      unsubscribe();
      window.clearTimeout(initialOnlineCheck);
      window.removeEventListener("online", syncWhenOnline);
      window.removeEventListener("online", updateOnlineState);
      window.removeEventListener("offline", updateOnlineState);
    };
    // The online handler is installed once per mounted shelter layout.
  }, []);

  async function sync() {
    setSyncing(true);
    try {
      const result = await syncPendingShelterUpdates();
      setSyncMessage(result.synced
        ? `${result.synced} shelter update${result.synced === 1 ? "" : "s"} synced.`
        : "");
      setUpdates(getPendingShelterUpdates());
    } catch {
      setSyncMessage("The pending updates could not be read or saved. Keep this page open and try again.");
    } finally {
      setSyncing(false);
    }
  }

  if (!updates.length) {
    return syncMessage ? (
      <p role="status" className="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-800">{syncMessage}</p>
    ) : null;
  }

  return (
    <aside aria-label="Shelter updates awaiting synchronization" className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-[#16283D]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{updates.length} shelter update{updates.length === 1 ? "" : "s"} saved on this device and awaiting server sync.</p>
          <p className="mt-1 text-[#6B5B36]">{updates.some((item) => item.lastError)
            ? "A sync attempt needs attention. Review the affected shelter or retry when connected."
            : "The updates will retry automatically when this device is online."}</p>
          <ul className="mt-2 space-y-1">
            {updates.map((item) => (
              <li key={item.queueId} className="flex flex-wrap items-center gap-2">
                <Link className="font-semibold text-[#1877B9] underline" href={`/shelters/${item.shelterId}`}>Review shelter update</Link>
                {item.lastError ? <span className="text-red-700">{item.lastError}</span> : null}
                {item.lastError ? <button type="button" onClick={() => {
                  if (window.confirm("Discard this locally saved shelter update?")) {
                    discardPendingShelterUpdate(item.queueId);
                    setUpdates(getPendingShelterUpdates());
                  }
                }} className="font-semibold text-red-700 underline">Discard local update</button> : null}
              </li>
            ))}
          </ul>
        </div>
        <button type="button" disabled={syncing || !isOnline} onClick={() => void sync()}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#1877B9] px-4 py-2.5 font-semibold text-white hover:bg-[#075B94] disabled:cursor-not-allowed disabled:opacity-60">
          {syncing ? "Syncing..." : isOnline ? "Sync now" : "Waiting for connection"}
        </button>
      </div>
    </aside>
  );
}
