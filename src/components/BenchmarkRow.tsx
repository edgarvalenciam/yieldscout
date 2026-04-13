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

  return (
    <TableRow className="bg-[#FFF9E6] hover:bg-[#FFF9E6]">
      <TableCell className="font-medium text-ink-primary">
        <div className="flex flex-col gap-0.5">
          <span>{benchmark.name}</span>
          <span className="text-xs font-normal text-ink-secondary">
            {benchmark.source}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-ink-secondary max-sm:hidden">
        Referencia soberana
      </TableCell>
      <TableCell className="tabular-nums">
        <div className="flex flex-col items-start gap-1">
          <span>
            {benchmark.apyAnnual.toLocaleString("es-MX", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 2,
            })}
            %
          </span>
          {benchmark.apyFootnote ? (
            <span className="text-xs font-normal text-ink-secondary">
              {benchmark.apyFootnote}
            </span>
          ) : null}
          {benchmark.staleDataBadge ? (
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-50 font-normal text-amber-950"
            >
              {benchmark.staleDataBadge}
            </Badge>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            "border-0 bg-brand-yellow font-semibold text-ink-primary",
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
