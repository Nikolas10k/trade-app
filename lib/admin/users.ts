import "server-only";
import { createAdminClient } from "@/lib/db/supabase-admin";
import { createClient } from "@/lib/db/supabase-server";

export type AdminUserRow = {
  id: string;
  email: string | null;
  createdAt: string;
  emailConfirmed: boolean;
  status: "trial" | "active" | "past_due" | "canceled";
  plan: "mensal" | "trimestral" | "anual" | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  compUntil: string | null;
  isSuspended: boolean;
};

/**
 * E-mail e metadados de conta só existem em auth.users, que não é exposto
 * via PostgREST — a única forma de lê-los é a Auth Admin API (service role).
 * Assinatura/suspensão são lidas pelo client comum: as policies
 * *_select_admin (Fase 1) já dão a um admin autenticado leitura dessas
 * tabelas sem precisar de service role — menor privilégio (0.2).
 */
export async function listUsersForAdmin(query?: string): Promise<AdminUserRow[]> {
  const admin = createAdminClient();
  const supabase = await createClient();

  const [{ data: authData, error: authError }, { data: subscriptions }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 200 }),
    supabase.from("subscriptions").select("user_id, status, plan, trial_ends_at, current_period_end, comp_until"),
    supabase.from("profiles").select("id, is_suspended"),
  ]);
  if (authError) throw authError;

  const subsByUser = new Map((subscriptions ?? []).map((s) => [s.user_id, s]));
  const suspendedByUser = new Map((profiles ?? []).map((p) => [p.id, p.is_suspended]));

  const rows = authData.users.map((u): AdminUserRow => {
    const sub = subsByUser.get(u.id);
    return {
      id: u.id,
      email: u.email ?? null,
      createdAt: u.created_at,
      emailConfirmed: Boolean(u.email_confirmed_at),
      status: sub?.status ?? "trial",
      plan: sub?.plan ?? null,
      trialEndsAt: sub?.trial_ends_at ?? null,
      currentPeriodEnd: sub?.current_period_end ?? null,
      compUntil: sub?.comp_until ?? null,
      isSuspended: suspendedByUser.get(u.id) ?? false,
    };
  });

  if (!query) return rows;
  const needle = query.trim().toLowerCase();
  return rows.filter((r) => r.email?.toLowerCase().includes(needle));
}

export async function getUserForAdmin(userId: string): Promise<AdminUserRow | null> {
  const admin = createAdminClient();
  const supabase = await createClient();

  const [{ data: authData, error: authError }, { data: subscription }, { data: profile }] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    supabase
      .from("subscriptions")
      .select("status, plan, trial_ends_at, current_period_end, comp_until")
      .eq("user_id", userId)
      .single(),
    supabase.from("profiles").select("is_suspended").eq("id", userId).single(),
  ]);
  if (authError || !authData.user) return null;

  return {
    id: authData.user.id,
    email: authData.user.email ?? null,
    createdAt: authData.user.created_at,
    emailConfirmed: Boolean(authData.user.email_confirmed_at),
    status: subscription?.status ?? "trial",
    plan: subscription?.plan ?? null,
    trialEndsAt: subscription?.trial_ends_at ?? null,
    currentPeriodEnd: subscription?.current_period_end ?? null,
    compUntil: subscription?.comp_until ?? null,
    isSuspended: profile?.is_suspended ?? false,
  };
}
