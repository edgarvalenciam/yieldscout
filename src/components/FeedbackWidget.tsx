"use client";

import { useState } from "react";
import type { FeedbackData } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FeedbackWidgetProps {
  className?: string;
}

export function FeedbackWidget({ className }: FeedbackWidgetProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [understood, setUnderstood] = useState<FeedbackData["understoodRisk"]>(
    "somewhat",
  );
  const [changed, setChanged] = useState<FeedbackData["changedMind"]>("no");
  const [improvement, setImprovement] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const payload: FeedbackData = {
      understoodRisk: understood,
      changedMind: changed,
      improvement: improvement.trim(),
      timestamp: new Date().toISOString(),
    };
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("ok");
      setImprovement("");
    } catch {
      setStatus("error");
    }
  }

  if (!open) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)]", className)}>
        <Button type="button" size="sm" onClick={() => setOpen(true)}>
          Feedback
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-40 w-full max-w-md max-h-[85vh] overflow-y-auto",
        className,
      )}
    >
      <Card className="shadow-modal">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="font-display text-lg">
                Tu opinión
              </CardTitle>
              <CardDescription>
                Tres preguntas rápidas. Nos ayuda a mejorar Redito.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {status === "ok" ? (
            <p className="text-sm text-ink-secondary">
              Gracias. Hemos recibido tu feedback.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-ink-primary">
                  ¿Entiendes el riesgo de usar protocolos DeFi frente a CETES /
                  Letras?
                </legend>
                <div className="flex flex-col gap-2 text-sm">
                  {(
                    [
                      ["yes", "Sí"],
                      ["somewhat", "Más o menos"],
                      ["no", "No"],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 has-[:checked]:border-primary has-[:checked]:bg-muted/50"
                    >
                      <input
                        type="radio"
                        name="understood"
                        className="size-4 accent-primary"
                        checked={understood === value}
                        onChange={() => setUnderstood(value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-ink-primary">
                  ¿Te hizo cambiar de opinión ver CETES/Letras junto a DeFi?
                </legend>
                <div className="flex gap-2">
                  {(
                    [
                      ["yes", "Sí"],
                      ["no", "No"],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 has-[:checked]:border-primary has-[:checked]:bg-muted/50"
                    >
                      <input
                        type="radio"
                        name="changed"
                        className="size-4 accent-primary"
                        checked={changed === value}
                        onChange={() => setChanged(value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-1.5">
                <label
                  htmlFor="ys-feedback-improve"
                  className="text-sm font-medium text-ink-primary"
                >
                  ¿Qué mejorarías? (opcional)
                </label>
                <textarea
                  id="ys-feedback-improve"
                  value={improvement}
                  onChange={(e) => setImprovement(e.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Ej. más protocolos, mejor explicación del riesgo…"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-destructive" role="alert">
                  No se pudo enviar. Intenta de nuevo.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Enviando…" : "Enviar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
