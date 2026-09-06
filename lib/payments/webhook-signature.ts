import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Validação da assinatura de webhooks da Mercado Pago (header `x-signature`).
 *
 * Reconstruído a partir da documentação pública (não presumido de memória —
 * Seção 1), mas SEM acesso a um sandbox real da Mercado Pago nesta sessão
 * para confirmar contra uma entrega de exemplo. Antes do go-live (Seção 14),
 * validar com o simulador de webhooks do painel da Mercado Pago:
 *   - normalização exata de `dataId` (hoje: lowercase);
 *   - nome exato do parâmetro de query que carrega o id do recurso
 *     (hoje: `data.id`, conforme documentado para notificações de pagamento —
 *     confirmar que o mesmo vale para eventos de assinatura/preapproval).
 */

export type XSignatureParts = { ts: string; v1: string };

/** `x-signature: ts=1742505638683,v1=<hmac hex>` */
export function parseXSignature(header: string): XSignatureParts | null {
  const parts: Record<string, string> = {};
  for (const pair of header.split(",")) {
    const [key, value] = pair.split("=");
    if (key && value) {
      parts[key.trim()] = value.trim();
    }
  }
  if (!parts.ts || !parts.v1) return null;
  return { ts: parts.ts, v1: parts.v1 };
}

export function buildSignatureManifest(params: { dataId: string; requestId: string; ts: string }): string {
  return `id:${params.dataId.toLowerCase()};request-id:${params.requestId};ts:${params.ts};`;
}

export function verifyWebhookSignature(params: {
  xSignatureHeader: string | null;
  xRequestId: string | null;
  dataId: string | null;
  secret: string;
}): boolean {
  const { xSignatureHeader, xRequestId, dataId, secret } = params;
  if (!xSignatureHeader || !xRequestId || !dataId || !secret) return false;

  const parsed = parseXSignature(xSignatureHeader);
  if (!parsed) return false;

  const manifest = buildSignatureManifest({ dataId, requestId: xRequestId, ts: parsed.ts });
  const expectedHex = createHmac("sha256", secret).update(manifest).digest("hex");

  const expected = Buffer.from(expectedHex, "utf8");
  const actual = Buffer.from(parsed.v1, "utf8");
  if (expected.length !== actual.length) return false;

  return timingSafeEqual(expected, actual);
}
