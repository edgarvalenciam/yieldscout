import type { CalculatorResult, Currency, ExchangeRates } from "@/types";

export function calculateReturn(
  capitalInCurrency: number,
  currency: Currency,
  apyPercent: number,
  rates: ExchangeRates,
): CalculatorResult {
  let capitalUSD: number;
  switch (currency) {
    case "MXN":
      capitalUSD = capitalInCurrency / rates.USD_MXN;
      break;
    case "EUR":
      capitalUSD = capitalInCurrency / rates.USD_EUR;
      break;
    default:
      capitalUSD = capitalInCurrency;
  }

  const annualUSD = capitalUSD * (apyPercent / 100);

  let annual: number;
  switch (currency) {
    case "MXN":
      annual = annualUSD * rates.USD_MXN;
      break;
    case "EUR":
      annual = annualUSD * rates.USD_EUR;
      break;
    default:
      annual = annualUSD;
  }

  return {
    annual,
    monthly: annual / 12,
    daily: annual / 365,
    currency,
  };
}

export function formatCurrency(amount: number, currency: Currency): string {
  const locales: Record<Currency, string> = {
    MXN: "es-MX",
    EUR: "es-ES",
    USD: "en-US",
  };

  return new Intl.NumberFormat(locales[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
