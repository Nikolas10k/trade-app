import { describe, expect, it } from "vitest";
import { computeAdminKpis } from "./kpis";
import type { AdminUserRow } from "./users";

const NOW = new Date("2024-06-15T12:00:00Z");

function makeUser(overrides: Partial<AdminUserRow> = {}): AdminUserRow {
  return {
    id: "u1",
    email: "user@example.com",
    createdAt: "2024-01-01T00:00:00Z",
    emailConfirmed: true,
    status: "trial",
    plan: null,
    trialEndsAt: null,
    currentPeriodEnd: null,
    compUntil: null,
    isSuspended: false,
    ...overrides,
  };
}

describe("computeAdminKpis", () => {
  it("retorna tudo zerado para lista vazia", () => {
    const kpis = computeAdminKpis([], NOW);
    expect(kpis.totalUsers).toBe(0);
    expect(kpis.byStatus).toEqual({ trial: 0, active: 0, past_due: 0, canceled: 0 });
    expect(kpis.byPlan).toEqual({ mensal: 0, trimestral: 0, anual: 0 });
    expect(kpis.suspendedCount).toBe(0);
    expect(kpis.mrrEstimateBRL.toNumber()).toBe(0);
    expect(kpis.trialsEndingSoon).toBe(0);
    expect(kpis.newSignups).toEqual({ 7: 0, 30: 0 });
  });

  it("conta usuários por status e por plano", () => {
    const users = [
      makeUser({ status: "trial", plan: null }),
      makeUser({ status: "active", plan: "mensal" }),
      makeUser({ status: "active", plan: "anual" }),
      makeUser({ status: "past_due", plan: "trimestral" }),
      makeUser({ status: "canceled", plan: "mensal" }),
    ];
    const kpis = computeAdminKpis(users, NOW);
    expect(kpis.totalUsers).toBe(5);
    expect(kpis.byStatus).toEqual({ trial: 1, active: 2, past_due: 1, canceled: 1 });
    expect(kpis.byPlan).toEqual({ mensal: 2, trimestral: 1, anual: 1 });
  });

  it("soma o MRR estimado só das assinaturas active, não past_due nem canceled", () => {
    const users = [
      makeUser({ status: "active", plan: "mensal" }), // 14.99
      makeUser({ status: "active", plan: "anual" }), // 129/12 = 10.75
      makeUser({ status: "past_due", plan: "mensal" }), // não conta
      makeUser({ status: "canceled", plan: "anual" }), // não conta
    ];
    const kpis = computeAdminKpis(users, NOW);
    expect(kpis.mrrEstimateBRL.toFixed(2)).toBe("25.74");
  });

  it("conta contas suspensas independente do status da assinatura", () => {
    const users = [
      makeUser({ isSuspended: true }),
      makeUser({ isSuspended: true, status: "active", plan: "mensal" }),
      makeUser({ isSuspended: false }),
    ];
    expect(computeAdminKpis(users, NOW).suspendedCount).toBe(2);
  });

  describe("trialsEndingSoon", () => {
    it("conta trial terminando dentro dos próximos 7 dias (incluindo as bordas)", () => {
      const users = [
        makeUser({ status: "trial", trialEndsAt: NOW.toISOString() }), // agora mesmo — conta
        makeUser({ status: "trial", trialEndsAt: "2024-06-22T12:00:00Z" }), // exatamente 7 dias — conta
      ];
      expect(computeAdminKpis(users, NOW).trialsEndingSoon).toBe(2);
    });

    it("não conta trial que já terminou nem trial terminando depois de 7 dias", () => {
      const users = [
        makeUser({ status: "trial", trialEndsAt: "2024-06-14T12:00:00Z" }), // ontem
        makeUser({ status: "trial", trialEndsAt: "2024-06-23T00:00:00Z" }), // mais de 7 dias
      ];
      expect(computeAdminKpis(users, NOW).trialsEndingSoon).toBe(0);
    });

    it("ignora trial_ends_at de quem não está mais em trial", () => {
      const users = [makeUser({ status: "active", plan: "mensal", trialEndsAt: NOW.toISOString() })];
      expect(computeAdminKpis(users, NOW).trialsEndingSoon).toBe(0);
    });
  });

  describe("newSignups", () => {
    it("conta cadastros dentro das janelas de 7 e 30 dias", () => {
      const users = [
        makeUser({ createdAt: "2024-06-14T12:00:00Z" }), // 1 dia atrás — nas duas janelas
        makeUser({ createdAt: "2024-05-20T12:00:00Z" }), // ~26 dias atrás — só nos 30
        makeUser({ createdAt: "2024-01-01T00:00:00Z" }), // fora das duas
      ];
      const kpis = computeAdminKpis(users, NOW);
      expect(kpis.newSignups[7]).toBe(1);
      expect(kpis.newSignups[30]).toBe(2);
    });
  });
});
