import Link from "next/link";

export default function AdminForbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">403 — Acesso restrito</h1>
      <p className="mb-6 text-text-secondary">Esta área é só para administradores.</p>
      <Link href="/dashboard" className="text-sm text-secondary-light hover:underline">
        Voltar ao dashboard
      </Link>
    </div>
  );
}
