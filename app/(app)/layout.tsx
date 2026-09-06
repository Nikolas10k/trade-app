import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/session";
import { LogoutButton } from "./logout-button";
import { NavLinks } from "./nav-links";

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gradient-brand">Diário XAU/USD</span>
            <div className="sm:hidden">
              <LogoutButton />
            </div>
          </div>
          <NavLinks />
          <div className="hidden sm:block">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
