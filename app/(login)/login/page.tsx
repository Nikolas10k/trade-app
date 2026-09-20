import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar — Diário XAU/USD" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Entrar</h1>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-secondary-light hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
