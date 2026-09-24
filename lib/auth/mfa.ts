import "server-only";
import { redirect } from "next/navigation";
import type { AuthenticatorAssuranceLevels } from "@supabase/supabase-js";
import { createClient } from "@/lib/db/supabase-server";

export type AalStatus = {
  currentLevel: AuthenticatorAssuranceLevels | null;
  nextLevel: AuthenticatorAssuranceLevels | null;
};

/** true quando a sessão atual ainda precisa do 2º fator antes de ir além do aal1. */
export function needsMfaChallenge(aal: AalStatus): boolean {
  return aal.nextLevel === "aal2" && aal.currentLevel !== "aal2";
}

/**
 * Chamado pelos guards (requireUser/requireAdmin) depois de confirmar que a
 * sessão existe — nunca antes, e nunca no proxy.ts (autorização não é
 * responsabilidade de middleware neste projeto). Quem tem TOTP verificado
 * mas ainda não completou o desafio desta sessão é mandado para a tela de
 * verificação antes de qualquer rota protegida.
 */
export async function requireAal2() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!error && needsMfaChallenge(data)) {
    redirect("/verificar-2fa");
  }
}
