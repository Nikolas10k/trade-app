import Link from "next/link";
import { formatMoney } from "@/lib/calc";
import { computeAdminKpis } from "@/lib/admin/kpis";
import { filterUsersByEmail, listUsersForAdmin } from "@/lib/admin/users";
import { PLAN_LABELS, SUBSCRIPTION_STATUS_LABELS } from "@/lib/subscriptions/labels";
import { KpiCard } from "./kpi-card";

export const metadata = { title: "Usuários — Admin" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const allUsers = await listUsersForAdmin();
  const users = filterUsersByEmail(allUsers, q);
  const kpis = computeAdminKpis(allUsers);

  const statusEntries = Object.entries(kpis.byStatus) as [keyof typeof kpis.byStatus, number][];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Usuários</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon="usuarios"
          label="Usuários"
          value={kpis.totalUsers}
          hint={`+${kpis.newSignups[7]} nos últimos 7 dias · +${kpis.newSignups[30]} em 30 dias`}
        />
        <KpiCard
          icon="mrr"
          label="MRR estimado"
          value={formatMoney(kpis.mrrEstimateBRL)}
          hint="Soma do equivalente mensal das assinaturas ativas — estimativa, não substitui a Mercado Pago"
          gold
        />
        <KpiCard
          icon="trial"
          label="Trials terminando"
          value={kpis.trialsEndingSoon}
          hint="Nos próximos 7 dias"
        />
        <KpiCard icon="suspenso" label="Contas suspensas" value={kpis.suspendedCount} />
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-surface p-6">
        <h2 className="mb-4 font-semibold text-text-primary">Assinaturas por status</h2>
        <ul className="space-y-2">
          {statusEntries.map(([status, count]) => (
            <li key={status} className="flex items-center gap-3 text-sm">
              <span className="w-36 text-text-muted">{SUBSCRIPTION_STATUS_LABELS[status]}</span>
              <div className="h-2 flex-1 rounded-full bg-white/5">
                <div
                  className="h-2 rounded-full bg-gradient-brand"
                  style={{ width: kpis.totalUsers ? `${(count / kpis.totalUsers) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-8 text-right text-text-secondary">{count}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mb-6 text-sm text-text-muted">
        Conta, status de assinatura e atividade. O conteúdo dos trades de cada usuário não é
        acessível por aqui (Seção 10).
      </p>

      <form className="mb-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por e-mail..."
          className="w-full max-w-sm rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-text-primary outline-none focus:border-secondary-light focus:ring-2 focus:ring-secondary-light/30"
        />
      </form>

      {users.length === 0 ? (
        <p className="text-sm text-text-muted">Nenhum usuário encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Cadastro</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Situação</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <Link href={`/usuarios/${u.id}`} className="text-text-primary hover:underline">
                      {u.email ?? "(sem e-mail)"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{SUBSCRIPTION_STATUS_LABELS[u.status]}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.plan ? PLAN_LABELS[u.plan] : "—"}</td>
                  <td className="px-4 py-3">
                    {u.isSuspended ? (
                      <span className="rounded-full bg-danger/20 px-2 py-0.5 text-xs text-danger">
                        Suspenso
                      </span>
                    ) : (
                      <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">
                        Ativo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
