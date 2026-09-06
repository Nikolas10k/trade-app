import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildSignatureManifest, parseXSignature, verifyWebhookSignature } from "./webhook-signature";

const SECRET = "test-webhook-secret";

function signManifest(manifest: string, secret: string) {
  return createHmac("sha256", secret).update(manifest).digest("hex");
}

describe("parseXSignature", () => {
  it("extrai ts e v1 do header", () => {
    expect(parseXSignature("ts=1742505638683,v1=abc123")).toEqual({ ts: "1742505638683", v1: "abc123" });
  });

  it("retorna null se faltar ts ou v1", () => {
    expect(parseXSignature("ts=123")).toBeNull();
    expect(parseXSignature("")).toBeNull();
  });
});

describe("buildSignatureManifest", () => {
  it("monta o manifesto no formato documentado, com dataId em minúsculas", () => {
    const manifest = buildSignatureManifest({ dataId: "ABC123", requestId: "req-1", ts: "111" });
    expect(manifest).toBe("id:abc123;request-id:req-1;ts:111;");
  });
});

describe("verifyWebhookSignature", () => {
  it("aceita uma assinatura calculada corretamente com o mesmo segredo", () => {
    const dataId = "129384791";
    const requestId = "bb56a2f1-6aae-46ac-982e-9dcd3581d08e";
    const ts = "1742505638683";
    const manifest = buildSignatureManifest({ dataId, requestId, ts });
    const v1 = signManifest(manifest, SECRET);

    const ok = verifyWebhookSignature({
      xSignatureHeader: `ts=${ts},v1=${v1}`,
      xRequestId: requestId,
      dataId,
      secret: SECRET,
    });
    expect(ok).toBe(true);
  });

  it("rejeita quando o segredo usado para assinar é diferente", () => {
    const dataId = "129384791";
    const requestId = "req-1";
    const ts = "111";
    const manifest = buildSignatureManifest({ dataId, requestId, ts });
    const v1 = signManifest(manifest, "segredo-errado");

    const ok = verifyWebhookSignature({
      xSignatureHeader: `ts=${ts},v1=${v1}`,
      xRequestId: requestId,
      dataId,
      secret: SECRET,
    });
    expect(ok).toBe(false);
  });

  it("rejeita se o dataId foi adulterado após a assinatura", () => {
    const requestId = "req-1";
    const ts = "111";
    const manifest = buildSignatureManifest({ dataId: "original-id", requestId, ts });
    const v1 = signManifest(manifest, SECRET);

    const ok = verifyWebhookSignature({
      xSignatureHeader: `ts=${ts},v1=${v1}`,
      xRequestId: requestId,
      dataId: "id-trocado",
      secret: SECRET,
    });
    expect(ok).toBe(false);
  });

  it("rejeita header ausente ou malformado", () => {
    expect(
      verifyWebhookSignature({ xSignatureHeader: null, xRequestId: "r", dataId: "1", secret: SECRET }),
    ).toBe(false);
    expect(
      verifyWebhookSignature({ xSignatureHeader: "v1=onlyv1", xRequestId: "r", dataId: "1", secret: SECRET }),
    ).toBe(false);
  });
});
