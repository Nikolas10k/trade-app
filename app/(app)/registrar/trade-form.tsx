"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, FieldError, Input, Label } from "@/components/ui";
import { disciplineScore, formatMoney, priceToPips, riskPctOfBalance, riskReward } from "@/lib/calc";
import { ALL_CHECKLIST_KEYS, CHECKLIST_PHASES, type ChecklistValue } from "@/lib/checklist/keys";
import type { Database } from "@/lib/db/database.types";
import { saveTradeAction, type TradeActionState } from "./actions";

type Trade = Database["public"]["Tables"]["trades"]["Row"];

const initialState: TradeActionState = { ok: false };

const EXIT_TYPE_LABELS: Record<Trade["exit_type"], string> = {
  parcial: "Parcial",
  "0x0": "0x0 (breakeven)",
  cheio: "Cheio (100% do alvo)",
  loss: "Loss",
};

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 16);
}

function emptyChecklist(): ChecklistValue {
  return Object.fromEntries(ALL_CHECKLIST_KEYS.map((key) => [key, false]));
}

function SubmitButton({ confirming }: { confirming: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant={confirming ? "danger" : "primary"}>
      {pending ? "Salvando…" : confirming ? "Registrar mesmo assim" : "Salvar"}
    </Button>
  );
}

export function TradeForm({
  riskLimitPct,
  pipValue,
  trade,
}: {
  riskLimitPct: number;
  pipValue: number;
  trade: Trade | null;
}) {
  const [state, formAction] = useActionState(saveTradeAction, initialState);

  const [accountBalance, setAccountBalance] = useState(trade?.account_balance?.toString() ?? "");
  const [entryPrice, setEntryPrice] = useState(trade?.entry_price?.toString() ?? "");
  const [stopPrice, setStopPrice] = useState(trade?.stop_price?.toString() ?? "");
  const [refChannelPips, setRefChannelPips] = useState(trade?.ref_channel_pips?.toString() ?? "");
  const [lotSize, setLotSize] = useState(trade?.lot_size?.toString() ?? "");
  const [exitType, setExitType] = useState<Trade["exit_type"]>(trade?.exit_type ?? "parcial");
  const [confirmingOverLimit, setConfirmingOverLimit] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistValue>(() => ({
    ...emptyChecklist(),
    ...(trade?.checklist as ChecklistValue | undefined),
  }));

  const checklistDone = ALL_CHECKLIST_KEYS.filter((key) => checklist[key]).length;

  const calc = useMemo(() => {
    const entry = Number(entryPrice);
    const stop = Number(stopPrice);
    const balance = Number(accountBalance);
    const lot = Number(lotSize);
    const refPips = Number(refChannelPips || 0);

    if (!entry || !stop || entry === stop) return null;

    const stopPips = priceToPips(entry, stop, pipValue);
    const rr = refPips > 0 ? riskReward({ entryPrice: entry, stopPrice: stop, refChannelPips: refPips, pipValue }) : null;
    const riskPct = balance && lot ? riskPctOfBalance({ entryPrice: entry, stopPrice: stop, lotSize: lot, accountBalance: balance }) : null;

    return { stopPips, rr, riskPct };
  }, [entryPrice, stopPrice, accountBalance, lotSize, refChannelPips, pipValue]);

  const overLimit = calc?.riskPct ? calc.riskPct.toNumber() > riskLimitPct : false;

  const score = useMemo(() => {
    if (!calc?.riskPct) return null;
    return disciplineScore({ checklist, riskPct: calc.riskPct, riskLimitPct });
  }, [checklist, calc, riskLimitPct]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (overLimit && !confirmingOverLimit) {
      e.preventDefault();
      setConfirmingOverLimit(true);
    }
  }

  function toggleChecklistItem(key: string) {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
        {trade ? <input type="hidden" name="tradeId" value={trade.id} /> : null}

        {/* Bloco 1 — Dados */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="tradedAt">Data/hora do trade</Label>
            <Input
              id="tradedAt"
              name="tradedAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(trade?.traded_at)}
              required
            />
            <FieldError message={state.fieldErrors?.tradedAt} />
          </div>

          <div>
            <Label htmlFor="accountBalance">Saldo total</Label>
            <Input
              id="accountBalance"
              name="accountBalance"
              type="number"
              step="0.01"
              value={accountBalance}
              onChange={(e) => setAccountBalance(e.target.value)}
              required
            />
            <FieldError message={state.fieldErrors?.accountBalance} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="entryPrice">Região da entrada</Label>
              <Input
                id="entryPrice"
                name="entryPrice"
                type="number"
                step="0.00001"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                required
              />
              <FieldError message={state.fieldErrors?.entryPrice} />
            </div>
            <div>
              <Label htmlFor="stopPrice">Região do stop</Label>
              <Input
                id="stopPrice"
                name="stopPrice"
                type="number"
                step="0.00001"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                required
              />
              <FieldError message={state.fieldErrors?.stopPrice} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="refChannelPips">Canal ref (pips)</Label>
              <Input
                id="refChannelPips"
                name="refChannelPips"
                type="number"
                step="1"
                value={refChannelPips}
                onChange={(e) => setRefChannelPips(e.target.value)}
              />
              <FieldError message={state.fieldErrors?.refChannelPips} />
            </div>
            <div>
              <Label htmlFor="lotSize">Nº de lote</Label>
              <Input
                id="lotSize"
                name="lotSize"
                type="number"
                step="0.01"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                required
              />
              <FieldError message={state.fieldErrors?.lotSize} />
            </div>
          </div>

          <div>
            <Label htmlFor="exitType">Saída</Label>
            <select
              id="exitType"
              name="exitType"
              value={exitType}
              onChange={(e) => setExitType(e.target.value as Trade["exit_type"])}
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-text-primary outline-none focus:border-secondary-light focus:ring-2 focus:ring-secondary-light/30"
            >
              {Object.entries(EXIT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <FieldError message={state.fieldErrors?.exitType} />
          </div>

          {exitType !== "loss" ? (
            <div>
              <Label htmlFor="targetPct">% do alvo alcançado</Label>
              <Input
                id="targetPct"
                name="targetPct"
                type="number"
                step="0.01"
                min={0}
                max={100}
                defaultValue={exitType === "cheio" ? 100 : (trade?.target_pct ?? undefined)}
                required
              />
              <FieldError message={state.fieldErrors?.targetPct} />
            </div>
          ) : null}

          <div>
            <Label htmlFor="resultTotal">Resultado total</Label>
            <Input
              id="resultTotal"
              name="resultTotal"
              type="number"
              step="0.01"
              defaultValue={trade?.result_total ?? undefined}
              required
            />
            <FieldError message={state.fieldErrors?.resultTotal} />
          </div>
        </div>

        {/* Bloco 2 — Calculadora */}
        <div className="rounded-2xl border border-white/10 bg-surface p-6">
          <h2 className="mb-4 font-semibold text-text-primary">Calculadora</h2>
          {calc ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Pips do stop</dt>
                <dd className="font-medium text-text-primary">{calc.stopPips.toFixed(1)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">R/R planejado</dt>
                <dd className="font-medium text-text-primary">
                  {calc.rr ? `${calc.rr.toFixed(2)} : 1` : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">Risco (% do saldo)</dt>
                <dd
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    overLimit ? "bg-danger/20 text-danger" : "bg-success/20 text-success"
                  }`}
                >
                  {calc.riskPct ? `${calc.riskPct.toFixed(2)}%` : "—"}
                </dd>
              </div>
              {accountBalance ? (
                <div className="flex justify-between border-t border-white/10 pt-3">
                  <dt className="text-text-muted">Saldo informado</dt>
                  <dd className="text-text-secondary">{formatMoney(Number(accountBalance))}</dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="text-sm text-text-muted">
              Preencha entrada, stop e saldo para ver os cálculos em tempo real.
            </p>
          )}
        </div>

        {overLimit ? (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            Você está furando seu próprio limite de risco ({riskLimitPct}%). Clique novamente
            em &quot;Registrar mesmo assim&quot; para confirmar.
          </p>
        ) : null}
        {state.message ? <FieldError message={state.message} /> : null}

        <SubmitButton confirming={overLimit && confirmingOverLimit} />
      </form>

      <div className="space-y-6">
        {/* Bloco 3 — Checklist do modo operandi */}
        <div className="rounded-2xl border border-white/10 bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Checklist do método</h2>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-text-secondary">
              {checklistDone}/{ALL_CHECKLIST_KEYS.length}
            </span>
          </div>
          <div className="space-y-5">
            {CHECKLIST_PHASES.map((phase) => (
              <div key={phase.phase}>
                <h3 className="mb-2 text-sm font-medium text-text-secondary">{phase.title}</h3>
                <ul className="space-y-2">
                  {phase.items.map((item) => (
                    <li key={item.key}>
                      <label className="flex cursor-pointer items-start gap-2 text-sm text-text-primary">
                        <input
                          type="checkbox"
                          name={`checklist_${item.key}`}
                          checked={checklist[item.key] ?? false}
                          onChange={() => toggleChecklistItem(item.key)}
                          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/20"
                        />
                        {item.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-text-disabled">
            O checklist registra o que foi cumprido — ele não bloqueia o salvamento do trade.
          </p>
        </div>

        {/* Bloco 4 — Impacto na disciplina */}
        <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6">
          <h2 className="mb-1 font-semibold text-gold-light">Impacto na disciplina</h2>
          <p className="mb-3 text-xs text-text-muted">
            Mede aderência ao método e ao seu limite de risco — não o resultado do trade.
          </p>
          <p className="text-4xl font-bold text-gold-light">{score !== null ? score.toFixed(0) : "—"}</p>
        </div>
      </div>
    </div>
  );
}
