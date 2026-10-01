import Link from "next/link";
import { Reveal } from "@/components/reveal";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-brand opacity-90" aria-hidden />
      <div className="ambient-grid absolute inset-0 opacity-20" aria-hidden />
      <div className="relative mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <Reveal>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Pare de adivinhar se o seu método funciona
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            3 dias de teste completo, sem cartão de crédito. Comece a medir disciplina hoje.
          </p>
          <Link
            href="/cadastro"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-base font-semibold text-primary shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            Começar 3 dias grátis
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
