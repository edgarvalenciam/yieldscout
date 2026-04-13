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
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm font-medium text-ink-primary">
        Filtrar por riesgo (DeFi)
      </p>
      <div
        className="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Filtro de riesgo"
      >
        {items.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={filter === item.id ? "secondary" : "outline"}
            disabled={disabled}
            className={cn(
              "gap-1.5",
              filter === item.id && "shadow-sm",
            )}
            onClick={() => onFilterChange(item.id)}
            role="tab"
            aria-selected={filter === item.id}
          >
            <span>{item.label}</span>
            <span
              className={cn(
                "rounded-md bg-background/80 px-1.5 py-0.5 text-xs tabular-nums",
                filter === item.id && "bg-background",
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
