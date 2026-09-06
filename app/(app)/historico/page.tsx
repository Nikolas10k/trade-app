import { Card } from "@/components/ui";

export const metadata = { title: "Histórico — Diário XAU/USD" };

export default function HistoryPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Histórico</h1>
      <Card>
        <p className="text-text-secondary">
          A lista filtrável de trades chega na Fase 5, junto com as métricas e janelas de
          15/30 dias.
        </p>
      </Card>
    </div>
  );
}
