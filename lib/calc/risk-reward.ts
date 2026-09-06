import Decimal from "decimal.js";
import { priceToPips } from "./pips";
import type { DecimalInput } from "./money";

export type RiskRewardInput = {
  entryPrice: DecimalInput;
  stopPrice: DecimalInput;
  refChannelPips: DecimalInput;
  pipValue: DecimalInput;
};

/**
 * R/R planejado = distância do canal de referência (recompensa, em pips) /
 * distância do stop (risco, em pips). Calculável em tempo real no momento do
 * registro, antes de existir resultado/saída. `target_pct`/`exit_type` não
 * entram aqui — eles registram, ao fechar o trade, que fração desse canal foi
 * capturada, não a relação risco/recompensa em si.
 */
export function riskReward({ entryPrice, stopPrice, refChannelPips, pipValue }: RiskRewardInput): Decimal {
  const stopPips = priceToPips(entryPrice, stopPrice, pipValue);
  if (stopPips === 0) {
    return new Decimal(0);
  }
  return new Decimal(refChannelPips).dividedBy(stopPips);
}
