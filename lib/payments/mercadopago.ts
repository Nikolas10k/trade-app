import "server-only";
import { getAppBaseUrl, getMpAccessToken, getMpPreapprovalPlanId } from "@/lib/db/env";

export type PlanKey = "mensal" | "trimestral" | "anual";

const MP_API_BASE = "https://api.mercadopago.com";

export type MpPreapprovalStatus = "pending" | "authorized" | "paused" | "cancelled";

export type MpPreapproval = {
  id: string;
  status: MpPreapprovalStatus;
  external_reference: string | null;
  preapproval_plan_id: string | null;
  payer_id: number | null;
  next_payment_date?: string;
};

async function mpFetch(path: string, init: RequestInit): Promise<Response> {
  const res = await fetch(`${MP_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getMpAccessToken()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  return res;
}

/**
 * Cria uma assinatura (preapproval) vinculada a um plano já existente
 * (criado previamente no painel da Mercado Pago — os ids ficam em
 * MP_PREAPPROVAL_PLAN_*). `external_reference` = user_id (Fase 0), para o
 * webhook identificar o usuário sem depender do e-mail do pagador.
 */
export async function createPreapproval(params: {
  planKey: PlanKey;
  userId: string;
  payerEmail: string;
}): Promise<{ initPoint: string; preapprovalId: string }> {
  const res = await mpFetch("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      preapproval_plan_id: getMpPreapprovalPlanId(params.planKey),
      payer_email: params.payerEmail,
      external_reference: params.userId,
      back_url: `${getAppBaseUrl()}/configuracoes?assinatura=ok`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao criar preapproval na Mercado Pago (status ${res.status}).`);
  }

  const data = (await res.json()) as { id: string; init_point: string };
  return { initPoint: data.init_point, preapprovalId: data.id };
}

/**
 * Busca o estado atual do recurso na API — nunca confiamos só no corpo do
 * webhook para decidir o novo status da assinatura (o id do recurso já
 * validado pela assinatura do webhook é suficiente para buscar a verdade).
 */
export async function getPreapproval(preapprovalId: string): Promise<MpPreapproval> {
  const res = await mpFetch(`/preapproval/${preapprovalId}`, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Falha ao buscar preapproval ${preapprovalId} na Mercado Pago (status ${res.status}).`);
  }
  return (await res.json()) as MpPreapproval;
}

export type OurSubscriptionStatus = "trial" | "active" | "past_due" | "canceled";

/** authorized=pagando em dia; paused=pagamento falhou mas ainda recuperável; cancelled=encerrada. */
export function mapMpStatusToSubscriptionStatus(status: MpPreapprovalStatus): OurSubscriptionStatus | null {
  switch (status) {
    case "authorized":
      return "active";
    case "paused":
      return "past_due";
    case "cancelled":
      return "canceled";
    case "pending":
      return null; // ainda não confirmado — não altera o status atual (continua em trial)
  }
}

export function resolvePlanKeyFromPreapprovalPlanId(preapprovalPlanId: string | null): PlanKey | null {
  if (!preapprovalPlanId) return null;
  const plans: PlanKey[] = ["mensal", "trimestral", "anual"];
  for (const plan of plans) {
    try {
      if (getMpPreapprovalPlanId(plan) === preapprovalPlanId) return plan;
    } catch {
      // env var daquele plano não configurada — ignora.
    }
  }
  return null;
}
