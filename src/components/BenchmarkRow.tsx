import type { BenchmarkProduct, Currency, ExchangeRates } from "@/types";
import { calculateReturn, formatCurrency } from "@/lib/calculator";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BenchmarkRowProps {
  benchmark: BenchmarkProduct;
  currency: Currency;
  rates: ExchangeRates;
  capital: number;
}

export function BenchmarkRow({
  benchmark,
  currency,
  rates,
  capital,
}: BenchmarkRowProps) {
  const result = calculateReturn(
    capital,
    currency,
    benchmark.apyAnnual,
    rates,
  );

  const countryLabel = benchmark.country === "MX" ? "México" : "España";

  return (
    <TableRow className="bg-brand-blue-soft/40 hover:bg-brand-blue-soft/60">
      <TableCell className="font-medium text-ink-primary">
        <div className="flex flex-col gap-0.5">
          <span>{benchmark.name}</span>
          <span className="text-xs font-normal text-ink-secondary">
            {benchmark.source} · {countryLabel}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-ink-secondary max-sm:hidden">
        Referencia soberana
      </TableCell>
      <TableCell className="tabular-nums">
        {benchmark.apyAnnual.toLocaleString("es-MX", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        })}
        %
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            "border-brand-blue/40 bg-brand-blue-soft font-medium text-ink-primary",
          )}
        >
          Referencia
        </Badge>
      </TableCell>
      <TableCell className="tabular-nums font-medium text-ink-primary">
        {formatCurrency(result.annual, currency)}
      </TableCell>
    </TableRow>
  );
}
