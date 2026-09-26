import Link from "next/link";
import { SignupVideoBackground } from "@/components/signup-video-background";
import { SignUpForm } from "./signup-form";

export const metadata = { title: "Criar conta — Diário XAU/USD" };

export default function SignUpPage() {
  return (
    <>
      <SignupVideoBackground />
      <div className="rounded-2xl border border-white/10 bg-surface/70 p-6 backdrop-blur-md">
        <h1 className="mb-6 text-2xl font-semibold text-text-primary">Criar conta</h1>
        <SignUpForm />
        <p className="mt-6 text-center text-sm text-text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="text-secondary-light hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </>
  );
}
