"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/db/supabase-server";
import { deleteAccount } from "@/lib/lgpd/delete-account";
import { deleteAccountSchema } from "@/lib/validation/account";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";

export type DeleteAccountState = {
  ok: boolean;
  message?: string;
};

export async function deleteAccountAction(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const user = await requireUser();

  const parsed = deleteAccountSchema.safeParse({ confirmation: formData.get("confirmation") });
  if (!parsed.success) {
    const fieldErrors = fieldErrorsFromZod(parsed.error);
    return { ok: false, message: fieldErrors.confirmation };
  }

  await deleteAccount(user.id, user.id);

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/?conta-excluida=1");
}
