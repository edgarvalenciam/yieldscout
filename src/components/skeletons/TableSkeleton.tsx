import { cn } from "@/lib/utils";

export interface TableSkeletonProps {
  /** Filas de datos (sin contar cabecera). */
  rows?: number;
  className?: string;
}

export function TableSkeleton({ rows = 8, className }: TableSkeletonProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card ring-1 ring-foreground/10",
        className,
      )}
      aria-hidden
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5 sm:px-4">
        <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
        <div className="ml-auto h-8 w-40 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center gap-3 px-3 py-3 sm:px-4"
          >
            <div className="h-4 min-w-[40%] flex-1 animate-pulse rounded-md bg-muted sm:min-w-[20%]" />
            <div className="h-4 w-16 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-14 animate-pulse rounded-md bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted max-sm:w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
