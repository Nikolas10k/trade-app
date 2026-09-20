import Link from "next/link";
import type { ReactNode } from "react";
import { AmbientBackground } from "@/components/ambient-background";
import { PriceChartMark } from "@/components/price-chart-mark";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="relative hidden overflow-hidden md:flex md:flex-col md:justify-between md:p-12">
        <AmbientBackground />

        <Link href="/" className="relative z-10 text-lg font-bold text-gradient-brand">
          Diário XAU/USD
        </Link>

        <div className="relative z-10 max-w-md">
          <PriceChartMark className="mb-8 h-16 w-48" />

          <h1 className="text-3xl font-bold leading-tight text-text-primary">
            Sua disciplina, medida a cada operação em{" "}
            <span className="text-gradient-brand">XAU/USD</span>
          </h1>
          <p className="mt-4 text-text-secondary">
            Checklist de método, medidor de disciplina 0–100 e zonas quentes de preço — o
            diário de quem já tem um método e quer segui-lo.
          </p>
        </div>

        <p className="relative z-10 text-xs text-text-disabled">
          © {new Date().getFullYear()} Diário XAU/USD
        </p>
      </section>

      <section className="flex flex-col items-center justify-center bg-bg px-4 py-12">
        <Link href="/" className="mb-8 text-lg font-bold text-gradient-brand md:hidden">
          Diário XAU/USD
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </div>
  );
}
