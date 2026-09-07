"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { extendTrial, grantComp, setSuspended } from "@/lib/admin/subscription-actions";

function parseDays(formData: FormData): number | null {
  const days = Number(formData.get("days"));
  return Number.isFinite(days) && days > 0 ? Math.trunc(days) : null;
}

export async function extendTrialAction(userId: string, formData: FormData) {
  const { adminId } = await requireAdmin();
  const days = parseDays(formData);
  if (days === null) return;
  await extendTrial(userId, days, adminId);
  revalidatePath(`/usuarios/${userId}`);
}

export async function grantCompAction(userId: string, formData: FormData) {
  const { adminId } = await requireAdmin();
  const days = parseDays(formData);
  if (days === null) return;
  await grantComp(userId, days, adminId);
  revalidatePath(`/usuarios/${userId}`);
}

export async function setSuspendedAction(userId: string, suspended: boolean) {
  const { adminId } = await requireAdmin();
  await setSuspended(userId, suspended, adminId);
  revalidatePath(`/usuarios/${userId}`);
}
