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

      <div className="overflow-hidden rounded-xl border border-border bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col">Instrumento</TableHead>
              <TableHead scope="col" className="max-sm:hidden">
                Info
              </TableHead>
              <TableHead scope="col">APY</TableHead>
              <TableHead scope="col">Riesgo</TableHead>
              <TableHead scope="col" className="text-right sm:text-left">
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
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableCell
                colSpan={5}
                className="py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
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
                  No hay pools que coincidan con este filtro.
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
                    className="cursor-pointer"
                    tabIndex={0}
                    onClick={() => setSelected(pool)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(pool);
                      }
                    }}
                  >
                    <TableCell className="font-medium text-ink-primary">
                      <div className="flex flex-col gap-0.5">
                        <span>
                          {pool.protocol} · {pool.symbol}
                        </span>
                        <span className="text-xs font-normal text-ink-secondary sm:hidden">
                          {pool.chain}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-sm:hidden text-ink-secondary">
                      {pool.chain} · {pool.category}
                    </TableCell>
                    <TableCell className="tabular-nums font-medium">
                      {pool.apyTotal.toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <RiskBadge
                        level={pool.riskLevel}
                        riskText={pool.riskText}
                      />
                    </TableCell>
                    <TableCell className="tabular-nums font-medium text-ink-primary">
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
