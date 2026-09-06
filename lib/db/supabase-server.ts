import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/**
 * Client Supabase para Server Components, Server Actions e Route Handlers.
 * Usa a chave anon — RLS sempre ativa, `user_id` só existe via `auth.uid()` da sessão.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Chamado a partir de um Server Component sem permissão de escrita de
          // cookies: o proxy.ts cuida do refresh de sessão nesse caso.
        }
      },
    },
  });
}
