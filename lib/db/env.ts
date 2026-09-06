function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}. Configure-a em .env.local (veja .env.example).`,
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function getSupabaseServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY");
}

export function getAppBaseUrl(): string {
  return required("APP_BASE_URL");
}

export function getMpAccessToken(): string {
  return required("MP_ACCESS_TOKEN");
}

export function getMpWebhookSecret(): string {
  return required("MP_WEBHOOK_SECRET");
}

export function getMpPreapprovalPlanId(plan: "mensal" | "trimestral" | "anual"): string {
  const envVar = {
    mensal: "MP_PREAPPROVAL_PLAN_MENSAL",
    trimestral: "MP_PREAPPROVAL_PLAN_TRIMESTRAL",
    anual: "MP_PREAPPROVAL_PLAN_ANUAL",
  }[plan];
  return required(envVar);
}
