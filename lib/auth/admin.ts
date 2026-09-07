import { forbidden, redirect } from "next/navigation";
import { getUser } from "./session";
import { createClient } from "@/lib/db/supabase-server";

/**
 * Guard das rotas /app/(admin)/*. Não-admin recebe 403 de verdade (forbidden(),
 * não um redirect genérico) — S6/13.3. O papel é resolvido no servidor via a
 * função is_admin() (SECURITY DEFINER), nunca no cliente.
 */
export async function requireAdmin(): Promise<{ adminId: string }> {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error || isAdmin !== true) {
    forbidden();
  }

  return { adminId: user.id };
}
