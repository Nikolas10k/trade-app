import "server-only";
import type { User } from "@supabase/supabase-js";
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
  hasTwoFactor: boolean;
};

function hasVerifiedTotp(user: User): boolean {
  return user.factors?.some((f) => f.factor_type === "totp" && f.status === "verified") ?? false;
}

/**
 * E-mail e metadados de conta só existem em auth.users, que não é exposto
 * via PostgREST — a única forma de lê-los é a Auth Admin API (service role).
 * Assinatura/suspensão são lidas pelo client comum: as policies
 * *_select_admin (Fase 1) já dão a um admin autenticado leitura dessas
 * tabelas sem precisar de service role — menor privilégio (0.2).
 */
const AUTH_USERS_PAGE_SIZE = 200;

/**
 * listUsers é paginada (page/perPage) — uma chamada só devolve no máximo
 * perPage usuários. Sem esse loop, qualquer conta além da primeira página
 * some silenciosamente da lista/KPIs do admin (sem erro, sem aviso).
 * `nextPage` vem null na última página.
 */
export async function listAllAuthUsers(admin: ReturnType<typeof createAdminClient>): Promise<User[]> {
  const users: User[] = [];
  let page: number | undefined = 1;
  while (page) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: AUTH_USERS_PAGE_SIZE });
    if (error) throw error;
    users.push(...data.users);
    page = data.nextPage ?? undefined;
  }
  return users;
}

/** Todos os usuários — sem filtro, para que a tela de admin possa derivar tanto a tabela (filtrada por busca) quanto os KPIs (sobre o total) da mesma leitura. */
export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  const admin = createAdminClient();
  const supabase = await createClient();

  const [authUsers, { data: subscriptions }, { data: profiles }] = await Promise.all([
    listAllAuthUsers(admin),
    supabase.from("subscriptions").select("user_id, status, plan, trial_ends_at, current_period_end, comp_until"),
    supabase.from("profiles").select("id, is_suspended"),
  ]);

  const subsByUser = new Map((subscriptions ?? []).map((s) => [s.user_id, s]));
  const suspendedByUser = new Map((profiles ?? []).map((p) => [p.id, p.is_suspended]));

  return authUsers.map((u): AdminUserRow => {
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
      hasTwoFactor: hasVerifiedTotp(u),
    };
  });
}

export function filterUsersByEmail(users: AdminUserRow[], query?: string): AdminUserRow[] {
  if (!query) return users;
  const needle = query.trim().toLowerCase();
  return users.filter((u) => u.email?.toLowerCase().includes(needle));
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
    hasTwoFactor: hasVerifiedTotp(authData.user),
  };
}
