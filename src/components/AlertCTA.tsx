"use client";

import { useState, useSyncExternalStore } from "react";
import { CACHE_KEYS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STORAGE_KEY = CACHE_KEYS.EMAIL_SENT;

function readFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const ALERT_SENT_EVENT = "ys-alert-email-sent";

function writeFlag() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
    window.dispatchEvent(new Event(ALERT_SENT_EVENT));
  } catch {
    /* ignore */
  }
}

function subscribeEmailFlag(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(ALERT_SENT_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(ALERT_SENT_EVENT, handler);
  };
}

export interface AlertCTAProps {
  className?: string;
}

export function AlertCTA({ className }: AlertCTAProps) {
  const submitted = useSyncExternalStore(
    subscribeEmailFlag,
    readFlag,
    () => false,
  );
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    writeFlag();
    setBusy(false);
  }

  if (submitted) {
    return (
      <Card
        className={cn(
          "border-brand-purple/20 bg-gradient-to-br from-brand-purple-soft/80 to-brand-blue-soft/50",
          className,
        )}
      >
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Estás en la lista
          </CardTitle>
          <CardDescription>
            Te avisaremos cuando haya novedades en Redito. Puedes cerrar
            esta página con tranquilidad.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-brand-purple/25 bg-gradient-to-br from-brand-purple-soft/90 to-brand-blue-soft/40",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="font-display text-lg">
          Alertas de nuevos rendimientos
        </CardTitle>
        <CardDescription>
          Déjanos tu correo si quieres que te avisemos cuando añadamos
          protocolos o mejoras. Sin spam.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="ys-alert-email" className="sr-only">
              Correo electrónico
            </label>
            <Input
              id="ys-alert-email"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              required
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy}>
            Quiero alertas
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
