"use client";

import { useMemo } from "react";
import type { Currency } from "@/types";
import { CAPITAL_PRESETS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";

export interface CalculatorProps {
  currency: Currency;
  capital: number;
  onCapitalChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

function currencyLocale(currency: Currency): string {
  return currency === "USD" ? "en-US" : currency === "EUR" ? "es-ES" : "es-MX";
}

function getSeparators(locale: string) {
  const parts = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  }).formatToParts(1234567.8);
  return {
    thousand: parts.find((p) => p.type === "group")?.value ?? ",",
    decimal: parts.find((p) => p.type === "decimal")?.value ?? ".",
  };
}

const inputClassName = cn(
  "h-11 w-full min-w-0 rounded-[8px] border-2 border-ink-primary bg-white px-3 py-2 text-lg font-bold text-ink-primary transition-colors outline-none placeholder:text-ink-tertiary focus-visible:border-ink-primary focus-visible:ring-2 focus-visible:ring-ink-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
);

export function Calculator({
  currency,
  capital,
  onCapitalChange,
  className,
  disabled,
}: CalculatorProps) {
  const presets = CAPITAL_PRESETS[currency];
  const locale = currencyLocale(currency);
  const { thousand: thousandSeparator, decimal: decimalSeparator } = useMemo(
    () => getSeparators(locale),
    [locale],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="ys-capital"
          className="text-sm font-medium text-ink-secondary"
        >
          Capital a comparar
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <NumericFormat
            id="ys-capital"
            data-slot="input"
            inputMode="numeric"
            autoComplete="off"
            disabled={disabled}
            thousandSeparator={thousandSeparator}
            decimalSeparator={decimalSeparator}
            decimalScale={0}
            allowNegative={false}
            value={capital === 0 ? "" : capital}
            onValueChange={(values) => {
              onCapitalChange(values.floatValue ?? 0);
            }}
            placeholder="Ej. 100000"
            className={cn(inputClassName, "max-w-xs")}
          />
          <span className="text-sm font-medium text-ink-secondary">
            Monto en {currency}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="w-full text-sm font-medium text-ink-secondary sm:w-auto sm:pr-2">
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
            className={cn(
              "border-[1.5px] border-ink-primary bg-transparent font-medium text-ink-primary shadow-none hover:bg-brand-yellow",
              capital === amount &&
                "bg-brand-yellow font-bold text-ink-primary hover:bg-brand-yellow",
            )}
          >
            {new Intl.NumberFormat(
              currency === "USD"
                ? "en-US"
                : currency === "EUR"
                  ? "es-ES"
                  : "es-MX",
              { maximumFractionDigits: 0 },
            ).format(amount)}
          </Button>
        ))}
      </div>
    </div>
  );
}
