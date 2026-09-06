import { Button, Card } from "@/components/ui";
import { subscribeAction } from "./actions";

export const metadata = { title: "Planos — Diário XAU/USD" };

const PLANS = [
  { key: "mensal" as const, label: "Mensal", price: "R$ 14,99", period: "/mês" },
  { key: "trimestral" as const, label: "Trimestral", price: "R$ 39,00", period: "/trimestre (≈ R$ 13,00/mês)" },
  { key: "anual" as const, label: "Anual", price: "R$ 129,00", period: "/ano (≈ R$ 10,75/mês)", highlight: true },
];

export default function PlansPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">Escolha seu plano</h1>
      <p className="mb-6 text-sm text-text-muted">
        Pagamento processado pela Mercado Pago — Pix ou cartão. Você pode cancelar quando
        quiser pelo portal da Mercado Pago.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.key} className={plan.highlight ? "border-gold/40" : undefined}>
            <h2 className="mb-1 font-semibold text-text-primary">{plan.label}</h2>
            <p className="mb-4 text-2xl font-bold text-text-primary">
              {plan.price}
              <span className="text-sm font-normal text-text-muted"> {plan.period}</span>
            </p>
            <form action={subscribeAction.bind(null, plan.key)}>
              <Button type="submit" className="w-full">
                Assinar
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
