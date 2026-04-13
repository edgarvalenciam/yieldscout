"use client";

import { useEffect, useState } from "react";
import type { BenchmarkProduct } from "@/types";
import {
  CACHE_DURATION,
  CACHE_KEYS,
  CETES_BENCHMARK_BASE,
} from "@/lib/constants";

const FALLBACK_RATE = 6.6;
const FALLBACK_SOURCE = "Subasta 7 abril 2026";

type CetesCachePayload = {
  rate: number;
  /** ISO yyyy-mm-dd (fecha del dato Banxico) */
  date: string;
  fetchedAt: number;
};

function formatIsoDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => Number.parseInt(n, 10));
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(date);
}

function hoursAgoLabel(fetchedAt: number): string {
  const hours = Math.floor((Date.now() - fetchedAt) / (1000 * 60 * 60));
  if (hours < 1) return "datos de hace menos de 1 hora";
  if (hours === 1) return "datos de hace 1 hora";
  return `datos de hace ${hours} horas`;
}

function readCache(): CetesCachePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEYS.CETES);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (
      typeof o.rate !== "number" ||
      typeof o.date !== "string" ||
      typeof o.fetchedAt !== "number"
    ) {
      return null;
    }
    return { rate: o.rate, date: o.date, fetchedAt: o.fetchedAt };
  } catch {
    return null;
  }
}

function writeCache(payload: CetesCachePayload) {
  try {
    localStorage.setItem(CACHE_KEYS.CETES, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
}

function buildCetesBenchmark(
  rate: number,
  lastUpdatedIso: string,
  apyFootnote: string,
  source: string,
  staleDataBadge?: string,
): BenchmarkProduct {
  return {
    ...CETES_BENCHMARK_BASE,
    apyAnnual: rate,
    lastUpdated: lastUpdatedIso,
    source,
    apyFootnote,
    staleDataBadge,
  };
}

function fallbackBenchmark(): BenchmarkProduct {
  return buildCetesBenchmark(
    FALLBACK_RATE,
    "2026-04-07",
    `Fuente: Banxico · ${FALLBACK_SOURCE}`,
    FALLBACK_SOURCE,
  );
}

export function useCetes() {
  const [benchmark, setBenchmark] = useState<BenchmarkProduct>(() =>
    fallbackBenchmark(),
  );

  useEffect(() => {
    const cached = readCache();
    const now = Date.now();
    const cacheFresh =
      cached && now - cached.fetchedAt < CACHE_DURATION.CETES;

    if (cached && cacheFresh) {
      setBenchmark(
        buildCetesBenchmark(
          cached.rate,
          cached.date,
          `Fuente: Banxico · Actualizado: ${formatIsoDateLong(cached.date)}`,
          "Referencia soberana (28 días, México)",
        ),
      );
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (cached && !cacheFresh) {
        setBenchmark(
          buildCetesBenchmark(
            cached.rate,
            cached.date,
            `Fuente: Banxico · Actualizado: ${formatIsoDateLong(cached.date)}`,
            "Referencia soberana (28 días, México)",
          ),
        );
      } else if (!cached) {
        setBenchmark(fallbackBenchmark());
      }

      try {
        const res = await fetch("/api/cetes");
        if (!res.ok) throw new Error("cetes_fetch_failed");
        const body = (await res.json()) as { rate?: number; date?: string };
        if (
          typeof body.rate !== "number" ||
          typeof body.date !== "string" ||
          Number.isNaN(body.rate)
        ) {
          throw new Error("cetes_invalid_body");
        }

        const payload: CetesCachePayload = {
          rate: body.rate,
          date: body.date,
          fetchedAt: Date.now(),
        };
        writeCache(payload);

        if (cancelled) return;
        setBenchmark(
          buildCetesBenchmark(
            payload.rate,
            payload.date,
            `Fuente: Banxico · Actualizado: ${formatIsoDateLong(payload.date)}`,
            "Referencia soberana (28 días, México)",
          ),
        );
      } catch {
        if (cancelled) return;
        if (cached) {
          setBenchmark(
            buildCetesBenchmark(
              cached.rate,
              cached.date,
              `Fuente: Banxico · Actualizado: ${formatIsoDateLong(cached.date)}`,
              "Referencia soberana (28 días, México)",
              hoursAgoLabel(cached.fetchedAt),
            ),
          );
        } else {
          setBenchmark(fallbackBenchmark());
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return benchmark;
}
