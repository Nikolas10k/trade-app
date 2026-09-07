import "server-only";
import { createAdminClient } from "@/lib/db/supabase-admin";

/**
 * Cada função aqui chama uma função de banco atômica (mudança de estado +
 * audit_log na mesma transação — ver supabase/migrations/*_admin_write_functions.sql).
 * Só o service_role consegue chamar essas funções de banco.
 */

export async function extendTrial(targetUserId: string, days: number, actorId: string) {
  const admin = createAdminClient();
  const { error } = await admin.rpc("admin_extend_trial", {
    target_user_id: targetUserId,
    extend_days: days,
    actor_id: actorId,
  });
  if (error) throw error;
}

export async function grantComp(targetUserId: string, days: number, actorId: string) {
  const admin = createAdminClient();
  const { error } = await admin.rpc("admin_grant_comp", {
    target_user_id: targetUserId,
    comp_days: days,
    actor_id: actorId,
  });
  if (error) throw error;
}

export async function setSuspended(targetUserId: string, suspended: boolean, actorId: string) {
  const admin = createAdminClient();
  const { error } = await admin.rpc("admin_set_suspended", {
    target_user_id: targetUserId,
    suspended,
    actor_id: actorId,
  });
  if (error) throw error;
}
