"use server";

import { logAuditEvent } from "@/lib/audit/log";
import { getUser } from "@/lib/auth/session";

/**
 * Só registra a auditoria — o enroll/verify/unenroll de verdade acontece no
 * cliente via o client browser do Supabase (é o próprio usuário mexendo nos
 * fatores da própria sessão, não precisa de service role pra isso).
 */
export async function logTwoFactorEnabledAction() {
  const user = await getUser();
  if (!user) return;
  await logAuditEvent({ actorId: user.id, userId: user.id, action: "two_factor_enabled" });
}

export async function logTwoFactorDisabledAction() {
  const user = await getUser();
  if (!user) return;
  await logAuditEvent({ actorId: user.id, userId: user.id, action: "two_factor_disabled" });
}
