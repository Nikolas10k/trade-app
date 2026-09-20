"use client";

import { useSearchParams } from "next/navigation";

export function AccountDeletedBanner() {
  const searchParams = useSearchParams();
  if (!searchParams.get("conta-excluida")) return null;

  return (
    <div className="bg-gradient-brand px-6 py-3 text-center text-sm text-white">
      Sua conta foi excluída definitivamente. Obrigado por ter usado o Diário XAU/USD.
    </div>
  );
}
