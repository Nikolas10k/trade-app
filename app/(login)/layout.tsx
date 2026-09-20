import Link from "next/link";
import type { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="login-hero relative hidden overflow-hidden md:flex md:flex-col md:justify-between md:p-12">
        <div className="login-hero-orb login-hero-orb-gold" aria-hidden />
        <div className="login-hero-orb login-hero-orb-blue" aria-hidden />
        <div className="login-hero-grid" aria-hidden />

        <Link href="/" className="relative z-10 text-lg font-bold text-gradient-brand">
          Diário XAU/USD
        </Link>

        <div className="relative z-10 max-w-md">
          <svg
            viewBox="0 0 200 60"
            className="login-hero-chart mb-8 h-16 w-48"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 45 L2 30 M2 37 L8 37 M8 42 L8 20 M8 31 L14 31 M14 38 L14 22 M14 30 L20 30 M20 25 L20 10 M20 17 L26 17 M26 22 L26 5 M26 13 L32 13"
              stroke="var(--color-danger)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              className="login-hero-chart-line"
              d="M2 40 C 30 38, 45 20, 70 24 S 110 8, 140 14 S 175 4, 198 6"
              stroke="var(--color-gold-light)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          <h1 className="text-3xl font-bold leading-tight text-text-primary">
            Sua disciplina, medida a cada operação em{" "}
            <span className="text-gradient-brand">XAU/USD</span>
          </h1>
          <p className="mt-4 text-text-secondary">
            Checklist de método, medidor de disciplina 0–100 e zonas quentes de preço — o
            diário de quem já tem um método e quer segui-lo.
          </p>
        </div>

        <p className="relative z-10 text-xs text-text-disabled">
          © {new Date().getFullYear()} Diário XAU/USD
        </p>
      </section>

      <section className="flex flex-col items-center justify-center bg-bg px-4 py-12">
        <Link href="/" className="mb-8 text-lg font-bold text-gradient-brand md:hidden">
          Diário XAU/USD
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </div>
  );
}
