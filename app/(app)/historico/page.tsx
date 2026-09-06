import Link from "next/link";
import { formatMoney, priceToPips, windowStartUTC } from "@/lib/calc";
import { ALL_CHECKLIST_KEYS, type ChecklistValue } from "@/lib/checklist/keys";
import { createClient } from "@/lib/db/supabase-server";
import { EXIT_TYPES } from "@/lib/validation/trade";
import { HistoryFilters } from "./filters";

export const metadata = { title: "Histórico — Diário XAU/USD" };

const EXIT_TYPE_LABELS: Record<string, string> = {
  parcial: "Parcial",
  "0x0": "0x0",
  cheio: "Cheio",
  loss: "Loss",
};

function checklistCount(checklist: ChecklistValue | null | undefined) {
  if (!checklist) return 0;
  return ALL_CHECKLIST_KEYS.filter((key) => checklist[key]).length;
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ exitType?: string; period?: string; sort?: string }>;
}) {
  const { exitType, period, sort = "date_desc" } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("timezone").eq("id", user!.id).single();
  const timezone = profile?.timezone ?? "America/Sao_Paulo";

  let query = supabase
    .from("trades")
    .select("id, traded_at, entry_price, stop_price, pip_value, exit_type, result_total, checklist");

  if (exitType && (EXIT_TYPES as readonly string[]).includes(exitType)) {
    query = query.eq("exit_type", exitType as (typeof EXIT_TYPES)[number]);
  }
  if (period) {
    const start = windowStartUTC(Number(period), timezone, new Date());
    query = query.gte("traded_at", start.toISOString());
  }

  const [sortColumn, sortDirection] = sort === "date_desc" || sort === "date_asc" ? ["traded_at", sort] : ["result_total", sort];
  query = query.order(sortColumn, { ascending: sortDirection.endsWith("asc") });

  const { data: trades, error } = await query;
  if (error) {
    throw new Error("Não foi possível carregar o histórico.");
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Histórico</h1>
      <HistoryFilters />

      {trades.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-surface p-8 text-center">
          <p className="mb-4 text-text-secondary">
            Nenhum trade encontrado com esses filtros.
          </p>
          <Link href="/registrar" className="text-sm text-secondary-light hover:underline">
            Registrar um trade
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <ul className="space-y-3 md:hidden">
            {trades.map((trade) => (
              <li key={trade.id}>
                <Link
                  href={`/registrar?id=${trade.id}`}
                  className="block rounded-2xl border border-white/10 bg-surface p-4"
                >
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-text-muted">
                      {new Date(trade.traded_at).toLocaleDateString("pt-BR")}
                    </span>
                    <span className={trade.result_total >= 0 ? "text-success" : "text-danger"}>
                      {formatMoney(trade.result_total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>
                      {trade.entry_price} → {trade.stop_price} (
                      {priceToPips(trade.entry_price, trade.stop_price, trade.pip_value).toFixed(1)} pips)
                    </span>
                    <span>{EXIT_TYPE_LABELS[trade.exit_type]}</span>
                  </div>
                  <div className="mt-1 text-xs text-text-disabled">
                    checklist {checklistCount(trade.checklist as ChecklistValue)}/{ALL_CHECKLIST_KEYS.length}
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-white/10 md:block">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Entrada / Stop</th>
                  <th className="px-4 py-3">Pips</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3">Saída</th>
                  <th className="px-4 py-3">Checklist</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <Link href={`/registrar?id=${trade.id}`} className="block">
                        {new Date(trade.traded_at).toLocaleString("pt-BR")}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {trade.entry_price} / {trade.stop_price}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {priceToPips(trade.entry_price, trade.stop_price, trade.pip_value).toFixed(1)}
                    </td>
                    <td className={`px-4 py-3 font-medium ${trade.result_total >= 0 ? "text-success" : "text-danger"}`}>
                      {formatMoney(trade.result_total)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{EXIT_TYPE_LABELS[trade.exit_type]}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {checklistCount(trade.checklist as ChecklistValue)}/{ALL_CHECKLIST_KEYS.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
