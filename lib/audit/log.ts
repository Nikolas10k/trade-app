import "server-only";
import { createAdminClient } from "@/lib/db/supabase-admin";
import type { Json } from "@/lib/db/database.types";

/**
 * Log de ações sensíveis (9.10): login, troca de senha, exclusão de conta,
 * mudança de plano, toda ação administrativa. authenticated não tem grant
 * de escrita em audit_log — só o service role grava.
 */
export async function logAuditEvent(params: {
  actorId: string | null;
  userId: string | null;
  action: string;
  metadata?: Record<string, Json>;
}) {
  const admin = createAdminClient();
  // Best-effort: uma falha ao gravar auditoria não pode derrubar a ação do
  // usuário (login, troca de senha) que já foi bem-sucedida.
  await admin.from("audit_log").insert({
    actor_id: params.actorId,
    user_id: params.userId,
    action: params.action,
    metadata: params.metadata ?? {},
  });
}
