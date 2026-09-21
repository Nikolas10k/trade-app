export const AUDIT_ACTION_LABELS: Record<string, string> = {
  login: "Login",
  password_change: "Troca de senha",
  account_deleted: "Conta excluída",
  plan_change: "Mudança de plano",
  admin_extend_trial: "Admin: trial estendido",
  admin_grant_comp: "Admin: cortesia concedida",
  admin_suspend: "Admin: conta suspensa",
  admin_reactivate: "Admin: conta reativada",
  admin_force_password_reset: "Admin: reset de senha forçado",
  admin_resend_verification: "Admin: reenvio de verificação",
};

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}
