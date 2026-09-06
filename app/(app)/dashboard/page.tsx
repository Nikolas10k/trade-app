import { Card } from "@/components/ui";

export const metadata = { title: "Dashboard — Diário XAU/USD" };

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Dashboard</h1>
      <Card>
        <p className="text-text-secondary">
          O dashboard (saldo, assertividade, disciplina e zonas quentes) chega na Fase 5, depois
          do registro de trades e das métricas estarem prontos.
        </p>
      </Card>
    </div>
  );
}
