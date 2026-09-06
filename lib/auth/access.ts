import { getUser } from "./session";
import { createClient } from "@/lib/db/supabase-server";

export type SubscriptionStatus = "trial" | "active" | "past_due" | "canceled";

export type SubscriptionForAccess = {
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
  comp_until: string | null;
};

export type AccessState = {
  readOnly: boolean;
  status: SubscriptionStatus;
  isSuspended: boolean;
};

/**
 * Regra pura de acesso (S6): readOnly=false só quando trial vigente, ou
 * assinatura ativa vigente, ou cortesia (comp_until) vigente — e NUNCA
 * quando a conta está suspensa, independente de qualquer outra condição.
 *
 * Esta é a MESMA regra reforçada em supabase/migrations/*_paywall_rls.sql
 * (função has_write_access, usada nas policies de insert/update de
 * `trades`) — defesa em profundidade contra alguém escrever direto na API
 * do Supabase sem passar por este guard. Mudou a regra aqui? Muda lá também.
 */
export function computeAccessState(
  subscription: SubscriptionForAccess | null,
  isSuspended: boolean,
  now: Date,
): AccessState {
  if (isSuspended) {
    return { readOnly: true, status: subscription?.status ?? "canceled", isSuspended: true };
  }

  const trialActive =
    subscription?.status === "trial" &&
    subscription.trial_ends_at !== null &&
    now <= new Date(subscription.trial_ends_at);

  const subscriptionActive =
    subscription?.status === "active" &&
    subscription.current_period_end !== null &&
    now <= new Date(subscription.current_period_end);

  const compActive = subscription?.comp_until !== null && subscription?.comp_until !== undefined && now <= new Date(subscription.comp_until);

  const readOnly = !(trialActive || subscriptionActive || compActive);

  return { readOnly, status: subscription?.status ?? "canceled", isSuspended: false };
}

/**
 * Guard server-side revalidado a cada chamada — nunca decidido no cliente
 * (0.2 / 11.E.1-2). Busca sempre o estado atual do banco, nunca aceita o
 * estado vindo do formulário/requisição.
 */
export async function getAccessState(): Promise<AccessState> {
  const user = await getUser();
  if (!user) {
    return { readOnly: true, status: "canceled", isSuspended: true };
  }

  const supabase = await createClient();
  const [{ data: subscription }, { data: profile }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("status, trial_ends_at, current_period_end, comp_until")
      .eq("user_id", user.id)
      .single(),
    supabase.from("profiles").select("is_suspended").eq("id", user.id).single(),
  ]);

  return computeAccessState(subscription, profile?.is_suspended ?? false, new Date());
}
