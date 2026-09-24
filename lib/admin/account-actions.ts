import "server-only";
import { logAuditEvent } from "@/lib/audit/log";
import { createAdminClient } from "@/lib/db/supabase-admin";
import { getAppBaseUrl } from "@/lib/db/env";
import { createClient } from "@/lib/db/supabase-server";

/**
 * Mesma chamada usada em app/(auth)/actions.ts (forgotPasswordAction) — funciona
 * para qualquer e-mail, não precisa de service role. O admin só evita o usuário
 * ter que passar pelo formulário "esqueci minha senha" sozinho.
 */
export async function forcePasswordReset(targetEmail: string, targetUserId: string, actorId: string) {
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(targetEmail, {
    redirectTo: `${getAppBaseUrl()}/auth/confirm?type=recovery`,
  });
  await logAuditEvent({ actorId, userId: targetUserId, action: "admin_force_password_reset" });
}

export async function resendVerificationEmail(targetEmail: string, targetUserId: string, actorId: string) {
  const supabase = await createClient();
  await supabase.auth.resend({ type: "signup", email: targetEmail });
  await logAuditEvent({ actorId, userId: targetUserId, action: "admin_resend_verification" });
}

/**
 * Recuperação de acesso pra quem perdeu o dispositivo do autenticador e ficou
 * trancado fora da própria conta (2FA obrigatório na sessão, sem o código não
 * há como completar o login). Precisa de service role — não existe endpoint
 * de admin pra isso sem a Admin Auth API.
 */
export async function adminDisableTwoFactor(targetUserId: string, actorId: string) {
  const admin = createAdminClient();
  const { data, error: listError } = await admin.auth.admin.mfa.listFactors({ userId: targetUserId });
  if (listError) throw listError;

  for (const factor of data.factors) {
    const { error } = await admin.auth.admin.mfa.deleteFactor({ id: factor.id, userId: targetUserId });
    if (error) throw error;
  }

  await logAuditEvent({ actorId, userId: targetUserId, action: "admin_disable_two_factor" });
}
