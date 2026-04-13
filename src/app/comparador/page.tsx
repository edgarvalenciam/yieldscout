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

  return (
    <main className="min-h-screen bg-surface-secondary pb-28">
      <section className="bg-hero px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink-primary sm:text-4xl">
              YieldScout
            </h1>
            <p className="max-w-2xl text-pretty text-base text-ink-secondary sm:text-lg">
              Compara rendimientos en stablecoins (DeFiLlama) frente a CETES y
              Letras del Tesoro. Cambia moneda y capital para ver cuánto podrías
              ganar al año en cada escenario.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
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

          <p
            className="text-xs text-ink-tertiary"
            aria-live="polite"
          >
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
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {yieldsError && <p>{yieldsError}</p>}
              {ratesError && <p>{ratesError}</p>}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
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
            "rounded-2xl border border-border bg-card p-6 text-sm text-ink-secondary shadow-card",
          )}
        >
          <p className="font-medium text-ink-primary">Aviso legal</p>
          <p className="mt-2 text-pretty">
            YieldScout es una herramienta informativa. Los rendimientos DeFi son
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
