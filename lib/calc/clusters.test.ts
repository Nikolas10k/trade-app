import { describe, expect, it } from "vitest";
import { clusterRegions, type ClusterTrade } from "./clusters";

const FIXED_DATASET: ClusterTrade[] = [
  { id: "a", entryPrice: 2340.0, exitType: "cheio" },
  { id: "b", entryPrice: 2345.0, exitType: "parcial" },
  { id: "c", entryPrice: 2349.0, exitType: "loss" },
  { id: "d", entryPrice: 2400.0, exitType: "cheio" },
  { id: "e", entryPrice: 2405.0, exitType: "0x0" },
];

describe("clusterRegions", () => {
  it("agrupa entradas a até 100 pips (pip_value 0.10) por encadeamento", () => {
    const zones = clusterRegions(FIXED_DATASET, 100, 0.1);

    expect(zones).toHaveLength(2);

    const [zoneAbc, zoneDe] = zones;
    expect(zoneAbc.occurrences).toBe(3);
    expect(zoneAbc.tradeIds.sort()).toEqual(["a", "b", "c"]);
    expect(zoneAbc.avgPrice.toNumber()).toBeCloseTo((2340 + 2345 + 2349) / 3, 5);
    // 2 decididos-ganhos (cheio, parcial) e 1 loss => 2/3
    expect(zoneAbc.winRate?.toNumber()).toBeCloseTo((2 / 3) * 100, 5);

    expect(zoneDe.occurrences).toBe(2);
    expect(zoneDe.tradeIds.sort()).toEqual(["d", "e"]);
    // 0x0 não conta nem como acerto nem como erro — só "d" (cheio) decide.
    expect(zoneDe.winRate?.toNumber()).toBe(100);
  });

  it("ordena as zonas por recorrência (mais ocorrências primeiro)", () => {
    const zones = clusterRegions(FIXED_DATASET, 100, 0.1);
    expect(zones[0].occurrences).toBeGreaterThanOrEqual(zones[1].occurrences);
  });

  it("distância exatamente igual ao limite ainda entra na mesma zona (<=)", () => {
    const zones = clusterRegions(
      [
        { id: "x", entryPrice: 2000.0, exitType: "cheio" },
        { id: "y", entryPrice: 2010.0, exitType: "cheio" }, // exatamente 100 pips a 0.10
      ],
      100,
      0.1,
    );
    expect(zones).toHaveLength(1);
    expect(zones[0].occurrences).toBe(2);
  });

  it("zona só com 0x0 tem win rate nulo (sem trade decidido)", () => {
    const zones = clusterRegions(
      [{ id: "z", entryPrice: 2000.0, exitType: "0x0" }],
      100,
      0.1,
    );
    expect(zones[0].winRate).toBeNull();
  });

  it("lista vazia retorna nenhuma zona", () => {
    expect(clusterRegions([], 100, 0.1)).toEqual([]);
  });

  it("respeita spreadPips configurável", () => {
    const trades: ClusterTrade[] = [
      { id: "a", entryPrice: 2340.0, exitType: "cheio" },
      { id: "b", entryPrice: 2345.0, exitType: "cheio" }, // 50 pips a 0.10
    ];
    expect(clusterRegions(trades, 100, 0.1)).toHaveLength(1);
    expect(clusterRegions(trades, 40, 0.1)).toHaveLength(2);
  });
});
