"use client";

import { useCallback, useMemo, useState } from "react";
import type { RiskTableFilter } from "@/types";
import { LETRAS_BENCHMARK } from "@/lib/constants";
import { useCetes } from "@/hooks/useCetes";
import { getFallbackExchangeRates } from "@/lib/exchangeRate";
import { useCurrency } from "@/hooks/useCurrency";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { useYields } from "@/hooks/useYields";
import { AlertCTA } from "@/components/AlertCTA";
import { Calculator } from "@/components/Calculator";
import { CurrencySelector } from "@/components/CurrencySelector";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { YieldTable } from "@/components/YieldTable";
import { cn } from "@/lib/utils";

function formatStatusTime(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export default function ComparadorPage() {
  const { currency, setCurrency } = useCurrency();
  const [capital, setCapital] = useState(100_000);
  const [riskFilter, setRiskFilter] = useState<RiskTableFilter>("all");

  const {
    pools,
    loading: yieldsLoading,
    error: yieldsError,
    isStale: yieldsStale,
    lastUpdated: yieldsUpdated,
  } = useYields();

  const {
    rates,
    loading: ratesLoading,
    error: ratesError,
    isStale: ratesStale,
    lastUpdated: ratesUpdated,
  } = useExchangeRates();

  const effectiveRates = useMemo(
    () => rates ?? getFallbackExchangeRates(),
    [rates],
  );

  const tableLoading = yieldsLoading || (ratesLoading && !rates);

  const statusParts = useMemo(() => {
    const parts: string[] = [];
    if (yieldsUpdated) {
      parts.push(`Pools: ${formatStatusTime(yieldsUpdated)}`);
    }
    if (ratesUpdated) {
      parts.push(`FX: ${formatStatusTime(ratesUpdated)}`);
    }
    return parts.join(" · ");
  }, [yieldsUpdated, ratesUpdated]);

  const handleRiskFilterChange = useCallback((next: RiskTableFilter) => {
    setRiskFilter(next);
  }, []);

  const cetesBenchmark = useCetes();
  const benchmarks = useMemo(
    () => [cetesBenchmark, LETRAS_BENCHMARK],
    [cetesBenchmark],
  );
  const activePools = useMemo(
    () => pools.filter((pool) => pool.riskLevel !== "high").length,
    [pools],
  );

  return (
    <main className="min-h-screen bg-hero pb-20 sm:pb-24">
      <section className="px-4 pb-6 pt-8 sm:pt-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-ink-primary/15 bg-white/80 p-6 shadow-card backdrop-blur-sm sm:p-8">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-ink-primary/15 bg-brand-yellow-soft px-3 py-1 text-xs font-semibold tracking-wide text-ink-primary">
                Comparador en vivo
              </p>
              <div className="space-y-2">
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-primary sm:text-4xl">
                  Redito
                </h1>
                <p className="max-w-3xl text-pretty text-base font-medium text-ink-secondary sm:text-lg">
                  Compara rendimientos en stablecoins (DeFiLlama) frente a CETES
                  y Letras del Tesoro. Ajusta moneda y capital para estimar la
                  ganancia anual en cada opción.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-ink-primary/10 bg-surface-tertiary px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">
                  Pools totales
                </p>
                <p className="text-xl font-extrabold tabular-nums text-ink-primary">
                  {pools.length}
                </p>
              </div>
              <div className="rounded-xl border border-ink-primary/10 bg-surface-tertiary px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">
                  Bajo + medio riesgo
                </p>
                <p className="text-xl font-extrabold tabular-nums text-ink-primary">
                  {activePools}
                </p>
              </div>
              <div className="rounded-xl border border-ink-primary/10 bg-surface-tertiary px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">
                  Referencias soberanas
                </p>
                <p className="text-xl font-extrabold tabular-nums text-ink-primary">
                  {benchmarks.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-ink-primary/10 bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-ink-secondary">
                  Moneda de visualización
                </p>
                <CurrencySelector value={currency} onChange={setCurrency} />
              </div>
              <Calculator
                currency={currency}
                capital={capital}
                onCapitalChange={setCapital}
                className="sm:max-w-md"
              />
            </div>

            <p className="mt-4 text-xs text-ink-tertiary" aria-live="polite">
              {statusParts || "Cargando datos…"}
              {(yieldsStale || ratesStale) && (
                <span className="ml-2 rounded-md bg-amber-100 px-1.5 py-0.5 text-amber-900">
                  Datos con retraso (cache)
                </span>
              )}
            </p>

            {(yieldsError || ratesError) && (
              <div
                role="alert"
                className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {yieldsError && <p>{yieldsError}</p>}
                {ratesError && <p>{ratesError}</p>}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:space-y-10">
        <YieldTable
          pools={pools}
          benchmarks={benchmarks}
          currency={currency}
          rates={effectiveRates}
          capital={capital}
          riskFilter={riskFilter}
          onRiskFilterChange={handleRiskFilterChange}
          loading={tableLoading}
        />

        <AlertCTA />

        <footer
          className={cn(
            "rounded-2xl border border-ink-primary/10 bg-surface-tertiary p-6 text-sm text-ink-secondary shadow-none ring-0",
          )}
        >
          <p className="font-extrabold text-ink-primary">Aviso legal</p>
          <p className="mt-2 text-pretty text-ink-secondary">
            Redito es una herramienta informativa. Los rendimientos DeFi son
            estimaciones y pueden cambiar; implican riesgo de contrato, de
            mercado y de contraparte, distinto al de deuda soberana. No somos
            asesores financieros: verifica en las fuentes oficiales (Banxico,
            Tesoro, protocolos) antes de invertir.
          </p>
        </footer>
      </div>

      <FeedbackWidget />
    </main>
  );
}
