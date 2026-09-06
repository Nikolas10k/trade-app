import { z } from "zod";
import { ALL_CHECKLIST_KEYS } from "@/lib/checklist/keys";

/** Só as 13 chaves do S3 são aceitas — qualquer outra é rejeitada (.strict()). */
export const checklistSchema = z
  .object(Object.fromEntries(ALL_CHECKLIST_KEYS.map((key) => [key, z.boolean().default(false)])))
  .strict();

export type ChecklistInput = z.infer<typeof checklistSchema>;
