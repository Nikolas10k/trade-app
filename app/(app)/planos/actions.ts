"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createPreapproval, type PlanKey } from "@/lib/payments/mercadopago";

export async function subscribeAction(planKey: PlanKey) {
  const user = await requireUser();
  if (!user.email) {
    throw new Error("Sua conta precisa de um e-mail verificado para assinar.");
  }

  const { initPoint } = await createPreapproval({ planKey, userId: user.id, payerEmail: user.email });
  redirect(initPoint);
}
