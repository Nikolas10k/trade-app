import { describe, expect, it } from "vitest";
import { monthlyEquivalent, savingsVsMonthly } from "./pricing";

describe("monthlyEquivalent", () => {
  it("mensal é o próprio preço", () => {
    expect(monthlyEquivalent("mensal").toFixed(2)).toBe("14.99");
  });

  it("trimestral divide por 3", () => {
    expect(monthlyEquivalent("trimestral").toFixed(2)).toBe("13.00");
  });

  it("anual divide por 12", () => {
    expect(monthlyEquivalent("anual").toFixed(2)).toBe("10.75");
  });
});

describe("savingsVsMonthly", () => {
  it("mensal não tem economia (null)", () => {
    expect(savingsVsMonthly("mensal")).toBeNull();
  });

  it("trimestral economiza frente a 3x o mensal", () => {
    const result = savingsVsMonthly("trimestral")!;
    // 14.99 * 3 = 44.97; 44.97 - 39.00 = 5.97
    expect(result.amount.toFixed(2)).toBe("5.97");
    expect(result.pct.toNumber()).toBeGreaterThan(0);
    expect(result.pct.toNumber()).toBeLessThan(100);
  });

  it("anual economiza frente a 12x o mensal", () => {
    const result = savingsVsMonthly("anual")!;
    // 14.99 * 12 = 179.88; 179.88 - 129.00 = 50.88
    expect(result.amount.toFixed(2)).toBe("50.88");
    expect(result.pct.toNumber()).toBeCloseTo(28.29, 1);
  });
});
