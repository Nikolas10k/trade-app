import Link from "next/link";
import { Card } from "@/components/ui";
import { createClient } from "@/lib/db/supabase-server";
import { PLAN_LABELS, SUBSCRIPTION_STATUS_LABELS } from "@/lib/subscriptions/labels";

export const metadata = { title: "Configurações — Diário XAU/USD" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan, trial_ends_at, current_period_end")
    .eq("user_id", user!.id)
    .single();

  const renewalDate = subscription?.current_period_end ?? subscription?.trial_ends_at;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Configurações</h1>

      <Card>
        <h2 className="mb-3 font-semibold text-text-primary">Assinatura</h2>
        <dl className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-muted">Status</dt>
            <dd className="text-text-primary">{SUBSCRIPTION_STATUS_LABELS[subscription?.status ?? "trial"]}</dd>
          </div>
          {subscription?.plan ? (
            <div className="flex justify-between">
              <dt className="text-text-muted">Plano</dt>
              <dd className="text-text-primary">{PLAN_LABELS[subscription.plan]}</dd>
            </div>
          ) : null}
          {renewalDate ? (
            <div className="flex justify-between">
              <dt className="text-text-muted">
                {subscription?.status === "trial" ? "Teste termina em" : "Renova em"}
              </dt>
              <dd className="text-text-primary">{new Date(renewalDate).toLocaleDateString("pt-BR")}</dd>
            </div>
          ) : null}
        </dl>
        <Link href="/planos" className="text-sm text-secondary-light hover:underline">
          {subscription?.status === "active" ? "Trocar de plano" : "Ver planos"}
        </Link>
        <p className="mt-2 text-xs text-text-disabled">
          Cancelamentos e alterações de forma de pagamento são feitos no portal da Mercado
          Pago — o app reflete o status automaticamente assim que a Mercado Pago notifica.
        </p>
      </Card>

      <Card>
        <p className="text-text-secondary">
          Instrumento, preferências, segurança (2FA) e exportação/exclusão de dados (LGPD)
          chegam na Fase 7.
        </p>
      </Card>
    </div>
  );
}
