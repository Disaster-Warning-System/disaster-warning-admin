"use client";

import { useCallback, useEffect, useState } from "react";
import { getShelters } from "@/src/services/api/shelterApi";
import type { Shelter } from "@/src/types/shelter";

export function useShelters() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setShelters(await getShelters());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load shelters.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getShelters().then((value) => {
      if (active) setShelters(value);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Could not load shelters.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return { shelters, loading, error, refresh };
}
