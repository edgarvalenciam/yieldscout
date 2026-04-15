"use client";

import type { Currency, ExchangeRates, Pool } from "@/types";
import { calculateReturn, formatCurrency } from "@/lib/calculator";
import { RiskBadge } from "@/components/RiskBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";

function linkButtonProps(href: string) {
  return {
    href,
    target: "_blank" as const,
    rel: "noopener noreferrer",
  };
}

export interface PoolDetailPanelProps {
  pool: Pool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: Currency;
  rates: ExchangeRates;
  capital: number;
}

function formatUsdCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value);
}

export function PoolDetailPanel({
  pool,
  open,
  onOpenChange,
  currency,
  rates,
  capital,
}: PoolDetailPanelProps) {
  if (!pool) return null;

  const est = calculateReturn(capital, currency, pool.apyTotal, rates);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,880px)] w-[min(100%,calc(100vw-1.25rem))] max-w-3xl flex-col gap-0 overflow-hidden border border-ink-primary/10 bg-white p-0 sm:max-w-2xl lg:max-w-3xl">
        <div className="shrink-0 border-b border-ink-primary/10 px-5 pb-3 pt-5 pr-12 sm:px-6 sm:pt-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg sm:text-xl">
              {pool.protocol} · {pool.symbol}
            </DialogTitle>
            <DialogDescription>
              {pool.chain} · {pool.category}
              {pool.isStablecoin ? " · Estable" : ""}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          <div className="grid gap-4 text-sm">
            <section className="rounded-xl border border-ink-primary/10 bg-surface-tertiary p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              APY
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <dt className="text-muted-foreground">Base</dt>
                <dd className="tabular-nums font-medium">
                  {pool.apyBase.toFixed(2)}%
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Recompensas</dt>
                <dd className="tabular-nums font-medium">
                  {pool.apyReward.toFixed(2)}%
                </dd>
              </div>
              <div className="col-span-2 border-t border-ink-primary/10 pt-2">
                <dt className="text-muted-foreground">Total anual</dt>
                <dd className="text-lg font-semibold tabular-nums text-ink-primary">
                  {pool.apyTotal.toFixed(2)}%
                </dd>
              </div>
            </dl>
            </section>

            <section className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                TVL
              </p>
              <p className="text-base font-semibold tabular-nums">
                {formatUsdCompact(pool.tvlUsd)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground">Riesgo</span>
              <RiskBadge
                level={pool.riskLevel}
                riskSummary={pool.riskSummary}
                hideTooltip
              />
            </div>
            </section>

            <section className="rounded-xl border border-ink-primary/10 bg-surface-tertiary p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Análisis de riesgo
            </h3>
            <dl className="space-y-3 text-sm">
              {pool.riskDetailSections.map((block) => (
                <div key={block.label}>
                  <dt className="font-semibold text-ink-primary">{block.label}</dt>
                  <dd className="mt-1 text-pretty text-ink-secondary leading-relaxed">
                    {block.text}
                  </dd>
                </div>
              ))}
            </dl>
            </section>

            <section>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Ganancia anual estimada
            </p>
            <p className="mt-1 text-lg font-semibold text-ink-primary">
              {formatCurrency(est.annual, currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              Con capital de {formatCurrency(capital, currency)} al APY total
              mostrado.
            </p>
            </section>

            {pool.rewardTokens.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Tokens de recompensa: {pool.rewardTokens.join(", ")}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-ink-primary/10 bg-surface-tertiary px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              variant="default"
              nativeButton={false}
              className="gap-2 bg-ink-primary text-white hover:bg-ink-primary/90"
              render={<a {...linkButtonProps(pool.url)} />}
            >
              Abrir en el protocolo
              <ExternalLinkIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              className="gap-2 border-ink-primary/20 bg-white text-ink-primary hover:bg-surface-tertiary"
              render={<a {...linkButtonProps(pool.defillamaUrl)} />}
            >
              Ver en DeFiLlama
              <ExternalLinkIcon className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
