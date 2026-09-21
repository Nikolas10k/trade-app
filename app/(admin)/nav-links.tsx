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
  usuarios: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.8 14.2c2.3.3 4 1.9 4.4 4.3" />
    </IconWrap>
  ),
  auditoria: (props: SVGProps<SVGSVGElement>) => (
    <IconWrap {...props}>
      <path d="M8 4h8l3 3.2V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M9 10h6M9 13.5h6M9 17h3.5" />
    </IconWrap>
  ),
} as const;

const LINKS = [
  { href: "/usuarios", label: "Usuários", icon: "usuarios" },
  { href: "/auditoria", label: "Auditoria", icon: "auditoria" },
] as const;

export function AdminNavLinks() {
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
