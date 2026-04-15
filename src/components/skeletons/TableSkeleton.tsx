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
        "overflow-hidden rounded-2xl border border-ink-primary/10 bg-white shadow-card ring-0",
        className,
      )}
      aria-hidden
    >
      <div className="border-b border-ink-primary/10 bg-surface-tertiary px-4 py-3 sm:px-5">
        <div className="h-3 w-32 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 h-3 w-64 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="divide-y divide-ink-primary/10">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5"
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
