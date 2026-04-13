"use client";

import { useState } from "react";
import type { Currency } from "@/types";
import { CACHE_KEYS } from "@/lib/constants";

function readStoredCurrency(): Currency {
  if (typeof window === "undefined") return "MXN";
  const saved = localStorage.getItem(CACHE_KEYS.CURRENCY);
  if (saved && ["MXN", "EUR", "USD"].includes(saved)) {
    return saved as Currency;
  }
  return "MXN";
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>(readStoredCurrency);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(CACHE_KEYS.CURRENCY, c);
  };

  return { currency, setCurrency };
}
