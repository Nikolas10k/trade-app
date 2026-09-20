import { z } from "zod";

export const DELETE_ACCOUNT_PHRASE = "EXCLUIR MINHA CONTA";

export const deleteAccountSchema = z.object({
  confirmation: z.literal(DELETE_ACCOUNT_PHRASE, {
    message: `Digite exatamente "${DELETE_ACCOUNT_PHRASE}" para confirmar.`,
  }),
});
