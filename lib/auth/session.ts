import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase-server";
import { requireAal2 } from "./mfa";

/**
 * Lê o usuário autenticado revalidando o JWT junto ao Supabase Auth (não confia
 * apenas no cookie local) — é a chamada correta para decisões de autorização
 * server-side. Nunca usar `getSession()` para isso.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Guard para rotas do trader: exige sessão válida, e-mail verificado e 2º fator (se tiver TOTP ativo). */
export async function requireUser() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.email_confirmed_at) {
    redirect("/verificar-email");
  }
  await requireAal2();
  return user;
}
