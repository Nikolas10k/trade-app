import { describe, expect, it } from "vitest";
import { computeAccessState, type SubscriptionForAccess } from "./access";

const now = new Date("2024-06-15T12:00:00Z");

function sub(overrides: Partial<SubscriptionForAccess>): SubscriptionForAccess {
  return {
    status: "trial",
    trial_ends_at: null,
    current_period_end: null,
    comp_until: null,
    ...overrides,
  };
}

describe("computeAccessState", () => {
  it("trial vigente => acesso completo", () => {
    const state = computeAccessState(sub({ status: "trial", trial_ends_at: "2024-06-20T00:00:00Z" }), false, now);
    expect(state.readOnly).toBe(false);
  });

  it("trial expirado => somente leitura", () => {
    const state = computeAccessState(sub({ status: "trial", trial_ends_at: "2024-06-01T00:00:00Z" }), false, now);
    expect(state.readOnly).toBe(true);
  });

  it("assinatura ativa vigente => acesso completo", () => {
    const state = computeAccessState(
      sub({ status: "active", current_period_end: "2024-07-01T00:00:00Z" }),
      false,
      now,
    );
    expect(state.readOnly).toBe(false);
  });

  it("assinatura ativa vencida (past current_period_end) => somente leitura", () => {
    const state = computeAccessState(
      sub({ status: "active", current_period_end: "2024-06-01T00:00:00Z" }),
      false,
      now,
    );
    expect(state.readOnly).toBe(true);
  });

  it("cortesia (comp_until) vigente dá acesso mesmo com assinatura cancelada", () => {
    const state = computeAccessState(sub({ status: "canceled", comp_until: "2024-07-01T00:00:00Z" }), false, now);
    expect(state.readOnly).toBe(false);
  });

  it("past_due sem cortesia => somente leitura", () => {
    const state = computeAccessState(sub({ status: "past_due" }), false, now);
    expect(state.readOnly).toBe(true);
  });

  it("conta suspensa é SEMPRE somente leitura, mesmo com assinatura ativa vigente ou cortesia", () => {
    const withActive = computeAccessState(
      sub({ status: "active", current_period_end: "2024-07-01T00:00:00Z" }),
      true,
      now,
    );
    const withComp = computeAccessState(sub({ status: "canceled", comp_until: "2024-12-31T00:00:00Z" }), true, now);
    expect(withActive.readOnly).toBe(true);
    expect(withComp.readOnly).toBe(true);
  });

  it("sem assinatura nenhuma (null) => somente leitura", () => {
    const state = computeAccessState(null, false, now);
    expect(state.readOnly).toBe(true);
  });

  it("nenhum estado forjável pelo cliente muda o resultado — a função só olha o que vem do banco", () => {
    // Mesmo que alguém monte um objeto "subscription" arbitrário tentando simular
    // status='active' sem current_period_end, a regra exige a data também.
    const state = computeAccessState(sub({ status: "active", current_period_end: null }), false, now);
    expect(state.readOnly).toBe(true);
  });
});
