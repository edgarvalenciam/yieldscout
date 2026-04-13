import type { Pool, RiskLevel } from "@/types";
import { PROTOCOL_METADATA } from "@/lib/constants";

/**
 * Campos relevantes del pool de yields.llama.fi para puntuar riesgo.
 * (La API no incluye auditorías por pool; usamos PROTOCOL_METADATA por protocolo.)
 */
export interface RawPoolInput {
  pool: string;
  project: string;
  chain: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number | null;
  apyReward: number | null;
  apy: number;
  rewardTokens: string[] | null;
  stablecoin: boolean;
  ilRisk?: string;
  exposure?: string;
}

export function auditCountForProject(project: string): number {
  const meta = PROTOCOL_METADATA[project];
  return meta?.auditFirms.length ?? 0;
}

function formatTvlShort(tvlUsd: number): string {
  if (tvlUsd >= 1e9) return `${(tvlUsd / 1e9).toFixed(1)}B`;
  if (tvlUsd >= 1e6) return `${(tvlUsd / 1e6).toFixed(1)}M`;
  if (tvlUsd >= 1e3) return `${(tvlUsd / 1e3).toFixed(0)}k`;
  return `${Math.round(tvlUsd)}`;
}

/**
 * Puntuación 1–10 (mayor = más riesgo). Niveles: low ≤3, medium 4–6, high ≥7.
 */
export function scorePool(
  raw: RawPoolInput,
): Pick<Pool, "riskLevel" | "riskScore" | "riskText"> {
  let score = 5;

  const tvl = raw.tvlUsd;
  if (tvl >= 100_000_000) score -= 2;
  else if (tvl >= 10_000_000) score -= 1;
  else if (tvl < 1_000_000) score += 1;
  if (tvl < 100_000) score += 1;

  const audits = auditCountForProject(raw.project);
  if (audits === 0) score += 2;
  else if (audits === 1) score += 1;

  const il =
    raw.ilRisk === "yes" ||
    (raw.exposure != null && raw.exposure.toLowerCase() === "multi");
  if (il) score += 2;

  const apy = raw.apy ?? 0;
  if (apy > 100) score += 3;
  else if (apy > 50) score += 2;
  else if (apy > 25) score += 1;

  const base = raw.apyBase ?? 0;
  const reward = raw.apyReward ?? 0;
  const totalParts = base + reward;
  if (totalParts > 0 && reward > 0 && reward / totalParts > 0.5) score += 1;

  score = Math.max(1, Math.min(10, score));

  let riskLevel: RiskLevel;
  if (score <= 3) riskLevel = "low";
  else if (score <= 6) riskLevel = "medium";
  else riskLevel = "high";

  const riskText = buildRiskTextSpanish({
    riskLevel,
    score,
    tvlUsd: tvl,
    audits,
    il,
    apy,
    symbol: raw.symbol,
    project: raw.project,
    exposure: raw.exposure,
  });

  return { riskLevel, riskScore: score, riskText };
}

function buildRiskTextSpanish(args: {
  riskLevel: RiskLevel;
  score: number;
  tvlUsd: number;
  audits: number;
  il: boolean;
  apy: number;
  symbol: string;
  project: string;
  exposure?: string;
}): string {
  const { riskLevel, score, tvlUsd, audits, il, apy, symbol, project, exposure } =
    args;
  const parts: string[] = [];

  parts.push(
    `Puntuación de riesgo ${score}/10 (${riskLevel === "low" ? "bajo" : riskLevel === "medium" ? "medio" : "alto"}).`,
  );

  parts.push(
    `TVL aproximado ${formatTvlShort(tvlUsd)} USD en liquidez bloqueada; más liquidez suele implicar menor riesgo de mercado relativo al tamaño del pool.`,
  );

  if (audits >= 2) {
    parts.push(
      "El protocolo figura con varias auditorías conocidas en nuestra referencia interna; sigue sin ser garantía absoluta.",
    );
  } else if (audits === 1) {
    parts.push(
      "Hay al menos una auditoría listada para el protocolo; conviene revisar el alcance y la antigüedad del informe.",
    );
  } else {
    parts.push(
      "No tenemos auditorías listadas para este protocolo en la referencia usada; el riesgo de contrato puede ser mayor.",
    );
  }

  if (il) {
    parts.push(
      "Estructura con riesgo de pérdida impermanente o exposición múltiple; no equivale a un depósito en moneda estable simple.",
    );
  } else if (exposure && exposure.toLowerCase() === "single") {
    parts.push(
      "Según DeFiLlama, la exposición es principalmente de un activo (single); el riesgo sigue siendo de contrato y de protocolo.",
    );
  } else {
    parts.push(
      "Revisa en DeFiLlama la estructura exacta del pool; el riesgo de contrato y de protocolo sigue siendo relevante.",
    );
  }

  if (apy > 40) {
    parts.push(
      `Rendimiento anualizado muy alto (~${apy.toFixed(1)}%): suele ir ligado a incentivos temporales o mayor riesgo; desconfía de APYs extremos.`,
    );
  } else if (apy > 15) {
    parts.push(
      `APY elevado (~${apy.toFixed(1)}%): revisa de dónde viene el rendimiento (interés base vs recompensas).`,
    );
  }

  parts.push(
    `Activo ${symbol} en ${project}. Esto no es asesoramiento financiero; puedes perder capital.`,
  );

  return parts.join(" ");
}
