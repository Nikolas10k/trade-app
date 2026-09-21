import "server-only";
import { logAuditEvent } from "@/lib/audit/log";
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
