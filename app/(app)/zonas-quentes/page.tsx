import Link from "next/link";
import { clusterRegions, formatPrice } from "@/lib/calc";
import { createClient } from "@/lib/db/supabase-server";
import { DEFAULT_SYMBOL } from "@/lib/trades";

export const metadata = { title: "Zonas quentes — Diário XAU/USD" };

export default async function HotZonesPage() {
  const supabase = await createClient();

  const [{ data: trades, error: tradesError }, { data: instrument, error: instrumentError }] =
    await Promise.all([
      supabase.from("trades").select("id, entry_price, exit_type"),
      supabase.from("instruments").select("pip_value").eq("symbol", DEFAULT_SYMBOL).single(),
    ]);

  if (tradesError || instrumentError) {
    throw new Error("Não foi possível carregar as zonas quentes.");
  }

  const zones = clusterRegions(
    trades.map((t) => ({ id: t.id, entryPrice: t.entry_price, exitType: t.exit_type })),
    100,
    instrument.pip_value,
  );

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">Zonas quentes</h1>
      <p className="mb-6 text-sm text-text-muted">
        Regiões de entrada que se repetem a até 100 pips de distância, ordenadas pelas mais
        recorrentes.
      </p>

      {zones.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-surface p-8 text-center">
          <p className="mb-4 text-text-secondary">
            Nenhum trade registrado ainda — as zonas aparecem aqui assim que você começar a
            registrar entradas.
          </p>
          <Link href="/registrar" className="text-sm text-secondary-light hover:underline">
            Registrar meu primeiro trade
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {zones.map((zone, index) => (
            <li
              key={zone.tradeIds.join("-")}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-surface p-5"
            >
              <div>
                <p className="text-xs text-text-muted">Zona #{index + 1}</p>
                <p className="text-lg font-semibold text-text-primary">
                  {formatPrice(zone.avgPrice)}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-text-secondary">
                  {zone.occurrences} {zone.occurrences === 1 ? "ocorrência" : "ocorrências"}
                </p>
                <p
                  className={
                    zone.winRate === null
                      ? "text-text-muted"
                      : zone.winRate.toNumber() >= 50
                        ? "text-success"
                        : "text-danger"
                  }
                >
                  {zone.winRate === null ? "sem dados de win rate" : `${zone.winRate.toFixed(0)}% win rate`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
