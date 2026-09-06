import Link from "next/link";
import {
  clusterRegions,
  disciplineAverageWindow,
  formatMoney,
  formatPrice,
  screenTimeSumWindow,
  windowStartUTC,
  winRateWindow,
} from "@/lib/calc";
import { getAccessState } from "@/lib/auth/access";
import { createClient } from "@/lib/db/supabase-server";
import { DEFAULT_SYMBOL } from "@/lib/trades";
import { BalanceChart } from "./balance-chart";
import { MetricCard } from "./metric-card";

export const metadata = { title: "Dashboard — Diário XAU/USD" };

const EXIT_TYPE_LABELS: Record<string, string> = {
  parcial: "Parcial",
  "0x0": "0x0",
  cheio: "Cheio",
  loss: "Loss",
};

export default async function DashboardPage() {
  const access = await getAccessState();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: subscription }, { data: trades }, { data: screenLogs }, { data: instrument }] =
    await Promise.all([
      supabase.from("profiles").select("timezone").eq("id", user!.id).single(),
      supabase.from("subscriptions").select("status, trial_ends_at").eq("user_id", user!.id).single(),
      supabase
        .from("trades")
        .select("id, traded_at, account_balance, entry_price, exit_type, discipline_score")
        .order("traded_at", { ascending: true }),
      supabase.from("screen_time_logs").select("logged_date, hours"),
      supabase.from("instruments").select("pip_value").eq("symbol", DEFAULT_SYMBOL).single(),
    ]);

  const timezone = profile?.timezone ?? "America/Sao_Paulo";
  const now = new Date();
  const allTrades = trades ?? [];

  if (allTrades.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-text-primary">Dashboard</h1>
        <div className="rounded-2xl border border-white/10 bg-surface p-8 text-center">
          <p className="mb-4 text-text-secondary">
            Você ainda não registrou nenhum trade — assim que registrar, suas métricas e
            gráficos aparecem aqui.
          </p>
          {access.readOnly ? (
            <Link href="/planos" className="text-sm text-secondary-light hover:underline">
              Sua conta está em modo somente-leitura — ver planos
            </Link>
          ) : (
            <Link href="/registrar" className="text-sm text-secondary-light hover:underline">
              Registrar meu primeiro trade
            </Link>
          )}
        </div>
      </div>
    );
  }

  const winRate15 = winRateWindow(
    allTrades.map((t) => ({ tradedAt: t.traded_at, exitType: t.exit_type })),
    15,
    timezone,
    now,
  );
  const disciplineAvg30 = disciplineAverageWindow(
    allTrades.map((t) => ({ tradedAt: t.traded_at, disciplineScore: t.discipline_score })),
    30,
    timezone,
    now,
  );
  const screenTime30 = screenTimeSumWindow(
    (screenLogs ?? []).map((log) => ({ loggedDate: log.logged_date, hours: log.hours })),
    30,
    timezone,
    now,
  );

  const latestBalance = allTrades[allTrades.length - 1].account_balance;
  const windowStart30 = windowStartUTC(30, timezone, now);
  const baselineTrade = allTrades.find((t) => new Date(t.traded_at) >= windowStart30) ?? allTrades[0];
  const baselineBalance = baselineTrade.account_balance;
  const balanceChangePct =
    baselineBalance !== 0 ? ((latestBalance - baselineBalance) / Math.abs(baselineBalance)) * 100 : null;

  const exitCounts = allTrades.reduce<Record<string, number>>((acc, t) => {
    acc[t.exit_type] = (acc[t.exit_type] ?? 0) + 1;
    return acc;
  }, {});

  const hotZones = instrument
    ? clusterRegions(
        allTrades.map((t) => ({ id: t.id, entryPrice: t.entry_price, exitType: t.exit_type })),
        100,
        instrument.pip_value,
      ).slice(0, 3)
    : [];

  const showTrialBanner = !access.readOnly && subscription?.status === "trial" && subscription.trial_ends_at;

  return (
    <div>
      {access.readOnly ? (
        <div className="mb-6 rounded-xl border border-gold/30 bg-surface px-4 py-3 text-sm text-text-secondary">
          Sua conta está em modo somente-leitura
          {access.isSuspended ? " (conta suspensa)." : " — o período de teste ou a assinatura expirou."}{" "}
          <Link href="/planos" className="text-secondary-light hover:underline">
            Ver planos
          </Link>
        </div>
      ) : showTrialBanner ? (
        <div className="mb-6 rounded-xl bg-gradient-brand px-4 py-3 text-sm text-white">
          Você está no período de teste gratuito até{" "}
          {new Date(subscription!.trial_ends_at!).toLocaleDateString("pt-BR")}.
        </div>
      ) : null}

      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Dashboard</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Saldo"
          value={formatMoney(latestBalance)}
          hint={balanceChangePct !== null ? `${balanceChangePct >= 0 ? "+" : ""}${balanceChangePct.toFixed(1)}% em 30d` : undefined}
        />
        <MetricCard
          label="Assertividade 15d"
          value={winRate15.rate !== null ? `${winRate15.rate.toFixed(0)}%` : "—"}
          hint={`${winRate15.count} trade${winRate15.count === 1 ? "" : "s"}`}
        />
        <MetricCard
          label="Horas de tela 30d"
          value={`${screenTime30.toFixed(1)}h`}
        />
        <MetricCard
          label="Disciplina 30d"
          value={disciplineAvg30 !== null ? disciplineAvg30.toFixed(0) : "—"}
          hint={disciplineAvg30 === null ? "Sem dados suficientes" : undefined}
          gold
        />
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-surface p-6">
        <h2 className="mb-4 font-semibold text-text-primary">Saldo evolutivo</h2>
        <BalanceChart balances={allTrades.map((t) => t.account_balance)} />
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-surface p-6">
          <h2 className="mb-4 font-semibold text-text-primary">Distribuição de saídas</h2>
          <ul className="space-y-2">
            {Object.entries(exitCounts).map(([exitType, count]) => (
              <li key={exitType} className="flex items-center gap-3 text-sm">
                <span className="w-16 text-text-muted">{EXIT_TYPE_LABELS[exitType] ?? exitType}</span>
                <div className="h-2 flex-1 rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-gradient-brand"
                    style={{ width: `${(count / allTrades.length) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-text-secondary">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Zonas quentes</h2>
            <Link href="/zonas-quentes" className="text-xs text-secondary-light hover:underline">
              Ver todas
            </Link>
          </div>
          {hotZones.length === 0 ? (
            <p className="text-sm text-text-muted">Nenhuma zona identificada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {hotZones.map((zone) => (
                <li key={zone.tradeIds.join("-")} className="flex justify-between text-sm">
                  <span className="text-text-primary">{formatPrice(zone.avgPrice)}</span>
                  <span className="text-text-muted">{zone.occurrences} ocorrências</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {access.readOnly ? (
        <span
          title="Conta em modo somente-leitura — assine um plano para registrar trades."
          className="inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-text-disabled"
        >
          Registrar trade
        </span>
      ) : (
        <Link
          href="/registrar"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Registrar trade
        </Link>
      )}
    </div>
  );
}
