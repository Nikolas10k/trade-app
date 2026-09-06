import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Redefinir senha — Diário XAU/USD" };

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Redefinir senha</h1>
      <ResetPasswordForm />
    </div>
  );
}
