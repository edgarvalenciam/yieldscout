"use client";

import { useEffect, useState } from "react";
import type { Pool } from "@/types";
import { fetchPools } from "@/lib/defillama";
import { CACHE_DURATION, CACHE_KEYS } from "@/lib/constants";
import { readLocalCache, writeLocalCache } from "@/lib/localCache";

function revivePools(pools: Pool[]): Pool[] {
  return pools.map((p) => ({
    ...p,
    lastUpdated:
      p.lastUpdated instanceof Date
        ? p.lastUpdated
        : new Date(String(p.lastUpdated)),
  }));
}

export function useYields() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = readLocalCache<Pool[]>(
      CACHE_KEYS.YIELDS,
      CACHE_DURATION.YIELDS,
    );

    async function runFetch() {
      try {
        const data = await fetchPools();
        if (cancelled) return;
        writeLocalCache(CACHE_KEYS.YIELDS, data);
        setPools(data);
        setLastUpdated(new Date());
        setIsStale(false);
        setError(null);
      } catch {
        if (!cancelled) {
          if (!cached) {
            setError("No se pudieron cargar los datos.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (cached) {
      setPools(revivePools(cached.data));
      setLastUpdated(new Date(cached.cachedAt));
      setIsStale(cached.stale);
      setLoading(false);
      void runFetch();
    } else {
      void runFetch();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return { pools, loading, error, isStale, lastUpdated };
}
