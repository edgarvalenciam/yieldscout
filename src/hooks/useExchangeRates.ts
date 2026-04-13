"use client";

import { useEffect, useState } from "react";
import type { ExchangeRates } from "@/types";
import { fetchExchangeRates } from "@/lib/exchangeRate";
import { CACHE_DURATION, CACHE_KEYS } from "@/lib/constants";
import { readLocalCache, writeLocalCache } from "@/lib/localCache";

function reviveRates(r: ExchangeRates): ExchangeRates {
  const lu = r.lastUpdated;
  return {
    ...r,
    lastUpdated: lu instanceof Date ? lu : new Date(String(lu)),
  };
}

export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = readLocalCache<ExchangeRates>(
      CACHE_KEYS.FX,
      CACHE_DURATION.FX,
    );

    async function runFetch() {
      try {
        const data = await fetchExchangeRates();
        if (cancelled) return;
        writeLocalCache(CACHE_KEYS.FX, data);
        setRates(reviveRates(data));
        setLastUpdated(data.lastUpdated);
        setIsStale(false);
        setError(null);
      } catch {
        if (!cancelled) {
          if (!cached) {
            setError("No se pudieron cargar los tipos de cambio.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (cached) {
      setRates(reviveRates(cached.data));
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

  return { rates, loading, error, isStale, lastUpdated };
}
