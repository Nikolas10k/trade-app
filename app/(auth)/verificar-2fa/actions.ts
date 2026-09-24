"use server";

import { redirect } from "next/navigation";
import { logAuditEvent } from "@/lib/audit/log";
import { createClient } from "@/lib/db/supabase-server";
import { verifyTwoFactorSchema } from "@/lib/validation/auth";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";
import type { ActionState } from "../actions";

export async function verifyTwoFactorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = verifyTwoFactorSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const factor = user.factors?.find((f) => f.factor_type === "totp" && f.status === "verified");
  if (!factor) redirect("/dashboard");

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factor.id,
    code: parsed.data.code,
  });

  if (error) {
    return { ok: false, message: "Código inválido ou expirado. Tente novamente." };
  }

  await logAuditEvent({ actorId: user.id, userId: user.id, action: "login" });

  redirect("/dashboard");
}
