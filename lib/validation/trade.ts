import { z } from "zod";
import { checklistSchema } from "./checklist";

export const EXIT_TYPES = ["parcial", "0x0", "cheio", "loss"] as const;

export const tradeFormSchema = z
  .object({
    tradedAt: z.iso.datetime({ local: true, message: "Data/hora inválida." }),
    accountBalance: z.coerce.number().positive("Saldo precisa ser maior que zero."),
    entryPrice: z.coerce.number().positive("Preço de entrada precisa ser maior que zero."),
    stopPrice: z.coerce.number().positive("Preço de stop precisa ser maior que zero."),
    refChannelPips: z.coerce.number().int().nonnegative().optional(),
    lotSize: z.coerce.number().positive("Nº de lote precisa ser maior que zero."),
    targetPct: z.coerce.number().min(0).max(100).optional(),
    exitType: z.enum(EXIT_TYPES, { message: "Selecione o tipo de saída." }),
    resultTotal: z.coerce.number(),
    // O checklist não bloqueia o salvamento — só é validado quanto à forma
    // (chaves conhecidas, valores booleanos), nunca exigido como completo.
    checklist: checklistSchema.default({}),
  })
  .refine((data) => data.entryPrice !== data.stopPrice, {
    message: "Entrada e stop não podem ser iguais.",
    path: ["stopPrice"],
  })
  .refine((data) => data.exitType === "loss" || data.targetPct !== undefined, {
    message: "Informe o % do alvo alcançado (exceto em loss).",
    path: ["targetPct"],
  });

export type TradeFormInput = z.infer<typeof tradeFormSchema>;
