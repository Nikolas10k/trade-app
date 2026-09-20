import { formatMoney } from "@/lib/calc";
import { PLAN_LABELS } from "@/lib/subscriptions/labels";
import { PLAN_BILLING, PLAN_ORDER, monthlyEquivalent } from "@/lib/subscriptions/pricing";
import { Button, Card } from "@/components/ui";
import { subscribeAction } from "./actions";

export const metadata = { title: "Planos — Diário XAU/USD" };

export default function PlansPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">Escolha seu plano</h1>
      <p className="mb-6 text-sm text-text-muted">
        Pagamento processado pela Mercado Pago — Pix ou cartão. Você pode cancelar quando
        quiser pelo portal da Mercado Pago.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {PLAN_ORDER.map((key) => {
          const { price, months, periodLabel } = PLAN_BILLING[key];
          return (
            <Card key={key} className={key === "anual" ? "border-gold/40" : undefined}>
              <h2 className="mb-1 font-semibold text-text-primary">{PLAN_LABELS[key]}</h2>
              <p className="mb-4 text-2xl font-bold text-text-primary">
                {formatMoney(price)}
                <span className="text-sm font-normal text-text-muted"> /{periodLabel}</span>
                {months > 1 ? (
                  <span className="block text-sm font-normal text-text-muted">
                    ≈ {formatMoney(monthlyEquivalent(key))}/mês
                  </span>
                ) : null}
              </p>
              <form action={subscribeAction.bind(null, key)}>
                <Button type="submit" className="w-full">
                  Assinar
                </Button>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
