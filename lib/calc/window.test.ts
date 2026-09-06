import { describe, expect, it } from "vitest";
import { disciplineAverageWindow, screenTimeSumWindow, windowStartUTC, winRateWindow } from "./window";

describe("windowStartUTC", () => {
  it("corta 'hoje' no fuso do usuário, não em UTC (America/Sao_Paulo, UTC-3)", () => {
    const now = new Date("2024-01-15T10:00:00Z"); // 07:00 em São Paulo, mesmo dia
    const start = windowStartUTC(15, "America/Sao_Paulo", now);
    // 15 dias = hoje (01/15) + 14 anteriores => começa em 01/01 00:00 -03:00 = 01/01 03:00Z
    expect(start.toISOString()).toBe("2024-01-01T03:00:00.000Z");
  });

  it("o mesmo instante gera um corte diferente num fuso com offset positivo", () => {
    const now = new Date("2024-01-15T10:00:00Z");
    const startTokyo = windowStartUTC(15, "Asia/Tokyo", now); // UTC+9
    expect(startTokyo.toISOString()).toBe("2023-12-31T15:00:00.000Z");
  });
});

describe("winRateWindow — bordas de timezone", () => {
  const now = new Date("2024-01-15T10:00:00Z"); // 07:00 em São Paulo

  it("um trade 1 minuto antes da meia-noite local fica FORA da janela de 15 dias", () => {
    // 2024-01-01T02:59:00Z = 2023-12-31T23:59:00 em São Paulo (véspera do início da janela)
    const trades = [{ tradedAt: "2024-01-01T02:59:00Z", exitType: "cheio" as const }];
    const result = winRateWindow(trades, 15, "America/Sao_Paulo", now);
    expect(result.count).toBe(0);
  });

  it("um trade exatamente na meia-noite local do início da janela fica DENTRO", () => {
    // 2024-01-01T03:00:00Z = 2024-01-01T00:00:00 em São Paulo (início exato da janela)
    const trades = [{ tradedAt: "2024-01-01T03:00:00Z", exitType: "cheio" as const }];
    const result = winRateWindow(trades, 15, "America/Sao_Paulo", now);
    expect(result.count).toBe(1);
  });

  it("se calculado em UTC puro (ignorando o fuso) o resultado seria diferente — prova que o fuso é respeitado", () => {
    // 2024-01-01T01:00:00Z é 2023-12-31 em São Paulo, mas já seria "01/01" se cortado em UTC.
    const trades = [{ tradedAt: "2024-01-01T01:00:00Z", exitType: "cheio" as const }];
    const resultSaoPaulo = winRateWindow(trades, 15, "America/Sao_Paulo", now);
    const resultUTC = winRateWindow(trades, 15, "UTC", now);
    expect(resultSaoPaulo.count).toBe(0);
    expect(resultUTC.count).toBe(1);
  });

  it("0x0 não conta como acerto nem erro dentro da janela", () => {
    const trades = [
      { tradedAt: now.toISOString(), exitType: "cheio" as const },
      { tradedAt: now.toISOString(), exitType: "0x0" as const },
      { tradedAt: now.toISOString(), exitType: "loss" as const },
    ];
    const result = winRateWindow(trades, 15, "America/Sao_Paulo", now);
    expect(result.count).toBe(3);
    expect(result.rate).toBe(50); // 1 win / (1 win + 1 loss), 0x0 fora da conta
  });

  it("sem trades na janela retorna rate null", () => {
    const result = winRateWindow([], 15, "America/Sao_Paulo", now);
    expect(result.rate).toBeNull();
    expect(result.count).toBe(0);
  });
});

describe("screenTimeSumWindow", () => {
  const now = new Date("2024-01-15T10:00:00Z");

  it("soma horas dentro da janela de 30 dias e ignora fora dela", () => {
    const logs = [
      { loggedDate: "2024-01-14", hours: 2 },
      { loggedDate: "2023-11-01", hours: 5 }, // fora da janela de 30 dias
    ];
    expect(screenTimeSumWindow(logs, 30, "America/Sao_Paulo", now)).toBe(2);
  });
});

describe("disciplineAverageWindow", () => {
  const now = new Date("2024-01-15T10:00:00Z");

  it("calcula a média dos scores na janela de 30 dias", () => {
    const trades = [
      { tradedAt: now.toISOString(), disciplineScore: 80 },
      { tradedAt: now.toISOString(), disciplineScore: 60 },
    ];
    expect(disciplineAverageWindow(trades, 30, "America/Sao_Paulo", now)).toBe(70);
  });

  it("retorna null quando não há trades com score na janela", () => {
    expect(disciplineAverageWindow([], 30, "America/Sao_Paulo", now)).toBeNull();
  });
});
