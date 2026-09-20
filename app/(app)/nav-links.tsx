"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

function IconWrap(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden
      {...props}
    />
  );
}

const ICONS = {
  dashboard: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <rect x="3.5" y="3.5" width="7" height="9" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
      <rect x="3.5" y="15.5" width="7" height="5" rx="1.5" />
    </IconWrap>
  ),
  registrar: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconWrap>
  ),
  zonas: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <path d="M12 2.5c3 3.2 4.5 5.8 4.5 8.3a4.5 4.5 0 1 1-9 0c0-1 .3-2 1-3.2.2 1 .8 1.6 1.5 1.6.9 0 1-1.4.7-2.4-.5-1.7 0-3.1 1.3-4.3Z" />
    </IconWrap>
  ),
  historico: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </IconWrap>
  ),
  configuracoes: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.04 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10.5a1.7 1.7 0 0 0 1.04-1.56V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10.5a1.7 1.7 0 0 0 1.56 1.04h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04Z" />
    </IconWrap>
  ),
} as const;

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/registrar", label: "Registrar trade", icon: "registrar" },
  { href: "/zonas-quentes", label: "Zonas quentes", icon: "zonas" },
  { href: "/historico", label: "Histórico", icon: "historico" },
  { href: "/configuracoes", label: "Configurações", icon: "configuracoes" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        const Icon = ICONS[link.icon];
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-gradient-brand text-white shadow-md shadow-primary/20"
                : "text-text-muted hover:bg-white/5 hover:text-text-secondary"
            }`}
          >
            <Icon />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
