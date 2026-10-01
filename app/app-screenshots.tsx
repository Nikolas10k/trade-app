import Image from "next/image";
import { Reveal } from "@/components/reveal";

const SCREENSHOTS = [
  {
    src: "/screenshots/dashboard.webp",
    width: 1600,
    height: 1228,
    eyebrow: "Visão geral",
    title: "Todas as suas métricas, numa tela só",
    description:
      "Saldo, assertividade, horas de tela e disciplina — calculados a partir dos trades que você mesmo registra, sem exportar nada pra planilha.",
    stat: { value: "4", label: "métricas-chave atualizadas a cada trade" },
  },
  {
    src: "/screenshots/registrar.webp",
    width: 1600,
    height: 1329,
    eyebrow: "Registro de trade",
    title: "A calculadora pensa por você em tempo real",
    description:
      "Pips, R/R e risco sobre o saldo aparecem enquanto você digita — com alerta imediato se você furar o próprio limite de risco configurado.",
    stat: { value: "13", label: "itens de checklist, em 4 fases do método" },
  },
  {
    src: "/screenshots/zonas.webp",
    width: 1600,
    height: 1125,
    eyebrow: "Zonas quentes",
    title: "Descubra onde você mais acerta (e mais erra)",
    description:
      "Suas regiões de entrada recorrentes são agrupadas automaticamente, com o win rate de cada zona — sem precisar marcar nada manualmente.",
    stat: { value: "100 pips", label: "raio de agrupamento, calibrado pra XAU/USD" },
  },
  {
    src: "/screenshots/historico.webp",
    width: 1600,
    height: 1246,
    eyebrow: "Histórico",
    title: "Cada trade, rastreável quando você precisar",
    description: "Filtre por tipo de saída, período ou resultado — seus dados, sempre acessíveis e exportáveis.",
    stat: { value: "100%", label: "dos seus trades, exportáveis em JSON ou CSV" },
  },
];

export function AppScreenshots() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pb-16">
      <Reveal className="mb-12 text-center">
        <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">Veja por dentro</h2>
        <p className="mt-2 text-sm text-text-muted">A aplicação de verdade, funcionando — não uma maquete.</p>
      </Reveal>
      <div className="space-y-20">
        {SCREENSHOTS.map((shot, index) => {
          const imageFirst = index % 2 === 1;
          return (
            <div
              key={shot.src}
              className={`grid items-center gap-8 md:grid-cols-2 md:gap-12 ${
                imageFirst ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <Reveal>
                <span className="text-xs font-semibold uppercase tracking-wider text-gold-light">
                  {shot.eyebrow}
                </span>
                <h3 className="mt-2 text-xl font-bold text-text-primary sm:text-2xl">{shot.title}</h3>
                <p className="mt-3 text-text-secondary">{shot.description}</p>
                <div className="mt-6 inline-flex items-baseline gap-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3">
                  <span className="text-2xl font-bold text-gold-light">{shot.stat.value}</span>
                  <span className="text-sm text-text-muted">{shot.stat.label}</span>
                </div>
              </Reveal>
              <Reveal delayMs={120}>
                <div className="group overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl shadow-black/40 transition duration-500 hover:-translate-y-1 hover:border-gold/30 hover:shadow-gold/10">
                  <Image
                    src={shot.src}
                    alt={shot.title}
                    width={shot.width}
                    height={shot.height}
                    sizes="(min-width: 768px) 448px, 100vw"
                    className="w-full transition duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </section>
  );
}
