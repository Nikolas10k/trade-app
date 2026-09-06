import Link from "next/link";
import { Card } from "@/components/ui";

const ctaClass =
  "inline-flex items-center justify-center rounded-lg bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
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

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 py-16 text-center">
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

        <div className="mt-20 grid w-full gap-6 sm:grid-cols-3">
          <Card>
            <h3 className="mb-2 font-semibold text-text-primary">Checklist de método</h3>
            <p className="text-sm text-text-secondary">
              13 itens em 4 fases, do plano de entrada à gestão do stop. Mede o que foi
              cumprido, não bloqueia o registro.
            </p>
          </Card>
          <Card>
            <h3 className="mb-2 font-semibold text-text-primary">Medidor de disciplina</h3>
            <p className="text-sm text-text-secondary">
              Pontuação 0–100 que combina aderência ao checklist e ao seu limite de risco —
              independente do resultado do trade.
            </p>
          </Card>
          <Card>
            <h3 className="mb-2 font-semibold text-text-primary">Zonas quentes</h3>
            <p className="text-sm text-text-secondary">
              Agrupa suas regiões de entrada recorrentes em clusters de até 100 pips, com
              win rate por zona.
            </p>
          </Card>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8 text-sm text-text-muted">
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
