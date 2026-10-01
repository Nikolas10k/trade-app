"use client";

import { useState } from "react";
import { Reveal } from "@/components/reveal";

const FAQ_ITEMS = [
  {
    question: "O admin consegue ver meus trades?",
    answer:
      "Não. É uma restrição do próprio banco de dados, não só da tela: o administrador vê e-mail, status da assinatura e o log de ações administrativas — nunca o conteúdo dos seus trades, checklist ou notas de disciplina.",
  },
  {
    question: "Preciso conectar minha corretora?",
    answer:
      "Não. O registro é manual, de propósito — você digita entrada, stop, resultado e o checklist depois de operar. O app nunca tem acesso à sua conta de corretora nem executa ordens.",
  },
  {
    question: "Funciona só pra XAU/USD?",
    answer:
      "Sim, é feito especificamente pra quem opera ouro — os pips, o checklist e as zonas quentes são calibrados pra esse par, não é um painel genérico adaptado pra qualquer ativo.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim, direto no portal da Mercado Pago, sem precisar falar com ninguém. Seus dados continuam acessíveis em modo somente leitura até você decidir o que fazer com a conta.",
  },
  {
    question: "Preciso de cartão de crédito pra testar?",
    answer: "Não. São 3 dias de teste completo, sem pedir forma de pagamento.",
  },
  {
    question: "Meus dados são protegidos?",
    answer:
      "Toda tabela com dado de usuário tem controle de acesso a nível de linha no banco — um bug de interface não é suficiente pra um usuário ver dado de outro. Verificação em duas etapas disponível pra qualquer conta, e você pode exportar ou excluir seus dados a qualquer momento (LGPD).",
  },
] as const;

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 shrink-0 text-text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto w-full max-w-3xl px-6 pb-16">
      <Reveal className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-text-primary">Perguntas frequentes</h2>
      </Reveal>
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const open = openIndex === index;
          return (
            <Reveal key={item.question} delayMs={index * 60}>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-surface">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-text-primary"
                >
                  {item.question}
                  <ChevronIcon open={open} />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-text-secondary">{item.answer}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
