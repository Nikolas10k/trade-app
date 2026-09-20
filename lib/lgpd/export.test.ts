import { describe, expect, it } from "vitest";
import { tradesToCsv } from "./export";
import type { Database } from "@/lib/db/database.types";

type Trade = Database["public"]["Tables"]["trades"]["Row"];

function makeTrade(overrides: Partial<Trade>): Trade {
  return {
    id: "t1",
    user_id: "u1",
    traded_at: "2024-06-01T10:00:00Z",
    symbol: "XAU/USD",
    account_balance: 10000,
    entry_price: 2345.6,
    stop_price: 2343.1,
    ref_channel_pips: 100,
    lot_size: 0.1,
    target_pct: 100,
    exit_type: "cheio",
    result_total: 50,
    pip_value: 0.1,
    checklist: {},
    discipline_score: 90,
    created_at: "2024-06-01T10:00:00Z",
    updated_at: "2024-06-01T10:00:00Z",
    ...overrides,
  };
}

describe("tradesToCsv", () => {
  it("gera cabeçalho e uma linha por trade", () => {
    const csv = tradesToCsv([makeTrade({})]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe(
      "id,traded_at,symbol,account_balance,entry_price,stop_price,ref_channel_pips,lot_size,target_pct,exit_type,result_total,pip_value,discipline_score",
    );
    expect(lines[1]).toContain("t1");
    expect(lines[1]).toContain("XAU/USD");
  });

  it("lista vazia gera só o cabeçalho", () => {
    const csv = tradesToCsv([]);
    expect(csv.split("\n")).toHaveLength(1);
  });

  it("valores nulos viram campo vazio, sem quebrar o CSV", () => {
    const csv = tradesToCsv([makeTrade({ ref_channel_pips: null, target_pct: null, discipline_score: null })]);
    const dataLine = csv.split("\n")[1];
    expect(dataLine.split(",")).toHaveLength(13);
  });
});
