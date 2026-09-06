"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/registrar", label: "Registrar trade" },
  { href: "/zonas-quentes", label: "Zonas quentes" },
  { href: "/historico", label: "Histórico" },
  { href: "/configuracoes", label: "Configurações" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-white/10 text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
