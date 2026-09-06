import { DateTime } from "luxon";

/**
 * Início da janela de `days` dias corridos, com "hoje" cortado no fuso do
 * usuário (não em UTC) — Seção 4.4. Ex.: days=15 inclui hoje + 14 dias
 * anteriores, a partir de 00:00 no fuso informado.
 */
export function windowStartUTC(days: number, timezone: string, now: Date): Date {
  return DateTime.fromJSDate(now, { zone: timezone })
    .startOf("day")
    .minus({ days: days - 1 })
    .toUTC()
    .toJSDate();
}

export type TradeForWindow = { tradedAt: string | Date; exitType: "parcial" | "0x0" | "cheio" | "loss" };
export type WinRateWindowResult = { rate: number | null; count: number };

/** Assertividade (win rate) na janela — 0x0 não conta nem como acerto nem como erro. */
export function winRateWindow(
  trades: TradeForWindow[],
  days: number,
  timezone: string,
  now: Date,
): WinRateWindowResult {
  const start = windowStartUTC(days, timezone, now);
  const inWindow = trades.filter((t) => {
    const tradedAt = typeof t.tradedAt === "string" ? new Date(t.tradedAt) : t.tradedAt;
    return tradedAt >= start && tradedAt <= now;
  });

  const wins = inWindow.filter((t) => t.exitType === "parcial" || t.exitType === "cheio").length;
  const losses = inWindow.filter((t) => t.exitType === "loss").length;
  const decided = wins + losses;

  return { rate: decided > 0 ? (wins / decided) * 100 : null, count: inWindow.length };
}

export type ScreenTimeLogForWindow = { loggedDate: string; hours: number };

/** Soma de horas de tela registradas na janela (Seção 6: horas de tela 30d). */
export function screenTimeSumWindow(
  logs: ScreenTimeLogForWindow[],
  days: number,
  timezone: string,
  now: Date,
): number {
  const start = windowStartUTC(days, timezone, now);
  return logs
    .filter((log) => {
      const logged = DateTime.fromISO(log.loggedDate, { zone: timezone }).startOf("day").toUTC().toJSDate();
      return logged >= start && logged <= now;
    })
    .reduce((sum, log) => sum + log.hours, 0);
}

export type TradeForDisciplineWindow = { tradedAt: string | Date; disciplineScore: number | null };

/**
 * Média do discipline_score na janela de 30 dias (S3.1) — o medidor do
 * dashboard. Sem trades com score na janela: "sem dados suficientes" (null).
 */
export function disciplineAverageWindow(
  trades: TradeForDisciplineWindow[],
  days: number,
  timezone: string,
  now: Date,
): number | null {
  const start = windowStartUTC(days, timezone, now);
  const scores = trades
    .filter((t) => {
      const tradedAt = typeof t.tradedAt === "string" ? new Date(t.tradedAt) : t.tradedAt;
      return tradedAt >= start && tradedAt <= now && t.disciplineScore !== null;
    })
    .map((t) => t.disciplineScore as number);

  if (scores.length === 0) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}
