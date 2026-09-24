import Link from "next/link";
import { Card } from "@/components/ui";
import { createClient } from "@/lib/db/supabase-server";
import { PLAN_LABELS, SUBSCRIPTION_STATUS_LABELS } from "@/lib/subscriptions/labels";
import { DeleteAccountForm } from "./delete-account-form";
import { TwoFactorSection } from "./two-factor-section";

export const metadata = { title: "Configurações — Diário XAU/USD" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ admin2fa?: string }>;
}) {
  const { admin2fa } = await searchParams;
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
  const totpFactor = user?.factors?.find((f) => f.factor_type === "totp" && f.status === "verified");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Configurações</h1>

      {admin2fa === "obrigatorio" ? (
        <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-text-secondary">
          Contas de admin precisam ter a verificação em duas etapas ativada. Ative abaixo e
          depois volte para o painel administrativo.
        </div>
      ) : null}

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
        <h2 className="mb-3 font-semibold text-text-primary">Seus dados (LGPD)</h2>
        <p className="mb-3 text-sm text-text-secondary">
          Baixe uma cópia de tudo o que registramos sobre você.
        </p>
        <div className="mb-6 flex flex-wrap gap-3">
          <a
            href="/api/lgpd/export?format=json"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-text-primary hover:bg-white/5"
          >
            Baixar tudo (JSON)
          </a>
          <a
            href="/api/lgpd/export?format=csv"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-text-primary hover:bg-white/5"
          >
            Baixar trades (CSV)
          </a>
        </div>

        <h3 className="mb-2 text-sm font-semibold text-danger">Zona de risco</h3>
        <p className="mb-3 text-sm text-text-secondary">
          Excluir sua conta apaga todos os seus trades, checklist e histórico de forma real e
          definitiva. Não tem como desfazer.
        </p>
        <DeleteAccountForm />
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-text-primary">Verificação em duas etapas (2FA)</h2>
        <TwoFactorSection initialEnabled={Boolean(totpFactor)} initialFactorId={totpFactor?.id ?? null} />
      </Card>
    </div>
  );
}
