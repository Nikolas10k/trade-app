import { forbidden, redirect } from "next/navigation";
import { getUser } from "./session";
import { hasVerifiedTotpFactor, requireAal2 } from "./mfa";
import { createClient } from "@/lib/db/supabase-server";

/**
 * Guard das rotas /app/(admin)/*. Não-admin recebe 403 de verdade (forbidden(),
 * não um redirect genérico) — S6/13.3. O papel é resolvido no servidor via a
 * função is_admin() (SECURITY DEFINER), nunca no cliente.
 *
 * 2FA é opcional pro trader comum, mas **obrigatório** pra quem é admin — é a
 * conta com mais privilégio do sistema (vê dado de todo usuário, mexe em
 * assinatura, pode desativar 2FA alheio). Quem ainda não ativou é barrado
 * antes de qualquer página admin, com instrução de onde ativar.
 */
export async function requireAdmin(): Promise<{ adminId: string }> {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  await requireAal2();

  const supabase = await createClient();
  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error || isAdmin !== true) {
    forbidden();
  }

  if (!hasVerifiedTotpFactor(user)) {
    redirect("/configuracoes?admin2fa=obrigatorio");
  }

  return { adminId: user.id };
}
