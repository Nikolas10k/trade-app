import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

/**
 * Client com a service_role key — bypassa RLS. Só pode ser importado por código
 * server-only (webhook do Mercado Pago e /app/api/admin/*). O import "server-only"
 * faz o build falhar se este módulo acabar sendo incluído num bundle de cliente.
 */
export function createAdminClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
