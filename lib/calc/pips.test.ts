import { describe, expect, it } from "vitest";
import { priceToPips } from "./pips";

describe("priceToPips", () => {
  it("converte a distância de preço em pips usando a convenção do instrumento", () => {
    expect(priceToPips(2345.6, 2343.1, 0.1)).toBe(25);
  });

  it("com pip_value=0.01 a mesma distância vira 250 pips", () => {
    expect(priceToPips(2345.6, 2343.1, 0.01)).toBe(250);
  });

  it("entrada igual ao stop dá 0 pips", () => {
    expect(priceToPips(2345.6, 2345.6, 0.1)).toBe(0);
  });

  it("funciona com stop acima da entrada (venda) — distância sempre positiva", () => {
    expect(priceToPips(2343.1, 2345.6, 0.1)).toBe(25);
  });

  it("preserva precisão com muitas casas decimais", () => {
    expect(priceToPips(2345.12345, 2345.02345, 0.001)).toBeCloseTo(100, 8);
  });
});
