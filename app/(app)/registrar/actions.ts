"use server";

import { redirect } from "next/navigation";
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
  });
}

export async function saveTradeAction(
  _prev: TradeActionState,
  formData: FormData,
): Promise<TradeActionState> {
  await requireUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();
  const tradeId = formData.get("tradeId");

  try {
    if (typeof tradeId === "string" && tradeId) {
      await updateTrade(supabase, tradeId, parsed.data);
    } else {
      const instrument = await getUserInstrument(supabase, DEFAULT_SYMBOL);
      await createTrade(supabase, parsed.data, instrument.pip_value, DEFAULT_SYMBOL);
    }
  } catch {
    return { ok: false, message: "Não foi possível salvar o trade. Tente novamente." };
  }

  redirect("/registrar?salvo=1");
}
