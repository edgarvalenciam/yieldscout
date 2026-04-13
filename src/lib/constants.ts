import type { BenchmarkProduct } from "@/types";

/** CETES: el APY y fechas vienen de Banxico vía `/api/cetes` + `useCetes`. */
export const CETES_BENCHMARK_BASE: Omit<
  BenchmarkProduct,
  "apyAnnual" | "source" | "lastUpdated"
> = {
  id: "cetes-28",
  name: "CETES 28 días",
  country: "MX",
  description:
    "Deuda del gobierno mexicano. El instrumento más seguro en México.",
};

// Actualizar Letras consultando tesoro.gob.es
export const LETRAS_BENCHMARK: BenchmarkProduct = {
  id: "letras-tesoro-12m",
  name: "Letras del Tesoro 12M",
  country: "ES",
  apyAnnual: 2.64,
  source: "Tesoro Público España · 7 abril 2026",
  description:
    "Deuda del gobierno español a 12 meses. Referencia de riesgo cero en España.",
  lastUpdated: "2026-04-07",
};

export const PROTOCOL_METADATA: Record<
  string,
  { auditFirms: string[]; url: string }
> = {
  "aave-v3": {
    auditFirms: ["OpenZeppelin", "Trail of Bits"],
    url: "https://app.aave.com",
  },
  "compound-v3": {
    auditFirms: ["OpenZeppelin", "Trail of Bits"],
    url: "https://compound.finance",
  },
  morpho: {
    auditFirms: ["Spearbit", "Trail of Bits"],
    url: "https://app.morpho.org",
  },
  "morpho-v1": {
    auditFirms: ["Spearbit", "Trail of Bits"],
    url: "https://app.morpho.org",
  },
  spark: {
    auditFirms: ["ChainSecurity"],
    url: "https://spark.fi",
  },
  sparklend: {
    auditFirms: ["ChainSecurity"],
    url: "https://spark.fi",
  },
  "spark-savings": {
    auditFirms: ["ChainSecurity"],
    url: "https://spark.fi",
  },
  euler: {
    auditFirms: ["Halborn", "Omniscia"],
    url: "https://app.euler.finance",
  },
  fluid: {
    auditFirms: ["Certora"],
    url: "https://fluid.instadapp.io",
  },
};

export const CACHE_KEYS = {
  YIELDS: "ys_yields_v2",
  FX: "ys_fx_v1",
  CURRENCY: "ys_currency",
  CAPITAL: "ys_capital",
  RISK_FILTER: "ys_risk_filter",
  EMAIL_SENT: "ys_email_sent",
  CETES: "ys_cetes_cache",
} as const;

export const CACHE_DURATION = {
  YIELDS: 30 * 60 * 1000,
  FX: 60 * 60 * 1000,
  /** CETES: subasta semanal; no hace falta refrescar más de una vez al día. */
  CETES: 24 * 60 * 60 * 1000,
} as const;

export const CAPITAL_PRESETS = {
  MXN: [10_000, 50_000, 100_000, 500_000],
  EUR: [1_000, 5_000, 20_000, 50_000],
  USD: [1_000, 5_000, 10_000, 50_000],
} as const;
