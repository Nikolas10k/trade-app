import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg px-4 py-12">
      <div className="ambient-grid absolute inset-0 opacity-60" aria-hidden />
      <Link href="/" className="relative z-10 mb-8 text-lg font-bold text-gradient-brand">
        Diário XAU/USD
      </Link>
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
