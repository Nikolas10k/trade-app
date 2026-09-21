import "server-only";
import type { Json } from "@/lib/db/database.types";
import { createClient } from "@/lib/db/supabase-server";

export type AuditLogRow = {
  id: string;
  actorId: string | null;
  userId: string | null;
  action: string;
  metadata: Json | null;
  createdAt: string;
};

const AUDIT_LOG_LIMIT = 200;

/** Lê via RLS (policy audit_select_admin) — não precisa de service role. */
export async function listAuditLog(): Promise<AuditLogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("id, actor_id, user_id, action, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(AUDIT_LOG_LIMIT);
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    actorId: row.actor_id,
    userId: row.user_id,
    action: row.action,
    metadata: row.metadata,
    createdAt: row.created_at,
  }));
}

/** "days: 7, plan: mensal" — string curta pra exibir na tabela, sem virar uma coluna de JSON bruto. */
export function formatAuditMetadata(metadata: Json | null): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const entries = Object.entries(metadata as Record<string, Json>);
  if (entries.length === 0) return null;
  return entries
    .map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join(", ");
}
