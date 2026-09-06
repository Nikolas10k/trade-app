import { describe, expect, it } from "vitest";
import { riskPctOfBalance } from "./risk-pct";

describe("riskPctOfBalance", () => {
  it("calcula o risco em % do saldo assumindo 100 oz por lote", () => {
    // distância = 2.50; dinheiro em risco = 2.50 * 100 * 0.10 = 25; 25/10000 = 0.25%
    const pct = riskPctOfBalance({
      entryPrice: 2345.6,
      stopPrice: 2343.1,
      lotSize: 0.1,
      accountBalance: 10000,
    });
    expect(pct.toNumber()).toBe(0.25);
  });

  it("escala linearmente com o tamanho do lote", () => {
    const pct = riskPctOfBalance({
      entryPrice: 2345.6,
      stopPrice: 2343.1,
      lotSize: 1,
      accountBalance: 10000,
    });
    expect(pct.toNumber()).toBe(2.5);
  });

  it("retorna 0 se o saldo da conta for zero (evita divisão por zero)", () => {
    const pct = riskPctOfBalance({
      entryPrice: 2345.6,
      stopPrice: 2343.1,
      lotSize: 0.1,
      accountBalance: 0,
    });
    expect(pct.toNumber()).toBe(0);
  });
});
