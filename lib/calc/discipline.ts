import Decimal from "decimal.js";
import { MANAGEMENT_KEYS, PRE_TRADE_KEYS, type ChecklistValue } from "@/lib/checklist/keys";
import type { DecimalInput } from "./money";

export const DISCIPLINE_WEIGHTS = {
  preTrade: 0.4,
  management: 0.3,
  risk: 0.3,
} as const;

/**
 * Multiplicador do limite de risco no qual a componente de risco (R) chega a
 * zero. Com o valor padrão (2), R decai linearmente de 1 (no limite) a 0 (no
 * dobro do limite) — mesmo comportamento do S3.1, só que tunável sem tocar na
 * fórmula (aprovado na Fase 0).
 */
export const RISK_ZERO_MULTIPLIER = 2;

export type DisciplineWeights = typeof DISCIPLINE_WEIGHTS;

export type DisciplineScoreInput = {
  checklist: ChecklistValue;
  riskPct: DecimalInput;
  riskLimitPct: DecimalInput;
  weights?: DisciplineWeights;
};

function completionRatio(checklist: ChecklistValue, keys: readonly string[]): Decimal {
  if (keys.length === 0) return new Decimal(0);
  const completed = keys.filter((key) => checklist[key] === true).length;
  return new Decimal(completed).dividedBy(keys.length);
}

function riskComponent(riskPct: DecimalInput, riskLimitPct: DecimalInput): Decimal {
  const risk = new Decimal(riskPct);
  const limit = new Decimal(riskLimitPct);

  if (limit.lessThanOrEqualTo(0)) {
    return risk.lessThanOrEqualTo(0) ? new Decimal(1) : new Decimal(0);
  }
  if (risk.lessThanOrEqualTo(limit)) {
    return new Decimal(1);
  }

  const zeroSpan = limit.times(RISK_ZERO_MULTIPLIER - 1);
  const raw = new Decimal(1).minus(risk.minus(limit).dividedBy(zeroSpan));
  return Decimal.max(0, Decimal.min(1, raw));
}

/**
 * Score de disciplina (0-100): mede aderência ao método (checklist) e ao
 * limite de risco — não o resultado do trade. Um `loss` bem gerido pontua
 * alto; isso é intencional (S3.1).
 */
export function disciplineScore({
  checklist,
  riskPct,
  riskLimitPct,
  weights = DISCIPLINE_WEIGHTS,
}: DisciplineScoreInput): number {
  const cPre = completionRatio(checklist, PRE_TRADE_KEYS);
  const cGes = completionRatio(checklist, MANAGEMENT_KEYS);
  const r = riskComponent(riskPct, riskLimitPct);

  const score = new Decimal(weights.preTrade)
    .times(cPre)
    .plus(new Decimal(weights.management).times(cGes))
    .plus(new Decimal(weights.risk).times(r))
    .times(100);

  return score.toDecimalPlaces(2).toNumber();
}
