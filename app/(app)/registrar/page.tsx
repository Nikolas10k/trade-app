import Link from "next/link";
import { getAccessState } from "@/lib/auth/access";
import { createClient } from "@/lib/db/supabase-server";
import { DEFAULT_SYMBOL, getTrade } from "@/lib/trades";
import { TradeForm } from "./trade-form";

export const metadata = { title: "Registrar trade — Diário XAU/USD" };

export default async function RegisterTradePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; salvo?: string }>;
}) {
  const { id, salvo } = await searchParams;

  const access = await getAccessState();
  if (access.readOnly) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-text-primary">Registrar trade</h1>
        <div className="rounded-2xl border border-gold/30 bg-surface p-8 text-center">
          <p className="mb-4 text-text-secondary">
            Sua conta está em modo somente-leitura
            {access.isSuspended ? " (conta suspensa)." : " — o período de teste ou a assinatura expirou."}
            {" "}Assine um plano para voltar a registrar trades.
          </p>
          <Link
            href="/planos"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
          >
            Ver planos
          </Link>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: instrument }] = await Promise.all([
    supabase.from("profiles").select("risk_limit_pct").eq("id", user!.id).single(),
    supabase.from("instruments").select("pip_value").eq("symbol", DEFAULT_SYMBOL).single(),
  ]);

  const existingTrade = id ? await getTrade(supabase, id) : null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">
        {existingTrade ? "Editar trade" : "Registrar trade"}
      </h1>
      {salvo ? (
        <p className="mb-4 rounded-lg bg-success/10 px-4 py-2 text-sm text-success">
          Trade salvo com sucesso.
        </p>
      ) : null}
      <TradeForm
        riskLimitPct={profile?.risk_limit_pct ?? 1.5}
        pipValue={instrument?.pip_value ?? 0.1}
        trade={existingTrade}
      />
    </div>
  );
}
