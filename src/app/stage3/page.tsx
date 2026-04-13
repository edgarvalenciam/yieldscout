"use client";

import { useState } from "react";
import type { Currency, ExchangeRates, Pool, RiskTableFilter } from "@/types";
import { BENCHMARKS } from "@/lib/constants";
import { AlertCTA } from "@/components/AlertCTA";
import { Calculator } from "@/components/Calculator";
import { CurrencySelector } from "@/components/CurrencySelector";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { RiskBadge } from "@/components/RiskBadge";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { YieldTable } from "@/components/YieldTable";

const MOCK_RATES: ExchangeRates = {
  USD_MXN: 20.5,
  USD_EUR: 0.92,
  lastUpdated: new Date(),
};

const MOCK_POOLS: Pool[] = [
  {
    id: "mock-1",
    protocol: "Aave",
    chain: "Ethereum",
    symbol: "USDC",
    tvlUsd: 120_000_000,
    apyBase: 3.2,
    apyReward: 0.4,
    apyTotal: 3.6,
    rewardTokens: ["AAVE"],
    isStablecoin: true,
    audits: 5,
    riskLevel: "low",
    riskScore: 22,
    riskText:
      "TVL alto, varias auditorías y mercado maduro. El riesgo principal es contrato y de mercado, no de custodia tradicional.",
    category: "Lending",
    url: "https://app.aave.com",
    defillamaUrl: "https://defillama.com/protocol/aave",
    lastUpdated: new Date(),
  },
  {
    id: "mock-2",
    protocol: "Curve",
    chain: "Arbitrum",
    symbol: "USDC-USDT",
    tvlUsd: 45_000_000,
    apyBase: 4.1,
    apyReward: 1.2,
    apyTotal: 5.3,
    rewardTokens: ["CRV"],
    isStablecoin: true,
    audits: 3,
    riskLevel: "medium",
    riskScore: 48,
    riskText:
      "Pool de liquidez estable con complejidad adicional (LP). Riesgo de smart contract y de peg.",
    category: "DEX",
    url: "https://curve.fi",
    defillamaUrl: "https://defillama.com/protocol/curve-dex",
    lastUpdated: new Date(),
  },
  {
    id: "mock-3",
    protocol: "Ejemplo Alto",
    chain: "Base",
    symbol: "USDbC",
    tvlUsd: 2_000_000,
    apyBase: 12,
    apyReward: 8,
    apyTotal: 20,
    rewardTokens: ["TOKEN"],
    isStablecoin: true,
    audits: 0,
    riskLevel: "high",
    riskScore: 82,
    riskText:
      "Rendimiento muy elevado vs mercado; menor TVL y sin auditorías listadas. Considera solo capital que puedas perder.",
    category: "Lending",
    url: "https://example.com",
    defillamaUrl: "https://defillama.com",
    lastUpdated: new Date(),
  },
];

export default function Stage3ShowcasePage() {
  const [currency, setCurrency] = useState<Currency>("MXN");
  const [capital, setCapital] = useState(100_000);
  const [riskFilter, setRiskFilter] = useState<RiskTableFilter>("all");
  const [showSkeleton, setShowSkeleton] = useState(false);

  return (
    <main className="min-h-screen bg-surface-secondary pb-24">
      <section className="bg-hero px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-3">
          <p className="font-display text-3xl font-bold text-ink-primary">
            Stage 3 — Componentes UI
          </p>
          <p className="text-ink-secondary">
            Vista de prueba con datos mock. La home final se arma en Stage 4.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8">
        <section className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg text-ink-primary">RiskBadge</h2>
          <div className="flex flex-wrap gap-3">
            <RiskBadge
              level="low"
              riskText="Ejemplo de tooltip para riesgo bajo."
            />
            <RiskBadge
              level="medium"
              riskText="Ejemplo de tooltip para riesgo medio."
            />
            <RiskBadge
              level="high"
              riskText="Ejemplo de tooltip para riesgo alto."
            />
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg text-ink-primary">
            Moneda y calculadora
          </h2>
          <CurrencySelector value={currency} onChange={setCurrency} />
          <Calculator
            currency={currency}
            capital={capital}
            onCapitalChange={setCapital}
          />
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg text-ink-primary">
              Tabla + filtros + panel
            </h2>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-secondary">
              <input
                type="checkbox"
                checked={showSkeleton}
                onChange={(e) => setShowSkeleton(e.target.checked)}
              />
              Ver skeleton
            </label>
          </div>
          {showSkeleton ? (
            <TableSkeleton rows={5} />
          ) : (
            <YieldTable
              pools={MOCK_POOLS}
              benchmarks={BENCHMARKS}
              currency={currency}
              rates={MOCK_RATES}
              capital={capital}
              riskFilter={riskFilter}
              onRiskFilterChange={setRiskFilter}
            />
          )}
        </section>

        <AlertCTA />

        <p className="text-center text-xs text-ink-tertiary">
          El widget de feedback aparece abajo a la derecha en esta página.
        </p>
      </div>

      <FeedbackWidget />
    </main>
  );
}
