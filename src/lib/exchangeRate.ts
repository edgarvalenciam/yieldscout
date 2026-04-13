import type { ExchangeRates } from "@/types";

const FX_URL = "https://api.exchangerate-api.com/v4/latest/USD";

const FALLBACK_RATES: Omit<ExchangeRates, "lastUpdated"> = {
  USD_MXN: 17.5,
  USD_EUR: 0.92,
};

/** Tipos de cambio de respaldo cuando no hay cache ni API (mismos valores que en `fetchExchangeRates`). */
export function getFallbackExchangeRates(): ExchangeRates {
  return { ...FALLBACK_RATES, lastUpdated: new Date() };
}

/** `next.revalidate` solo aplica en servidor (Next extiende fetch). */
const serverFetchInit =
  typeof window === "undefined"
    ? ({ next: { revalidate: 3600 } } satisfies Parameters<typeof fetch>[1])
    : undefined;

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch(FX_URL, serverFetchInit);

    if (!response.ok) throw new Error("FX API error");

    const data = (await response.json()) as {
      rates?: { MXN?: number; EUR?: number };
    };

    return {
      USD_MXN: data.rates?.MXN ?? FALLBACK_RATES.USD_MXN,
      USD_EUR: data.rates?.EUR ?? FALLBACK_RATES.USD_EUR,
      lastUpdated: new Date(),
    };
  } catch {
    console.warn("FX API failed, using fallback rates");
    return {
      ...FALLBACK_RATES,
      lastUpdated: new Date(),
    };
  }
}
