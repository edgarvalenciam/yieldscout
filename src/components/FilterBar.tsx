"use client";

import type { RiskTableFilter } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterBarProps {
  filter: RiskTableFilter;
  onFilterChange: (next: RiskTableFilter) => void;
  /** Conteos sobre el conjunto completo de pools (sin filtrar). */
  counts: {
    all: number;
    lowOnly: number;
    lowAndMedium: number;
  };
  className?: string;
  disabled?: boolean;
}

export function FilterBar({
  filter,
  onFilterChange,
  counts,
  className,
  disabled,
}: FilterBarProps) {
  const items: {
    id: RiskTableFilter;
    label: string;
    count: number;
  }[] = [
    { id: "all", label: "Todos", count: counts.all },
    { id: "low", label: "Solo bajo", count: counts.lowOnly },
    {
      id: "low_and_medium",
      label: "Bajo + medio",
      count: counts.lowAndMedium,
    },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-ink-primary/10 bg-white px-3 py-3 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:px-4",
        className,
      )}
    >
      <p className="text-sm font-semibold text-ink-secondary">
        Filtrar por riesgo (DeFi)
      </p>
      <div
        className="mt-2 flex flex-wrap gap-1.5 sm:mt-0"
        role="tablist"
        aria-label="Filtro de riesgo"
      >
        {items.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-8 gap-1.5 rounded-lg border border-ink-primary/25 px-2.5 shadow-none",
              filter === item.id
                ? "bg-brand-yellow font-bold text-ink-primary hover:bg-brand-yellow"
                : "bg-white font-medium text-ink-primary hover:bg-brand-yellow-soft",
            )}
            onClick={() => onFilterChange(item.id)}
            role="tab"
            aria-selected={filter === item.id}
          >
            <span>{item.label}</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs tabular-nums",
                filter === item.id
                  ? "bg-ink-primary/10 text-ink-primary"
                  : "bg-ink-primary/5 text-ink-primary",
              )}
            >
              {item.count}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
