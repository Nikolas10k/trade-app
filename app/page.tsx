import Link from "next/link";
import { Suspense } from "react";
import { Card } from "@/components/ui";
import { HeroVideoBackground } from "@/components/hero-video-background";
import { Reveal } from "@/components/reveal";
import { formatMoney } from "@/lib/calc";
import { PLAN_LABELS } from "@/lib/subscriptions/labels";
import { PLAN_BILLING, PLAN_ORDER, monthlyEquivalent, savingsVsMonthly } from "@/lib/subscriptions/pricing";
import { AccountDeletedBanner } from "./account-deleted-banner";
import { AppScreenshots } from "./app-screenshots";
import { DifferentiatorsSection } from "./differentiators-section";
import { FaqSection } from "./faq-section";
import { FinalCtaSection } from "./final-cta-section";

const ctaClass =
  "inline-flex items-center justify-center rounded-lg bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <AccountDeletedBanner />
      </Suspense>

      <div className="relative overflow-hidden">
        <HeroVideoBackground />

        <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6 py-6">
          <span className="shrink-0 whitespace-nowrap text-base font-bold text-gradient-brand sm:text-lg">
            Diário XAU/USD
          </span>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-xs text-text-secondary hover:text-text-primary sm:text-sm">
              Entrar
            </Link>
            <Link href="/cadastro" className={`${ctaClass} px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm`}>
              Começar 3 dias grátis
            </Link>
          </nav>
        </header>

        <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-16 text-center md:py-24">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold-light drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
            Nem o administrador vê seus trades
          </span>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-text-primary drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)] sm:text-5xl">
            Registre cada trade em <span className="text-gradient-brand">XAU/USD</span> e siga o
            seu próprio método
          </h1>
          <p className="mt-6 max-w-xl text-lg text-text-secondary drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
            Diário de trades manual com checklist de 13 pontos, medidor de disciplina e zonas
            quentes de preço — para operadores que já têm um método e querem segui-lo.
          </p>
          <Link href="/cadastro" className={`${ctaClass} mt-8 px-8 py-3 text-base`}>
            Começar 3 dias grátis
          </Link>
          <p className="mt-4 text-xs text-text-muted drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
            Sem cartão de crédito · Cancele quando quiser
          </p>
        </section>
      </div>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="grid w-full gap-6 sm:grid-cols-3">
          <Reveal>
            <Card className="h-full transition hover:-translate-y-1 hover:border-white/20">
              <h3 className="mb-2 font-semibold text-text-primary">Checklist de método</h3>
              <p className="text-sm text-text-secondary">
                13 itens em 4 fases, do plano de entrada à gestão do stop. Mede o que foi
                cumprido, não bloqueia o registro.
              </p>
            </Card>
          </Reveal>
          <Reveal delayMs={100}>
            <Card className="h-full border-gold/30 bg-gradient-to-br from-gold/10 to-transparent transition hover:-translate-y-1 hover:border-gold/50">
              <h3 className="mb-2 font-semibold text-gold-light">Medidor de disciplina</h3>
              <p className="text-sm text-text-secondary">
                Pontuação 0–100 que combina aderência ao checklist e ao seu limite de risco —
                independente do resultado do trade.
              </p>
            </Card>
          </Reveal>
          <Reveal delayMs={200}>
            <Card className="h-full transition hover:-translate-y-1 hover:border-white/20">
              <h3 className="mb-2 font-semibold text-text-primary">Zonas quentes</h3>
              <p className="text-sm text-text-secondary">
                Agrupa suas regiões de entrada recorrentes em clusters de até 100 pips, com
                win rate por zona.
              </p>
            </Card>
          </Reveal>
        </div>
      </section>

      <DifferentiatorsSection />

      <AppScreenshots />

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <Reveal className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-text-primary">Planos</h2>
          <p className="mt-2 text-sm text-text-muted">
            3 dias de teste grátis, sem cartão de crédito. Cancele quando quiser.
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLAN_ORDER.map((key, index) => {
            const { price, months, periodLabel } = PLAN_BILLING[key];
            const savings = savingsVsMonthly(key);
            return (
              <Reveal key={key} delayMs={index * 100}>
                <Card
                  className={`relative h-full ${
                    key === "anual" ? "border-gold/40 bg-gradient-to-br from-gold/10 to-transparent" : ""
                  }`}
                >
                  {savings ? (
                    <span className="absolute -top-3 right-4 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-bg shadow-lg">
                      Economize {savings.pct.toFixed(0)}%
                    </span>
                  ) : null}
                  <h3 className="mb-1 font-semibold text-text-primary">{PLAN_LABELS[key]}</h3>
                  <p className="mb-4 text-2xl font-bold text-text-primary">
                    {formatMoney(price)}
                    <span className="text-sm font-normal text-text-muted"> /{periodLabel}</span>
                    {months > 1 ? (
                      <span className="block text-sm font-normal text-text-muted">
                        ≈ {formatMoney(monthlyEquivalent(key))}/mês
                      </span>
                    ) : null}
                  </p>
                  <Link href="/cadastro" className={`${ctaClass} w-full`}>
                    Começar 3 dias grátis
                  </Link>
                </Card>
              </Reveal>
            );
          })}
        </div>
        <Reveal delayMs={300} className="mt-6 text-center text-xs text-text-muted">
          Pagamento processado com segurança pela Mercado Pago (Pix ou cartão)
        </Reveal>
      </section>

      <FaqSection />

      <FinalCtaSection />

      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-sm text-text-muted">
        <div className="flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Diário XAU/USD</span>
          <div className="flex gap-4">
            <Link href="/privacidade" className="hover:text-text-secondary">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="hover:text-text-secondary">
              Termos de Uso
            </Link>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-xs text-text-disabled">
          O Diário XAU/USD é uma ferramenta de registro e análise do seu próprio histórico de
          operações. Não constitui recomendação de investimento nem garante resultado financeiro
          — decisões de trading são de sua exclusiva responsabilidade.
        </p>
      </footer>
    </div>
  );
}
