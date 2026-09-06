import { toPrice, type DecimalInput } from "./money";

/**
 * Distância entre entrada e stop, em pips. Não importa a direção do trade
 * (compra: stop < entrada; venda: stop > entrada) — a distância é sempre
 * positiva. entrada === stop retorna 0 (validação de setup inválido é
 * responsabilidade do schema Zod, não desta função pura).
 */
export function priceToPips(
  entryPrice: DecimalInput,
  stopPrice: DecimalInput,
  pipValue: DecimalInput,
): number {
  const distance = toPrice(entryPrice).minus(toPrice(stopPrice)).abs();
  return distance.dividedBy(toPrice(pipValue)).toNumber();
}
