import Decimal from "decimal.js";
import type { DecimalInput } from "./money";

export type ClusterTrade = {
  id: string;
  entryPrice: DecimalInput;
  exitType: "parcial" | "0x0" | "cheio" | "loss";
};

export type HotZone = {
  avgPrice: Decimal;
  occurrences: number;
  /** % de acerto entre parcial/cheio vs loss. null quando não há trade decidido (só 0x0). */
  winRate: Decimal | null;
  tradeIds: string[];
};

/**
 * Agrupa as entradas de um único usuário em zonas quentes: entradas
 * consecutivas (por preço) a até `spreadPips` de distância caem na mesma
 * zona (clusterização por encadeamento — "single-linkage" 1D). 0x0 não conta
 * como acerto nem erro no win rate da zona.
 */
export function clusterRegions(
  trades: ClusterTrade[],
  spreadPips: number = 100,
  pipValue: DecimalInput,
): HotZone[] {
  if (trades.length === 0) return [];

  const thresholdPrice = new Decimal(pipValue).times(spreadPips);
  const sorted = [...trades].sort((a, b) => new Decimal(a.entryPrice).comparedTo(new Decimal(b.entryPrice)));

  const clusters: ClusterTrade[][] = [];
  let current: ClusterTrade[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prevPrice = new Decimal(current[current.length - 1].entryPrice);
    const price = new Decimal(sorted[i].entryPrice);
    if (price.minus(prevPrice).lessThanOrEqualTo(thresholdPrice)) {
      current.push(sorted[i]);
    } else {
      clusters.push(current);
      current = [sorted[i]];
    }
  }
  clusters.push(current);

  const zones: HotZone[] = clusters.map((clusterTrades) => {
    const sum = clusterTrades.reduce((acc, t) => acc.plus(new Decimal(t.entryPrice)), new Decimal(0));
    const avgPrice = sum.dividedBy(clusterTrades.length);

    const wins = clusterTrades.filter((t) => t.exitType === "parcial" || t.exitType === "cheio").length;
    const losses = clusterTrades.filter((t) => t.exitType === "loss").length;
    const decided = wins + losses;
    const winRate = decided > 0 ? new Decimal(wins).dividedBy(decided).times(100) : null;

    return {
      avgPrice,
      occurrences: clusterTrades.length,
      winRate,
      tradeIds: clusterTrades.map((t) => t.id),
    };
  });

  return zones.sort((a, b) => b.occurrences - a.occurrences);
}
