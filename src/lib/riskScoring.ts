import type { Pool, RiskDetailSection, RiskLevel } from "@/types";
import { PROTOCOL_METADATA } from "@/lib/constants";

/** Protocolos auditados y maduros: mínimo 2 auditorías efectivas para el scoring. */
/** Slugs alineados con yields.llama.fi (p. ej. morpho-v1, sparklend, no solo "morpho"). */
export const AUDITED_PROTOCOL_WHITELIST = new Set([
  "aave-v3",
  "compound-v3",
  "morpho",
  "morpho-v1",
  "spark",
  "sparklend",
  "spark-savings",
]);

const MIN_TVL_MATURE_LOW_USD = 500_000_000;

/**
 * Campos relevantes del pool de yields.llama.fi para puntuar riesgo.
 * `audits` puede venir como número o string desde DeFiLlama; se combina con PROTOCOL_METADATA.
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
  audits?: unknown;
}

export function parseAuditsField(raw: unknown): number {
  if (raw == null || raw === "") return 0;
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
  }
  const s = String(raw).trim();
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function effectiveAuditCount(project: string, apiAuditsRaw: unknown): number {
  const fromApi = parseAuditsField(apiAuditsRaw);
  const fromMeta = PROTOCOL_METADATA[project]?.auditFirms.length ?? 0;
  let n = Math.max(fromApi, fromMeta);
  if (AUDITED_PROTOCOL_WHITELIST.has(project)) {
    n = Math.max(n, 2);
  }
  return n;
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
): Pick<
  Pool,
  "riskLevel" | "riskScore" | "riskSummary" | "riskDetailSections"
> {
  let score = 5;

  const tvl = raw.tvlUsd;
  if (tvl >= 100_000_000) score -= 2;
  else if (tvl >= 10_000_000) score -= 1;
  else if (tvl < 1_000_000) score += 1;
  if (tvl < 100_000) score += 1;

  const audits = effectiveAuditCount(raw.project, raw.audits);
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

  if (
    AUDITED_PROTOCOL_WHITELIST.has(raw.project) &&
    raw.tvlUsd >= MIN_TVL_MATURE_LOW_USD
  ) {
    score = Math.min(score, 3);
  }

  score = Math.max(1, Math.min(10, score));

  let riskLevel: RiskLevel;
  if (score <= 3) riskLevel = "low";
  else if (score <= 6) riskLevel = "medium";
  else riskLevel = "high";

  const riskSummary = buildRiskSummarySpanish({
    riskLevel,
    score,
    tvlUsd: tvl,
    audits,
    il,
    apy,
  });

  const riskDetailSections = buildRiskDetailSectionsSpanish({
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

  return { riskLevel, riskScore: score, riskSummary, riskDetailSections };
}

function levelLabelEs(level: RiskLevel): string {
  if (level === "low") return "bajo";
  if (level === "medium") return "medio";
  return "alto";
}

/** Tooltip en tabla: una frase clara, sin repetir todo el análisis. */
function buildRiskSummarySpanish(args: {
  riskLevel: RiskLevel;
  score: number;
  tvlUsd: number;
  audits: number;
  il: boolean;
  apy: number;
}): string {
  const { riskLevel, score, tvlUsd, audits, il, apy } = args;
  const nivel = levelLabelEs(riskLevel);
  const tvlStr = `${formatTvlShort(tvlUsd)} USD`;
  const bits: string[] = [`${score}/10 (${nivel})`];

  if (tvlUsd < 1_000_000) bits.push(`TVL ~${tvlStr}`);
  if (audits === 0) bits.push("sin auditorías listadas");
  else if (audits === 1) bits.push("1 auditoría listada");
  if (il) bits.push("pool multi / IL posible");
  if (apy > 40) bits.push("APY muy alto");

  return `Riesgo ${nivel}: ${bits.join(" · ")}. Abre la fila para ver el desglose.`;
}

/** Panel de detalle: mismos criterios que antes, en bloques legibles. */
function buildRiskDetailSectionsSpanish(args: {
  riskLevel: RiskLevel;
  score: number;
  tvlUsd: number;
  audits: number;
  il: boolean;
  apy: number;
  symbol: string;
  project: string;
  exposure?: string;
}): RiskDetailSection[] {
  const {
    riskLevel,
    score,
    tvlUsd,
    audits,
    il,
    apy,
    symbol,
    project,
    exposure,
  } = args;

  const sections: RiskDetailSection[] = [];

  sections.push({
    label: "Puntuación",
    text: `${score}/10 — nivel ${levelLabelEs(riskLevel)}. Es una estimación interna (TVL, auditorías, estructura y APY), no una calificación oficial.`,
  });

  sections.push({
    label: "Liquidez (TVL)",
    text: `Aproximadamente ${formatTvlShort(tvlUsd)} USD bloqueados. Más liquidez suele reducir el riesgo de mercado relativo al tamaño del pool; montos muy bajos pueden implicar mayor volatilidad o dependencia de pocos participantes.`,
  });

  if (audits >= 2) {
    sections.push({
      label: "Auditorías",
      text: "El protocolo consta con varias auditorías en nuestra referencia. Eso no elimina el riesgo de contrato ni sustituye tu propia revisión.",
    });
  } else if (audits === 1) {
    sections.push({
      label: "Auditorías",
      text: "Hay al menos una auditoría listada; conviene revisar alcance, fecha y hallazgos del informe.",
    });
  } else {
    sections.push({
      label: "Auditorías",
      text: "No tenemos auditorías listadas para este protocolo en la fuente usada; el riesgo de smart contract puede ser mayor.",
    });
  }

  if (il) {
    sections.push({
      label: "Estructura del pool",
      text: "Exposición múltiple o riesgo de pérdida impermanente (IL): no equivale a un depósito simple en un solo estable.",
    });
  } else if (exposure && exposure.toLowerCase() === "single") {
    sections.push({
      label: "Estructura del pool",
      text: "Según DeFiLlama, exposición principalmente a un activo (single). Persiste riesgo de contrato y de protocolo.",
    });
  } else {
    sections.push({
      label: "Estructura del pool",
      text: "Revisa en DeFiLlama la composición exacta; el riesgo de contrato y de integración sigue siendo relevante.",
    });
  }

  if (apy > 40) {
    sections.push({
      label: "Rendimiento (APY)",
      text: `APY total ~${apy.toFixed(1)}%: valores muy altos suelen incluir incentivos temporales o asumir más riesgo; trata los APY extremos con escepticismo.`,
    });
  } else if (apy > 15) {
    sections.push({
      label: "Rendimiento (APY)",
      text: `APY ~${apy.toFixed(1)}%: comprueba cuánto viene de interés base y cuánto de recompensas de token.`,
    });
  } else {
    sections.push({
      label: "Rendimiento (APY)",
      text: `APY total ~${apy.toFixed(1)}%. El rendimiento pasado o mostrado no garantiza resultados futuros.`,
    });
  }

  sections.push({
    label: "Contexto",
    text: `Activo ${symbol} en ${project}.`,
  });

  sections.push({
    label: "Aviso",
    text: "Esto no es asesoramiento financiero. Puedes perder capital.",
  });

  return sections;
}
