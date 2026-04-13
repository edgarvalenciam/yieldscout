"use client";

import type { Currency } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Currency; label: string }[] = [
  { value: "MXN", label: "MXN" },
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
];

export interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  className?: string;
  disabled?: boolean;
}

export function CurrencySelector({
  value,
  onChange,
  className,
  disabled,
}: CurrencySelectorProps) {
  return (
    <div
      className={cn("inline-flex flex-wrap gap-1", className)}
      role="group"
      aria-label="Moneda de visualización"
    >
      {OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          size="sm"
          variant="outline"
          className={cn(
            "min-w-[3.25rem] border-[1.5px] border-ink-primary px-3 shadow-none",
            value === opt.value
              ? "bg-brand-yellow font-bold text-ink-primary hover:bg-brand-yellow"
              : "bg-transparent font-medium text-ink-primary hover:bg-brand-yellow",
          )}
          disabled={disabled}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
