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
