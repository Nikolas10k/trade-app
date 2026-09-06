import { NextResponse, type NextRequest } from "next/server";
import { getMpWebhookSecret } from "@/lib/db/env";
import { createAdminClient } from "@/lib/db/supabase-admin";
import {
  getPreapproval,
  mapMpStatusToSubscriptionStatus,
  resolvePlanKeyFromPreapprovalPlanId,
} from "@/lib/payments/mercadopago";
import { verifyWebhookSignature } from "@/lib/payments/webhook-signature";

/**
 * Webhook da Mercado Pago (assinaturas). Endpoint público, mas toda
 * requisição sem assinatura válida é descartada sem efeito (S7).
 *
 * Verificação de assinatura reconstruída da documentação pública sem acesso
 * a um sandbox real nesta sessão — ver o aviso em
 * /lib/payments/webhook-signature.ts. Validar com o simulador de webhooks da
 * Mercado Pago antes do go-live (Seção 14).
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const xSignatureHeader = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  if (!dataId) {
    return NextResponse.json({ error: "missing data.id" }, { status: 400 });
  }

  let secret: string;
  try {
    secret = getMpWebhookSecret();
  } catch {
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  const validSignature = verifyWebhookSignature({ xSignatureHeader, xRequestId, dataId, secret });
  if (!validSignature) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let body: { id?: string | number; type?: string; topic?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Alguns testes de notificação da própria Mercado Pago enviam corpo vazio.
  }
  const eventType = body.type ?? body.topic ?? "unknown";
  const eventId = body.id !== undefined ? String(body.id) : `${eventType}:${dataId}:${xRequestId}`;

  const admin = createAdminClient();

  // Idempotência: se o evento já foi processado, é um no-op (S7).
  const { data: insertedEvent, error: insertError } = await admin
    .from("payment_events")
    .upsert({ id: eventId, event_type: eventType, preapproval_id: dataId }, { onConflict: "id", ignoreDuplicates: true })
    .select("id");

  if (insertError) {
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
  if (!insertedEvent || insertedEvent.length === 0) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    const preapproval = await getPreapproval(dataId);
    const status = mapMpStatusToSubscriptionStatus(preapproval.status);
    const targetUserId = preapproval.external_reference;

    if (status && targetUserId) {
      const plan = resolvePlanKeyFromPreapprovalPlanId(preapproval.preapproval_plan_id);

      const { error: updateError } = await admin
        .from("subscriptions")
        .update({
          status,
          plan,
          mp_preapproval_id: preapproval.id,
          mp_payer_id: preapproval.payer_id !== null ? String(preapproval.payer_id) : null,
          current_period_end: preapproval.next_payment_date ?? null,
        })
        .eq("user_id", targetUserId);

      if (updateError) throw updateError;

      await admin.from("audit_log").insert({
        actor_id: null,
        user_id: targetUserId,
        action: "plan_change",
        metadata: { status, plan, source: "mp_webhook" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Erro transitório (API da Mercado Pago ou banco) depois de já termos
    // marcado o evento como visto: desfaz essa marca para que o reenvio da
    // Mercado Pago (ela tenta de novo em cima de 5xx) não seja tratado como
    // duplicata e a atualização de verdade nunca aconteça.
    await admin.from("payment_events").delete().eq("id", eventId);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
