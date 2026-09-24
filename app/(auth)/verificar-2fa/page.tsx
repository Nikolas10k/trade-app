import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/supabase-server";
import { needsMfaChallenge } from "@/lib/auth/mfa";
import { VerifyTwoFactorForm } from "./verify-2fa-form";

export const metadata = { title: "Verificação em duas etapas — Diário XAU/USD" };

export default async function VerifyTwoFactorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!aal || !needsMfaChallenge(aal)) redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-3 text-2xl font-semibold text-text-primary">Verificação em duas etapas</h1>
      <p className="mb-6 text-text-secondary">
        Digite o código de 6 dígitos do seu aplicativo autenticador.
      </p>
      <VerifyTwoFactorForm />
    </div>
  );
}
