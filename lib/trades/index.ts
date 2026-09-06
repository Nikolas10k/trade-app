import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import type { TradeFormInput } from "@/lib/validation/trade";

type Client = SupabaseClient<Database>;

export const DEFAULT_SYMBOL = "XAU/USD";

/** Instrumento do usuário logado (pip_value vigente) — RLS garante que é só o dele. */
export async function getUserInstrument(supabase: Client, symbol: string = DEFAULT_SYMBOL) {
  const { data, error } = await supabase
    .from("instruments")
    .select("pip_value, symbol")
    .eq("symbol", symbol)
    .single();
  if (error) throw error;
  return data;
}

export async function getTrade(supabase: Client, tradeId: string) {
  const { data, error } = await supabase.from("trades").select("*").eq("id", tradeId).single();
  if (error) throw error;
  return data;
}

function toInsertRow(input: TradeFormInput, pipValue: number, symbol: string, disciplineScore: number) {
  return {
    traded_at: input.tradedAt,
    symbol,
    account_balance: input.accountBalance,
    entry_price: input.entryPrice,
    stop_price: input.stopPrice,
    ref_channel_pips: input.refChannelPips ?? null,
    lot_size: input.lotSize,
    target_pct: input.targetPct ?? null,
    exit_type: input.exitType,
    result_total: input.resultTotal,
    pip_value: pipValue,
    checklist: input.checklist,
    discipline_score: disciplineScore,
  };
}

export async function createTrade(
  supabase: Client,
  input: TradeFormInput,
  pipValue: number,
  disciplineScore: number,
  symbol: string = DEFAULT_SYMBOL,
) {
  const { data, error } = await supabase
    .from("trades")
    .insert(toInsertRow(input, pipValue, symbol, disciplineScore))
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function updateTrade(
  supabase: Client,
  tradeId: string,
  input: TradeFormInput,
  disciplineScore: number,
) {
  const { data, error } = await supabase
    .from("trades")
    .update({
      traded_at: input.tradedAt,
      account_balance: input.accountBalance,
      entry_price: input.entryPrice,
      stop_price: input.stopPrice,
      ref_channel_pips: input.refChannelPips ?? null,
      lot_size: input.lotSize,
      target_pct: input.targetPct ?? null,
      exit_type: input.exitType,
      result_total: input.resultTotal,
      checklist: input.checklist,
      discipline_score: disciplineScore,
    })
    .eq("id", tradeId)
    .select("id")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTrade(supabase: Client, tradeId: string) {
  const { error } = await supabase.from("trades").delete().eq("id", tradeId);
  if (error) throw error;
}
