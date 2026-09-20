import Decimal from "decimal.js";
import type { PlanKey } from "@/lib/payments/mercadopago";
import { monthlyEquivalent } from "@/lib/subscriptions/pricing";
import type { AdminUserRow } from "./users";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TRIAL_ENDING_SOON_DAYS = 7;
const NEW_SIGNUPS_WINDOWS_DAYS = [7, 30] as const;

export type AdminKpis = {
  totalUsers: number;
  byStatus: Record<AdminUserRow["status"], number>;
  byPlan: Record<PlanKey, number>;
  suspendedCount: number;
  /** Soma do equivalente mensal do plano de cada assinatura com status "active". A Mercado Pago é a fonte de verdade do valor real cobrado — isto é só uma estimativa. */
  mrrEstimateBRL: Decimal;
  /** Em trial e com trial_ends_at dentro dos próximos 7 dias (a partir de `now`). */
  trialsEndingSoon: number;
  newSignups: Record<(typeof NEW_SIGNUPS_WINDOWS_DAYS)[number], number>;
};

export function computeAdminKpis(users: AdminUserRow[], now = new Date()): AdminKpis {
  const byStatus: AdminKpis["byStatus"] = { trial: 0, active: 0, past_due: 0, canceled: 0 };
  const byPlan: AdminKpis["byPlan"] = { mensal: 0, trimestral: 0, anual: 0 };
  let suspendedCount = 0;
  let mrrEstimateBRL = new Decimal(0);
  let trialsEndingSoon = 0;
  const newSignups = { 7: 0, 30: 0 } as AdminKpis["newSignups"];

  const trialCutoff = now.getTime() + TRIAL_ENDING_SOON_DAYS * MS_PER_DAY;

  for (const user of users) {
    byStatus[user.status] += 1;
    if (user.isSuspended) suspendedCount += 1;

    if (user.plan) {
      byPlan[user.plan] += 1;
      if (user.status === "active") {
        mrrEstimateBRL = mrrEstimateBRL.plus(monthlyEquivalent(user.plan));
      }
    }

    if (user.status === "trial" && user.trialEndsAt) {
      const trialEndsAtMs = new Date(user.trialEndsAt).getTime();
      if (trialEndsAtMs >= now.getTime() && trialEndsAtMs <= trialCutoff) {
        trialsEndingSoon += 1;
      }
    }

    const createdAtMs = new Date(user.createdAt).getTime();
    for (const windowDays of NEW_SIGNUPS_WINDOWS_DAYS) {
      if (now.getTime() - createdAtMs <= windowDays * MS_PER_DAY) {
        newSignups[windowDays] += 1;
      }
    }
  }

  return {
    totalUsers: users.length,
    byStatus,
    byPlan,
    suspendedCount,
    mrrEstimateBRL,
    trialsEndingSoon,
    newSignups,
  };
}
