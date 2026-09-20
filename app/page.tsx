import Link from "next/link";
import { Suspense } from "react";
import { AmbientBackground } from "@/components/ambient-background";
import { Card } from "@/components/ui";
import { PriceChartMark } from "@/components/price-chart-mark";
import { AccountDeletedBanner } from "./account-deleted-banner";

const ctaClass =
  "inline-flex items-center justify-center rounded-lg bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <AccountDeletedBanner />
      </Suspense>

      <div className="relative overflow-hidden">
        <AmbientBackground />

        <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
          <span className="text-lg font-bold text-gradient-brand">Diário XAU/USD</span>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary">
              Entrar
            </Link>
            <Link href="/cadastro" className={ctaClass}>
              Começar 3 dias grátis
            </Link>
          </nav>
        </header>

        <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-16 text-center">
          <PriceChartMark className="mb-6 h-14 w-56" />

          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-text-primary sm:text-5xl">
            Registre cada trade em <span className="text-gradient-brand">XAU/USD</span> e siga o
            seu próprio método
          </h1>
          <p className="mt-6 max-w-xl text-lg text-text-secondary">
            Diário de trades manual com checklist de 13 pontos, medidor de disciplina e zonas
            quentes de preço — para operadores que já têm um método e querem segui-lo.
          </p>
          <Link href="/cadastro" className={`${ctaClass} mt-8 px-8 py-3 text-base`}>
            Começar 3 dias grátis
          </Link>
        </section>
      </div>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="grid w-full gap-6 sm:grid-cols-3">
          <Card className="transition hover:-translate-y-1 hover:border-white/20">
            <h3 className="mb-2 font-semibold text-text-primary">Checklist de método</h3>
            <p className="text-sm text-text-secondary">
              13 itens em 4 fases, do plano de entrada à gestão do stop. Mede o que foi
              cumprido, não bloqueia o registro.
            </p>
          </Card>
          <Card className="border-gold/30 bg-gradient-to-br from-gold/10 to-transparent transition hover:-translate-y-1 hover:border-gold/50">
            <h3 className="mb-2 font-semibold text-gold-light">Medidor de disciplina</h3>
            <p className="text-sm text-text-secondary">
              Pontuação 0–100 que combina aderência ao checklist e ao seu limite de risco —
              independente do resultado do trade.
            </p>
          </Card>
          <Card className="transition hover:-translate-y-1 hover:border-white/20">
            <h3 className="mb-2 font-semibold text-text-primary">Zonas quentes</h3>
            <p className="text-sm text-text-secondary">
              Agrupa suas regiões de entrada recorrentes em clusters de até 100 pips, com
              win rate por zona.
            </p>
          </Card>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-5xl items-center justify-between border-t border-white/10 px-6 py-8 text-sm text-text-muted">
        <span>© {new Date().getFullYear()} Diário XAU/USD</span>
        <div className="flex gap-4">
          <Link href="/privacidade" className="hover:text-text-secondary">
            Política de Privacidade
          </Link>
          <Link href="/termos" className="hover:text-text-secondary">
            Termos de Uso
          </Link>
        </div>
      </footer>
    </div>
  );
}
