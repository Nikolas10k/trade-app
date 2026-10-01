import type { SVGProps } from "react";
import { Reveal } from "@/components/reveal";

function IconWrap(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-gold-light"
      aria-hidden
      {...props}
    />
  );
}

const ITEMS = [
  {
    icon: (props: SVGProps<SVGSVGElement>) => (
      <IconWrap {...props}>
        <rect x="4" y="10.5" width="16" height="10" rx="2" />
        <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
      </IconWrap>
    ),
    title: "Privacidade por padrão, não por promessa",
    description:
      "Nem o administrador do sistema vê o conteúdo dos seus trades — é uma restrição imposta pelo próprio banco de dados, não apenas escondida na interface.",
  },
  {
    icon: (props: SVGProps<SVGSVGElement>) => (
      <IconWrap {...props}>
        <path d="M12 3.5 19 6v5.2c0 4.3-2.9 7.4-7 8.8-4.1-1.4-7-4.5-7-8.8V6l7-2.5Z" />
        <path d="m9.2 12 1.9 1.9 3.7-3.9" />
      </IconWrap>
    ),
    title: "Mede processo, não sorte",
    description:
      "A nota de disciplina combina aderência ao checklist e ao seu limite de risco — um trade pode dar certo por sorte, mas só o processo se repete.",
  },
  {
    icon: (props: SVGProps<SVGSVGElement>) => (
      <IconWrap {...props}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v10M9 9.5h4.5a1.75 1.75 0 1 1 0 3.5H9.5a1.75 1.75 0 1 0 0 3.5H15" />
      </IconWrap>
    ),
    title: "Especialista em XAU/USD, não genérico",
    description:
      "Pips, checklist e zonas quentes calibrados especificamente pra ouro — não é um painel de qualquer ativo adaptado às pressas.",
  },
] as const;

export function DifferentiatorsSection() {
  return (
    <section className="border-y border-white/5 bg-surface/50">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <Reveal className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-light">
            Por que não é só mais um diário
          </span>
          <h2 className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">
            Feito pra quem leva o método a sério
          </h2>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-3">
          {ITEMS.map((item, index) => (
            <Reveal key={item.title} delayMs={index * 100}>
              <div className="h-full rounded-2xl border border-white/10 bg-bg/60 p-6 transition hover:-translate-y-1 hover:border-gold/30">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
                  <item.icon />
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
