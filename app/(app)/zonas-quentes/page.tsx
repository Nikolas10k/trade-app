import { Card } from "@/components/ui";

export const metadata = { title: "Zonas quentes — Diário XAU/USD" };

export default function HotZonesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Zonas quentes</h1>
      <Card>
        <p className="text-text-secondary">
          O cruzamento de regiões em clusters de até 100 pips chega na Fase 4, quando houver
          trades registrados.
        </p>
      </Card>
    </div>
  );
}
