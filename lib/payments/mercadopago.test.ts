import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mapMpStatusToSubscriptionStatus, resolvePlanKeyFromPreapprovalPlanId } from "./mercadopago";

describe("mapMpStatusToSubscriptionStatus", () => {
  it("mapeia authorized/paused/cancelled para o nosso enum", () => {
    expect(mapMpStatusToSubscriptionStatus("authorized")).toBe("active");
    expect(mapMpStatusToSubscriptionStatus("paused")).toBe("past_due");
    expect(mapMpStatusToSubscriptionStatus("cancelled")).toBe("canceled");
  });

  it("pending não altera o status atual (retorna null)", () => {
    expect(mapMpStatusToSubscriptionStatus("pending")).toBeNull();
  });
});

describe("resolvePlanKeyFromPreapprovalPlanId", () => {
  const ORIGINAL = { ...process.env };

  beforeEach(() => {
    process.env.MP_PREAPPROVAL_PLAN_MENSAL = "plan-mensal-id";
    process.env.MP_PREAPPROVAL_PLAN_TRIMESTRAL = "plan-trimestral-id";
    process.env.MP_PREAPPROVAL_PLAN_ANUAL = "plan-anual-id";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL };
  });

  it("resolve o plano certo a partir do preapproval_plan_id", () => {
    expect(resolvePlanKeyFromPreapprovalPlanId("plan-trimestral-id")).toBe("trimestral");
  });

  it("retorna null para um id desconhecido", () => {
    expect(resolvePlanKeyFromPreapprovalPlanId("id-desconhecido")).toBeNull();
  });

  it("retorna null para null", () => {
    expect(resolvePlanKeyFromPreapprovalPlanId(null)).toBeNull();
  });
});
