import Decimal from "decimal.js";
import { XAUUSD_CONTRACT_SIZE_OZ } from "./constants";
import { toMoney, toPrice, type DecimalInput } from "./money";

export type RiskPctInput = {
  entryPrice: DecimalInput;
  stopPrice: DecimalInput;
  lotSize: DecimalInput;
  accountBalance: DecimalInput;
};

/**
 * Risco planejado, em % do saldo da conta, assumindo 1.00 lote = 100 oz
 * (convenção MT5 padrão para XAU/USD — ver XAUUSD_CONTRACT_SIZE_OZ).
 * dinheiro_em_risco = distância_do_stop_em_preço × 100oz × lot_size
 */
export function riskPctOfBalance({ entryPrice, stopPrice, lotSize, accountBalance }: RiskPctInput): Decimal {
  const priceDistance = toPrice(entryPrice).minus(toPrice(stopPrice)).abs();
  const moneyAtRisk = priceDistance.times(XAUUSD_CONTRACT_SIZE_OZ).times(lotSize);
  const balance = toMoney(accountBalance);
  if (balance.isZero()) {
    return new Decimal(0);
  }
  return moneyAtRisk.dividedBy(balance).times(100);
}
