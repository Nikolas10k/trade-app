import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.MP_WEBHOOK_SECRET = "test-secret";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

function makeRequest(opts: { url: string; headers?: Record<string, string>; body?: unknown }) {
  return new NextRequest(opts.url, {
    method: "POST",
    headers: opts.headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
}

describe("POST /api/mp/webhook — validação de assinatura", () => {
  it("rejeita sem data.id (400) antes mesmo de olhar a assinatura", async () => {
    const req = makeRequest({ url: "https://app.example.com/api/mp/webhook?type=subscription_preapproval" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejeita quando não há header x-signature (401) — nenhum efeito colateral", async () => {
    const req = makeRequest({
      url: "https://app.example.com/api/mp/webhook?data.id=abc123&type=subscription_preapproval",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejeita uma assinatura forjada com segredo errado (401)", async () => {
    // Assinada com um segredo diferente do configurado no servidor (MP_WEBHOOK_SECRET).
    const req = makeRequest({
      url: "https://app.example.com/api/mp/webhook?data.id=abc123&type=subscription_preapproval",
      headers: {
        "x-signature": "ts=1111,v1=0000000000000000000000000000000000000000000000000000000000000000",
        "x-request-id": "req-1",
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("nunca chega a instanciar o client de banco quando a assinatura é inválida", async () => {
    // Sem SUPABASE_URL/SERVICE_ROLE_KEY configurados: se o handler tentasse
    // criar o admin client antes de validar a assinatura, isso lançaria uma
    // exceção não tratada em vez de devolver 401 normalmente.
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const req = makeRequest({
      url: "https://app.example.com/api/mp/webhook?data.id=abc123&type=subscription_preapproval",
      headers: { "x-signature": "ts=1,v1=x", "x-request-id": "r" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
