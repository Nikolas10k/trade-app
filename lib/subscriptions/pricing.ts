import Decimal from "decimal.js";
import type { PlanKey } from "@/lib/payments/mercadopago";

/**
 * Preços cobrados pela Mercado Pago (configurados lá como preapproval plans —
 * ver MP_PREAPPROVAL_PLAN_* em lib/db/env.ts). Espelhados aqui só para exibir
 * o preço/MRR estimado no app; a Mercado Pago é a fonte de verdade do valor
 * realmente cobrado.
 */
export const PLAN_BILLING: Record<PlanKey, { price: Decimal; months: number; periodLabel: string }> = {
  mensal: { price: new Decimal("14.99"), months: 1, periodLabel: "mês" },
  trimestral: { price: new Decimal("39.00"), months: 3, periodLabel: "trimestre" },
  anual: { price: new Decimal("129.00"), months: 12, periodLabel: "ano" },
};

export const PLAN_ORDER: readonly PlanKey[] = ["mensal", "trimestral", "anual"];

export function monthlyEquivalent(plan: PlanKey): Decimal {
  const { price, months } = PLAN_BILLING[plan];
  return price.dividedBy(months);
}
