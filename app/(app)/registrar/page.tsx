import { Card } from "@/components/ui";

export const metadata = { title: "Registrar trade — Diário XAU/USD" };

export default function RegisterTradePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Registrar trade</h1>
      <Card>
        <p className="text-text-secondary">
          O formulário de registro com calculadora (Fase 2) e o checklist de método (Fase 3)
          entram nas próximas fases.
        </p>
      </Card>
    </div>
  );
}
