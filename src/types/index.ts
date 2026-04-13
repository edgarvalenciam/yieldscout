export type Currency = "MXN" | "EUR" | "USD";
export type RiskLevel = "low" | "medium" | "high";

/** Filtro de la tabla DeFi: todos, solo bajo, o bajo + medio. */
export type RiskTableFilter = "all" | "low" | "low_and_medium";

export interface Pool {
  id: string;
  protocol: string;
  chain: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number;
  apyReward: number;
  apyTotal: number;
  rewardTokens: string[];
  isStablecoin: boolean;
  audits: number;
  riskLevel: RiskLevel;
  riskScore: number;
  riskText: string;
  category: string;
  url: string;
  defillamaUrl: string;
  lastUpdated: Date;
}

export interface BenchmarkProduct {
  id: string;
  name: string;
  country: "MX" | "ES";
  apyAnnual: number;
  source: string;
  description: string;
  lastUpdated: string;
  /** Texto bajo el APY (p. ej. fuente Banxico y fecha del dato). */
  apyFootnote?: string;
  /** Si el fetch falló y se usó caché antiguo. */
  staleDataBadge?: string;
}

export interface ExchangeRates {
  USD_MXN: number;
  USD_EUR: number;
  lastUpdated: Date;
}

export interface CalculatorResult {
  annual: number;
  monthly: number;
  daily: number;
  currency: Currency;
}

export interface FeedbackData {
  understoodRisk: "yes" | "no" | "somewhat";
  changedMind: "yes" | "no";
  improvement: string;
  timestamp: string;
}
