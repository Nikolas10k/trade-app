import { describe, expect, it } from "vitest";
import { formatMoney, toMoney, toPrice } from "./money";

describe("toMoney / toPrice", () => {
  it("arredonda dinheiro para 2 casas", () => {
    expect(toMoney(10000.005).toFixed(2)).toBe("10000.01");
  });

  it("arredonda preço para 5 casas", () => {
    expect(toPrice(2345.123456).toFixed(5)).toBe("2345.12346");
  });

  it("absorve o ruído de ponto flutuante do transporte JSON sem perder o valor original", () => {
    // 10000.55 chega como 10000.549999999999... após um round-trip JSON típico.
    expect(toMoney(10000.549999999999).toFixed(2)).toBe("10000.55");
  });
});

describe("formatMoney", () => {
  it("formata em BRL", () => {
    expect(formatMoney(1234.5)).toContain("1.234,50");
  });
});
