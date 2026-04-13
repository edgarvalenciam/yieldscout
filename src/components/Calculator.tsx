"use client";

import type { Currency } from "@/types";
import { CAPITAL_PRESETS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalculatorProps {
  currency: Currency;
  capital: number;
  onCapitalChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

function parseCapital(raw: string): number {
  const n = Number(raw.replace(/\s/g, "").replace(",", ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function Calculator({
  currency,
  capital,
  onCapitalChange,
  className,
  disabled,
}: CalculatorProps) {
  const presets = CAPITAL_PRESETS[currency];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="ys-capital"
          className="text-sm font-medium text-ink-primary"
        >
          Capital a comparar
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id="ys-capital"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            disabled={disabled}
            value={capital === 0 ? "" : String(capital)}
            onChange={(e) => onCapitalChange(parseCapital(e.target.value))}
            placeholder="Ej. 100000"
            className="max-w-xs"
          />
          <span className="text-sm text-muted-foreground">
            Monto en {currency}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="w-full text-xs font-medium uppercase tracking-wide text-ink-tertiary sm:w-auto sm:pr-2">
          Atajos
        </span>
        {presets.map((amount) => (
          <Button
            key={amount}
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onCapitalChange(amount)}
          >
            {new Intl.NumberFormat(
              currency === "USD" ? "en-US" : currency === "EUR" ? "es-ES" : "es-MX",
              { maximumFractionDigits: 0 },
            ).format(amount)}
          </Button>
        ))}
      </div>
    </div>
  );
}
