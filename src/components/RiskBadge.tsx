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
  /** Texto explicativo del modelo de riesgo (tooltip). */
  riskText: string;
  className?: string;
}

export function RiskBadge({ level, riskText, className }: RiskBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn("inline-flex max-w-full cursor-help touch-manipulation", className)}
      >
        <Badge
          variant="outline"
          className={cn(
            "pointer-events-none max-w-full truncate font-medium",
            LEVEL_CLASS[level],
          )}
        >
          {LEVEL_LABEL[level]}
        </Badge>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[min(100vw-2rem,20rem)] text-balance leading-snug"
      >
        {riskText}
      </TooltipContent>
    </Tooltip>
  );
}
