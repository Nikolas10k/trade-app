import Image from "next/image";

const SCREENSHOTS = [
  {
    src: "/screenshots/dashboard.webp",
    width: 1600,
    height: 1228,
    title: "Dashboard com suas métricas reais",
    description:
      "Saldo, assertividade, horas de tela e disciplina — tudo calculado a partir dos trades que você mesmo registra, sem planilha.",
  },
  {
    src: "/screenshots/registrar.webp",
    width: 1600,
    height: 1329,
    title: "Checklist e calculadora em tempo real",
    description:
      "Pips, R/R e risco calculados enquanto você digita. O checklist de 13 pontos mostra o que foi cumprido do seu método.",
  },
  {
    src: "/screenshots/zonas.webp",
    width: 1600,
    height: 1125,
    title: "Zonas quentes de preço",
    description:
      "Suas regiões de entrada recorrentes, agrupadas automaticamente, com o win rate de cada zona.",
  },
  {
    src: "/screenshots/historico.webp",
    width: 1600,
    height: 1246,
    title: "Histórico completo e filtrável",
    description: "Todos os seus trades, com filtro por saída, por período e por resultado.",
  },
];

export function AppScreenshots() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pb-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-text-primary">Veja por dentro</h2>
        <p className="mt-2 text-sm text-text-muted">A aplicação de verdade, funcionando.</p>
      </div>
      <div className="space-y-10">
        {SCREENSHOTS.map((shot) => (
          <figure
            key={shot.src}
            className="overflow-hidden rounded-2xl border border-white/10 bg-surface"
          >
            <Image
              src={shot.src}
              alt={shot.title}
              width={shot.width}
              height={shot.height}
              sizes="(min-width: 1024px) 896px, 100vw"
              className="w-full"
            />
            <figcaption className="border-t border-white/10 p-6">
              <h3 className="mb-1 font-semibold text-text-primary">{shot.title}</h3>
              <p className="text-sm text-text-secondary">{shot.description}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
