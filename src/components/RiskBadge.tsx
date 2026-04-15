"use client";

import type { RiskLevel } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<RiskLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
};

const LEVEL_CLASS: Record<RiskLevel, string> = {
  low: "border-brand-green/40 bg-brand-green-soft text-ink-primary",
  medium:
    "border-brand-yellow/50 bg-brand-yellow-soft text-ink-primary dark:text-ink-primary",
  high:
    "border-[1.5px] border-ink-primary bg-transparent font-semibold text-ink-primary",
};

export interface RiskBadgeProps {
  level: RiskLevel;
  /** Resumen breve para el tooltip (tabla). En detalle usa `hideTooltip`. */
  riskSummary: string;
  /** Si true, solo muestra el badge (p. ej. cuando el detalle está en el panel). */
  hideTooltip?: boolean;
  className?: string;
}

export function RiskBadge({
  level,
  riskSummary,
  hideTooltip,
  className,
}: RiskBadgeProps) {
  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "pointer-events-none max-w-full truncate font-medium",
        LEVEL_CLASS[level],
      )}
    >
      {LEVEL_LABEL[level]}
    </Badge>
  );

  if (hideTooltip) {
    return <span className={cn("inline-flex max-w-full", className)}>{badge}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn(
          "inline-flex max-w-full cursor-help touch-manipulation",
          className,
        )}
      >
        {badge}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[min(100vw-2rem,18rem)] text-balance text-xs leading-snug"
      >
        {riskSummary}
      </TooltipContent>
    </Tooltip>
  );
}
