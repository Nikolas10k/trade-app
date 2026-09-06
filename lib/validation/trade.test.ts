import { describe, expect, it } from "vitest";
import { tradeFormSchema } from "./trade";

const VALID_INPUT = {
  tradedAt: "2024-06-01T10:00",
  accountBalance: "10000",
  entryPrice: "2345.60",
  stopPrice: "2343.10",
  lotSize: "0.10",
  targetPct: "100",
  exitType: "cheio",
  resultTotal: "50",
};

describe("tradeFormSchema — não existe campo para forjar acesso/risco", () => {
  it("campos de autorização enviados junto com o formulário são simplesmente ignorados", () => {
    const parsed = tradeFormSchema.safeParse({
      ...VALID_INPUT,
      // Um cliente malicioso tentando se passar por assinante/admin ou embutir
      // um score de disciplina pronto — nenhum desses campos existe no schema.
      readOnly: false,
      isSuspended: false,
      subscriptionStatus: "active",
      discipline_score: 100,
      riskLimitPct: 999,
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const keys = Object.keys(parsed.data);
      expect(keys).not.toContain("readOnly");
      expect(keys).not.toContain("isSuspended");
      expect(keys).not.toContain("subscriptionStatus");
      expect(keys).not.toContain("discipline_score");
      expect(keys).not.toContain("riskLimitPct");
    }
  });

  it("checklist com chave desconhecida (ex.: tentando injetar um item extra) é rejeitado", () => {
    const parsed = tradeFormSchema.safeParse({
      ...VALID_INPUT,
      checklist: { f1_tendencia: true, chave_forjada: true },
    });
    expect(parsed.success).toBe(false);
  });
});
