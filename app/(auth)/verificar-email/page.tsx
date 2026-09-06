import { ResendVerificationButton } from "./resend-button";

export const metadata = { title: "Verifique seu e-mail — Diário XAU/USD" };

export default function VerifyEmailPage() {
  return (
    <div className="text-center">
      <h1 className="mb-3 text-2xl font-semibold text-text-primary">Verifique seu e-mail</h1>
      <p className="mb-6 text-text-secondary">
        Enviamos um link de confirmação para o e-mail que você cadastrou. Abra-o para ativar
        sua conta e começar o trial de 3 dias.
      </p>
      <ResendVerificationButton />
    </div>
  );
}
