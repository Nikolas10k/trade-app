"use server";

import { redirect } from "next/navigation";
import { disciplineScore, riskPctOfBalance } from "@/lib/calc";
import { ALL_CHECKLIST_KEYS } from "@/lib/checklist/keys";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/db/supabase-server";
import { createTrade, DEFAULT_SYMBOL, getUserInstrument, updateTrade } from "@/lib/trades";
import { tradeFormSchema } from "@/lib/validation/trade";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";

export type TradeActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

function parseChecklist(formData: FormData): Record<string, boolean> {
  return Object.fromEntries(
    ALL_CHECKLIST_KEYS.map((key) => [key, formData.get(`checklist_${key}`) === "on"]),
  );
}

function parseForm(formData: FormData) {
  return tradeFormSchema.safeParse({
    tradedAt: formData.get("tradedAt"),
    accountBalance: formData.get("accountBalance"),
    entryPrice: formData.get("entryPrice"),
    stopPrice: formData.get("stopPrice"),
    refChannelPips: formData.get("refChannelPips") || undefined,
    lotSize: formData.get("lotSize"),
    targetPct: formData.get("targetPct") || undefined,
    exitType: formData.get("exitType"),
    resultTotal: formData.get("resultTotal"),
    checklist: parseChecklist(formData),
  });
}

export async function saveTradeAction(
  _prev: TradeActionState,
  formData: FormData,
): Promise<TradeActionState> {
  const user = await requireUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();
  const tradeId = formData.get("tradeId");

  // Limite de risco e score de disciplina são sempre recalculados no servidor —
  // nunca aceitos do cliente (0.2: nenhum controle/derivação sensível no front).
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("risk_limit_pct")
    .eq("id", user.id)
    .single();
  if (profileError) {
    return { ok: false, message: "Não foi possível salvar o trade. Tente novamente." };
  }

  const riskPct = riskPctOfBalance({
    entryPrice: parsed.data.entryPrice,
    stopPrice: parsed.data.stopPrice,
    lotSize: parsed.data.lotSize,
    accountBalance: parsed.data.accountBalance,
  });
  const score = disciplineScore({
    checklist: parsed.data.checklist,
    riskPct,
    riskLimitPct: profile.risk_limit_pct,
  });

  try {
    if (typeof tradeId === "string" && tradeId) {
      await updateTrade(supabase, tradeId, parsed.data, score);
    } else {
      const instrument = await getUserInstrument(supabase, DEFAULT_SYMBOL);
      await createTrade(supabase, parsed.data, instrument.pip_value, score, DEFAULT_SYMBOL);
    }
  } catch {
    return { ok: false, message: "Não foi possível salvar o trade. Tente novamente." };
  }

  redirect("/registrar?salvo=1");
}
