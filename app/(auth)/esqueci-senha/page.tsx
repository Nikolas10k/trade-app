import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = { title: "Esqueci minha senha — Diário XAU/USD" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">Esqueci minha senha</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
