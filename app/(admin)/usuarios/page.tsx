import Link from "next/link";
import { listUsersForAdmin } from "@/lib/admin/users";
import { PLAN_LABELS, SUBSCRIPTION_STATUS_LABELS } from "@/lib/subscriptions/labels";

export const metadata = { title: "Usuários — Admin" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const users = await listUsersForAdmin(q);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">Usuários</h1>
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
