import Decimal from "decimal.js";

export type DecimalInput = Decimal.Value;

/**
 * Normaliza um valor monetário vindo do Postgres/PostgREST (numeric(14,2), que
 * chega como JSON number) para Decimal, arredondando para 2 casas. O erro de
 * ponto flutuante introduzido no transporte JSON é muito menor que 0.005 para
 * valores nessa escala, então o round-trip é sem perdas — mas dali em diante
 * toda a aritmética financeira usa Decimal, nunca number/float.
 */
export function toMoney(value: DecimalInput): Decimal {
  return new Decimal(value).toDecimalPlaces(2);
}

/** Preço (numeric(14,5)) — mesma lógica de toMoney, com 5 casas decimais. */
export function toPrice(value: DecimalInput): Decimal {
  return new Decimal(value).toDecimalPlaces(5);
}

/** Percentual (numeric(5,2)) — usado para risk_limit_pct, target_pct etc. */
export function toPercent(value: DecimalInput): Decimal {
  return new Decimal(value).toDecimalPlaces(2);
}

/** Converte um Decimal monetário para string decimal exata (para enviar ao Postgres). */
export function moneyToApi(value: Decimal): string {
  return value.toDecimalPlaces(2).toFixed(2);
}

export function priceToApi(value: Decimal): string {
  return value.toDecimalPlaces(5).toFixed(5);
}

export function formatMoney(value: DecimalInput): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    toMoney(value).toNumber(),
  );
}

export function formatPrice(value: DecimalInput): string {
  return toPrice(value).toFixed(2);
}

export function formatPercent(value: DecimalInput): string {
  return `${toPercent(value).toFixed(2)}%`;
}
