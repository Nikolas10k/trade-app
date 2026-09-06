import { describe, expect, it } from "vitest";
import { ALL_CHECKLIST_KEYS, MANAGEMENT_KEYS, PRE_TRADE_KEYS } from "@/lib/checklist/keys";
import { disciplineScore } from "./discipline";

function checklistOf(keys: readonly string[]) {
  return Object.fromEntries(keys.map((k) => [k, true]));
}

describe("checklist keys", () => {
  it("tem 13 chaves no total, 10 pré-trade + 3 gestão", () => {
    expect(ALL_CHECKLIST_KEYS).toHaveLength(13);
    expect(PRE_TRADE_KEYS).toHaveLength(10);
    expect(MANAGEMENT_KEYS).toHaveLength(3);
  });
});

describe("disciplineScore", () => {
  it("checklist completo + risco dentro do limite = 100", () => {
    const score = disciplineScore({
      checklist: checklistOf(ALL_CHECKLIST_KEYS),
      riskPct: 1,
      riskLimitPct: 1.5,
    });
    expect(score).toBe(100);
  });

  it("checklist vazio + risco no dobro do limite = 0", () => {
    const score = disciplineScore({
      checklist: {},
      riskPct: 3,
      riskLimitPct: 1.5,
    });
    expect(score).toBe(0);
  });

  it("checklist completo mas risco no dobro do limite: componente de risco zera (70)", () => {
    const score = disciplineScore({
      checklist: checklistOf(ALL_CHECKLIST_KEYS),
      riskPct: 3,
      riskLimitPct: 1.5,
    });
    // 100 * (0.40*1 + 0.30*1 + 0.30*0) = 70
    expect(score).toBe(70);
  });

  it("completude parcial pondera Cpre (10) e Cges (3) separadamente", () => {
    const checklist = checklistOf([...PRE_TRADE_KEYS.slice(0, 5), ...MANAGEMENT_KEYS.slice(0, 2)]);
    const score = disciplineScore({ checklist, riskPct: 1, riskLimitPct: 1.5 });
    // Cpre=5/10=0.5, Cges=2/3, R=1 => 100*(0.4*0.5 + 0.3*(2/3) + 0.3*1) = 100*(0.2+0.2+0.3)=70
    expect(score).toBe(70);
  });

  it("risco entre o limite e 2x o limite decai linearmente", () => {
    const score = disciplineScore({
      checklist: checklistOf(ALL_CHECKLIST_KEYS),
      riskPct: 2.25, // 1.5x o limite de 1.5
      riskLimitPct: 1.5,
    });
    // R = 1 - (2.25-1.5)/1.5 = 0.5 => 100*(0.4+0.3+0.3*0.5) = 85
    expect(score).toBe(85);
  });

  it("ignora chaves desconhecidas no objeto de checklist", () => {
    const score = disciplineScore({
      checklist: { ...checklistOf(ALL_CHECKLIST_KEYS), chave_invalida: true },
      riskPct: 1,
      riskLimitPct: 1.5,
    });
    expect(score).toBe(100);
  });
});
