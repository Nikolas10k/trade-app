export type ChecklistValue = Record<string, boolean>;

export type ChecklistItem = { key: string; label: string };
export type ChecklistPhase = { phase: string; title: string; items: ChecklistItem[] };

export const CHECKLIST_PHASES: ChecklistPhase[] = [
  {
    phase: "f1",
    title: "Fase 1 — Contexto e plano",
    items: [
      { key: "f1_tendencia", label: "Tendência identificada" },
      { key: "f1_quatro_velas", label: "Análise das últimas 4 velas" },
      { key: "f1_pips_ref", label: "Pips de referência definidos" },
      { key: "f1_canal_mapeado", label: "Canal mapeado" },
      { key: "f1_canal2_confirmado", label: "Segundo canal confirmado" },
    ],
  },
  {
    phase: "f2",
    title: "Fase 2 — Dimensionamento",
    items: [
      { key: "f2_lote_definido", label: "Tamanho do lote definido" },
      { key: "f2_pips_stop", label: "Pips do stop definidos" },
      { key: "f2_rr_agradavel", label: "R/R agradável" },
      { key: "f2_margem_costura", label: "Margem de costura considerada" },
    ],
  },
  {
    phase: "f3",
    title: "Fase 3 — Confirmação de entrada",
    items: [{ key: "f3_vela_fora_canais", label: "Vela fora dos canais" }],
  },
  {
    phase: "f4",
    title: "Fase 4 — Gestão da posição",
    items: [
      { key: "f4_parcial_feita", label: "Parcial realizada" },
      { key: "f4_stop_0x0", label: "Stop levado a 0x0" },
      { key: "f4_stop_conduzido", label: "Stop conduzido" },
    ],
  },
];

/** Pré-trade = f1 + f2 + f3 (10 itens). Gestão = f4 (3 itens). Total: 13. */
export const PRE_TRADE_KEYS: readonly string[] = CHECKLIST_PHASES.filter((p) => p.phase !== "f4").flatMap(
  (p) => p.items.map((i) => i.key),
);
export const MANAGEMENT_KEYS: readonly string[] = CHECKLIST_PHASES.filter((p) => p.phase === "f4").flatMap(
  (p) => p.items.map((i) => i.key),
);
export const ALL_CHECKLIST_KEYS: readonly string[] = [...PRE_TRADE_KEYS, ...MANAGEMENT_KEYS];
