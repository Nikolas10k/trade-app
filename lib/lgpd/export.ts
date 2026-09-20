import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";

type Client = SupabaseClient<Database>;

export type UserDataExport = {
  exportedAt: string;
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null;
  instruments: Database["public"]["Tables"]["instruments"]["Row"][];
  subscription: Database["public"]["Tables"]["subscriptions"]["Row"] | null;
  trades: Database["public"]["Tables"]["trades"]["Row"][];
  screenTimeLogs: Database["public"]["Tables"]["screen_time_logs"]["Row"][];
};

/**
 * Só usa o client comum (RLS de dono) — cada usuário só consegue exportar
 * os próprios dados, nunca precisa de service role para isso.
 */
export async function exportUserData(supabase: Client, userId: string): Promise<UserDataExport> {
  const [{ data: profile }, { data: instruments }, { data: subscription }, { data: trades }, { data: screenTimeLogs }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("instruments").select("*").eq("user_id", userId),
      supabase.from("subscriptions").select("*").eq("user_id", userId).single(),
      supabase.from("trades").select("*").eq("user_id", userId).order("traded_at", { ascending: true }),
      supabase.from("screen_time_logs").select("*").eq("user_id", userId).order("logged_date", { ascending: true }),
    ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: profile ?? null,
    instruments: instruments ?? [],
    subscription: subscription ?? null,
    trades: trades ?? [],
    screenTimeLogs: screenTimeLogs ?? [],
  };
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** CSV só dos trades — é o dado tabular; perfil/assinatura ficam só no JSON. */
export function tradesToCsv(trades: Database["public"]["Tables"]["trades"]["Row"][]): string {
  const columns: (keyof Database["public"]["Tables"]["trades"]["Row"])[] = [
    "id",
    "traded_at",
    "symbol",
    "account_balance",
    "entry_price",
    "stop_price",
    "ref_channel_pips",
    "lot_size",
    "target_pct",
    "exit_type",
    "result_total",
    "pip_value",
    "discipline_score",
  ];

  const header = columns.join(",");
  const rows = trades.map((trade) => columns.map((col) => csvEscape(trade[col])).join(","));
  return [header, ...rows].join("\n");
}
