import { formatAuditMetadata, listAuditLog } from "@/lib/admin/audit";
import { auditActionLabel } from "@/lib/admin/audit-labels";
import { listUsersForAdmin } from "@/lib/admin/users";

export const metadata = { title: "Auditoria — Admin" };

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [entries, users] = await Promise.all([listAuditLog(), listUsersForAdmin()]);
  const emailById = new Map(users.map((u) => [u.id, u.email]));

  const needle = q?.trim().toLowerCase();
  const filtered = needle
    ? entries.filter((entry) => {
        const actorEmail = entry.actorId ? emailById.get(entry.actorId) : null;
        const targetEmail = entry.userId ? emailById.get(entry.userId) : null;
        return (
          auditActionLabel(entry.action).toLowerCase().includes(needle) ||
          entry.action.toLowerCase().includes(needle) ||
          actorEmail?.toLowerCase().includes(needle) ||
          targetEmail?.toLowerCase().includes(needle)
        );
      })
    : entries;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">Auditoria</h1>
      <p className="mb-6 text-sm text-text-muted">
        Últimas {entries.length} ações registradas (login, troca de senha, ações administrativas
        etc.) — mesma tabela que sustenta a auditoria de segurança (Seção 9.10).
      </p>

      <form className="mb-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por ação ou e-mail..."
          className="w-full max-w-sm rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-text-primary outline-none focus:border-secondary-light focus:ring-2 focus:ring-secondary-light/30"
        />
      </form>

      {filtered.length === 0 ? (
        <p className="text-sm text-text-muted">Nenhum registro encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">Quando</th>
                <th className="px-4 py-3">Ação</th>
                <th className="px-4 py-3">Ator</th>
                <th className="px-4 py-3">Usuário-alvo</th>
                <th className="px-4 py-3">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                    {new Date(entry.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-text-primary">{auditActionLabel(entry.action)}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {entry.actorId ? (emailById.get(entry.actorId) ?? entry.actorId) : "Sistema"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {entry.userId ? (emailById.get(entry.userId) ?? entry.userId) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {formatAuditMetadata(entry.metadata) ?? "—"}
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
