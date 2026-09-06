import { describe, expect, it } from "vitest";
import { riskReward } from "./risk-reward";

describe("riskReward", () => {
  it("calcula R/R planejado = canal ref (pips) / pips do stop", () => {
    const rr = riskReward({
      entryPrice: 2345.6,
      stopPrice: 2343.1, // 25 pips de stop com pip_value 0.10
      refChannelPips: 100,
      pipValue: 0.1,
    });
    expect(rr.toNumber()).toBe(4);
  });

  it("retorna 0 quando o stop tem distância zero (evita divisão por zero)", () => {
    const rr = riskReward({
      entryPrice: 2345.6,
      stopPrice: 2345.6,
      refChannelPips: 100,
      pipValue: 0.1,
    });
    expect(rr.toNumber()).toBe(0);
  });

  it("funciona com stop acima da entrada (venda)", () => {
    const rr = riskReward({
      entryPrice: 2343.1,
      stopPrice: 2345.6,
      refChannelPips: 50,
      pipValue: 0.1,
    });
    expect(rr.toNumber()).toBe(2);
  });
});
