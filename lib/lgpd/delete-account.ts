import "server-only";
import { createAdminClient } from "@/lib/db/supabase-admin";

/**
 * Exclusão real e definitiva (LGPD). O cascade do schema
 * (on delete cascade em profiles/instruments/subscriptions/trades/
 * screen_time_logs) apaga todo o resto quando auth.users é apagado.
 */
export async function deleteAccount(userId: string, actorId: string) {
  const admin = createAdminClient();

  // Grava a auditoria ANTES de apagar: depois que o usuário deixar de
  // existir, a FK (on delete set null) zera actor_id/user_id nesta linha,
  // mas a ação e o timestamp permanecem — rastro sem PII vinculada.
  await admin.from("audit_log").insert({
    actor_id: actorId,
    user_id: userId,
    action: "account_deleted",
    metadata: {},
  });

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;
}
