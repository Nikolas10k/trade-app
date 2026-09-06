"use client";

import { Button } from "@/components/ui";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/5 p-8 text-center">
      <p className="mb-4 text-text-secondary">Não foi possível carregar o dashboard.</p>
      <Button onClick={reset} variant="ghost">
        Tentar novamente
      </Button>
    </div>
  );
}
