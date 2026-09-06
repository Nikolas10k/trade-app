import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12">
      <Link href="/" className="mb-8 text-lg font-bold text-gradient-brand">
        Diário XAU/USD
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
