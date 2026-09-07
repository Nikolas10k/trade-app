import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/admin";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-sm font-bold text-gradient-brand">Diário XAU/USD — Admin</span>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
