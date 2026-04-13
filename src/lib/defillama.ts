import type { Pool } from "@/types";
import { PROTOCOL_METADATA } from "@/lib/constants";
import { auditCountForProject, scorePool } from "@/lib/riskScoring";

const YIELDS_URL = "https://yields.llama.fi/pools";

/** Cadenas EVM / mayor liquidez para el MVP (evita redes muy pequeñas). */
const ALLOWED_CHAINS = new Set([
  "Ethereum",
  "Arbitrum",
  "Base",
  "Optimism",
  "Polygon",
  "Avalanche",
  "Gnosis",
  "Scroll",
  "Linea",
  "zkSync Era",
  "BSC",
  "Polygon zkEVM",
  "Blast",
  "Fraxtal",
  "Arbitrum Nova",
]);

const MIN_TVL_USD = 50_000;
const MAX_APY = 200;

interface LlamaYieldPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number | null;
  apyReward: number | null;
  apy: number;
  rewardTokens: string[] | null;
  pool: string;
  stablecoin: boolean;
  outlier?: boolean;
  ilRisk?: string;
  exposure?: string;
}

async function fetchYieldsRows(): Promise<LlamaYieldPool[]> {
  const res = await fetch(YIELDS_URL, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`DeFiLlama yields: HTTP ${res.status}`);
  const body = (await res.json()) as { status?: string; data?: LlamaYieldPool[] };
  if (body.status !== "success" || !Array.isArray(body.data)) {
    throw new Error("DeFiLlama yields: respuesta inválida");
  }
  return body.data;
}

function passesFilters(p: LlamaYieldPool): boolean {
  if (!p.stablecoin) return false;
  if (!ALLOWED_CHAINS.has(p.chain)) return false;
  if (p.tvlUsd < MIN_TVL_USD) return false;
  if (p.outlier === true) return false;
  const apy = p.apy ?? 0;
  if (apy <= 0 || apy > MAX_APY) return false;
  return true;
}

function toPool(p: LlamaYieldPool, lastUpdated: Date): Pool {
  const apyBase = p.apyBase ?? 0;
  const apyReward = p.apyReward ?? 0;
  const apyTotal = p.apy ?? 0;
  const rewardTokens = p.rewardTokens ?? [];

  const risk = scorePool({
    pool: p.pool,
    project: p.project,
    chain: p.chain,
    symbol: p.symbol,
    tvlUsd: p.tvlUsd,
    apyBase: p.apyBase,
    apyReward: p.apyReward,
    apy: apyTotal,
    rewardTokens: p.rewardTokens,
    stablecoin: p.stablecoin,
    ilRisk: p.ilRisk,
    exposure: p.exposure,
  });

  const meta = PROTOCOL_METADATA[p.project];
  const url =
    meta?.url ?? `https://defillama.com/protocol/${encodeURIComponent(p.project)}`;

  return {
    id: p.pool,
    protocol: p.project,
    chain: p.chain,
    symbol: p.symbol,
    tvlUsd: p.tvlUsd,
    apyBase,
    apyReward,
    apyTotal,
    rewardTokens,
    isStablecoin: p.stablecoin,
    audits: auditCountForProject(p.project),
    ...risk,
    category: p.exposure ?? "single",
    url,
    defillamaUrl: `https://defillama.com/yields/pool/${encodeURIComponent(p.pool)}`,
    lastUpdated,
  };
}

/**
 * Pools de stablecoin desde DeFiLlama, filtrados y ordenados por APY (top 50).
 * En servidor aplica `revalidate: 1800`; en cliente el fetch va al origen.
 */
export async function fetchPools(): Promise<Pool[]> {
  const rows = await fetchYieldsRows();
  const filtered = rows.filter(passesFilters);
  filtered.sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0));
  const top = filtered.slice(0, 50);
  const now = new Date();
  return top.map((p) => toPool(p, now));
}
