"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const EXIT_TYPE_OPTIONS = [
  { value: "", label: "Todas as saídas" },
  { value: "parcial", label: "Parcial" },
  { value: "0x0", label: "0x0" },
  { value: "cheio", label: "Cheio" },
  { value: "loss", label: "Loss" },
];

const PERIOD_OPTIONS = [
  { value: "", label: "Todo o período" },
  { value: "15", label: "Últimos 15 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
];

const SORT_OPTIONS = [
  { value: "date_desc", label: "Mais recentes" },
  { value: "date_asc", label: "Mais antigos" },
  { value: "result_desc", label: "Maior resultado" },
  { value: "result_asc", label: "Menor resultado" },
];

const selectClass =
  "rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-text-primary outline-none focus:border-secondary-light focus:ring-2 focus:ring-secondary-light/30";

export function HistoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <select
        className={selectClass}
        value={searchParams.get("exitType") ?? ""}
        onChange={(e) => updateParam("exitType", e.target.value)}
      >
        {EXIT_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={searchParams.get("period") ?? ""}
        onChange={(e) => updateParam("period", e.target.value)}
      >
        {PERIOD_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={searchParams.get("sort") ?? "date_desc"}
        onChange={(e) => updateParam("sort", e.target.value)}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
