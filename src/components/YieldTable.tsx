"use client";

import { useMemo, useState } from "react";
import type {
  BenchmarkProduct,
  Currency,
  ExchangeRates,
  Pool,
  RiskTableFilter,
} from "@/types";
import { calculateReturn, formatCurrency } from "@/lib/calculator";
import { BenchmarkRow } from "@/components/BenchmarkRow";
import { FilterBar } from "@/components/FilterBar";
import { PoolDetailPanel } from "@/components/PoolDetailPanel";
import { RiskBadge } from "@/components/RiskBadge";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

function filterPools(pools: Pool[], filter: RiskTableFilter): Pool[] {
  switch (filter) {
    case "all":
      return pools;
    case "low":
      return pools.filter((p) => p.riskLevel === "low");
    case "low_and_medium":
      return pools.filter(
        (p) => p.riskLevel === "low" || p.riskLevel === "medium",
      );
    default:
      return pools;
  }
}

function riskCounts(pools: Pool[]) {
  const lowOnly = pools.filter((p) => p.riskLevel === "low").length;
  const lowAndMedium = pools.filter(
    (p) => p.riskLevel === "low" || p.riskLevel === "medium",
  ).length;
  return {
    all: pools.length,
    lowOnly,
    lowAndMedium,
  };
}

export interface YieldTableProps {
  pools: Pool[];
  benchmarks: BenchmarkProduct[];
  currency: Currency;
  rates: ExchangeRates;
  capital: number;
  riskFilter: RiskTableFilter;
  onRiskFilterChange: (next: RiskTableFilter) => void;
  loading?: boolean;
  className?: string;
}

export function YieldTable({
  pools,
  benchmarks,
  currency,
  rates,
  capital,
  riskFilter,
  onRiskFilterChange,
  loading,
  className,
}: YieldTableProps) {
  const [selected, setSelected] = useState<Pool | null>(null);

  const counts = useMemo(() => riskCounts(pools), [pools]);
  const filtered = useMemo(
    () => filterPools(pools, riskFilter),
    [pools, riskFilter],
  );

  if (loading) {
    return <TableSkeleton className={className} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <FilterBar
        filter={riskFilter}
        onFilterChange={onRiskFilterChange}
        counts={{
          all: counts.all,
          lowOnly: counts.lowOnly,
          lowAndMedium: counts.lowAndMedium,
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-ink-primary/10 bg-white shadow-card ring-0">
        <div className="border-b border-ink-primary/10 bg-surface-tertiary px-4 py-3 sm:px-5">
          <p className="text-sm font-semibold text-ink-primary">
            Rendimientos comparados
          </p>
          <p className="text-xs text-ink-secondary">
            Selecciona una fila para ver detalle del protocolo y desglose de APY.
          </p>
        </div>
        <Table className="text-sm">
          <TableHeader>
            <TableRow className="border-ink-primary/10 bg-ink-primary hover:bg-ink-primary">
              <TableHead
                scope="col"
                className="border-b border-ink-primary/10 bg-ink-primary py-3 font-semibold text-white"
              >
                Instrumento
              </TableHead>
              <TableHead
                scope="col"
                className="max-sm:hidden border-b border-ink-primary/10 bg-ink-primary py-3 font-semibold text-white"
              >
                Info
              </TableHead>
              <TableHead
                scope="col"
                className="border-b border-ink-primary/10 bg-ink-primary py-3 font-semibold text-white"
              >
                APY
              </TableHead>
              <TableHead
                scope="col"
                className="border-b border-ink-primary/10 bg-ink-primary py-3 font-semibold text-white"
              >
                Riesgo
              </TableHead>
              <TableHead
                scope="col"
                className="border-b border-ink-primary/10 bg-ink-primary py-3 text-right font-semibold text-white sm:text-left"
              >
                Ganancia/año
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {benchmarks.map((b) => (
              <BenchmarkRow
                key={b.id}
                benchmark={b}
                currency={currency}
                rates={rates}
                capital={capital}
              />
            ))}
            <TableRow className="bg-white hover:bg-white">
              <TableCell
                colSpan={5}
                className="py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-secondary"
              >
                Pools DeFi (estables)
              </TableCell>
            </TableRow>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No hay pools que coincidan con este filtro. Cambia el nivel de
                  riesgo para ampliar resultados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((pool) => {
                const est = calculateReturn(
                  capital,
                  currency,
                  pool.apyTotal,
                  rates,
                );
                return (
                  <TableRow
                    key={pool.id}
                    className="cursor-pointer border-ink-primary/10 transition-colors hover:bg-brand-yellow-soft/35"
                    tabIndex={0}
                    onClick={() => setSelected(pool)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(pool);
                      }
                    }}
                  >
                    <TableCell className="py-3 font-medium text-ink-primary">
                      <div className="flex flex-col gap-0.5">
                        <span>
                          {pool.protocol} · {pool.symbol}
                        </span>
                        <span className="text-xs font-normal text-ink-secondary sm:hidden">
                          {pool.chain}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-sm:hidden py-3 text-ink-secondary">
                      {pool.chain} · {pool.category}
                    </TableCell>
                    <TableCell className="py-3 tabular-nums font-semibold">
                      {pool.apyTotal.toFixed(2)}%
                    </TableCell>
                    <TableCell className="py-3">
                      <RiskBadge
                        level={pool.riskLevel}
                        riskSummary={pool.riskSummary}
                      />
                    </TableCell>
                    <TableCell className="py-3 tabular-nums font-semibold text-ink-primary">
                      {formatCurrency(est.annual, currency)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PoolDetailPanel
        pool={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        currency={currency}
        rates={rates}
        capital={capital}
      />
    </div>
  );
}
