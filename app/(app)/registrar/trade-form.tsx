"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, FieldError, Input, Label } from "@/components/ui";
import { formatMoney, priceToPips, riskPctOfBalance, riskReward } from "@/lib/calc";
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (overLimit && !confirmingOverLimit) {
      e.preventDefault();
      setConfirmingOverLimit(true);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
        {trade ? <input type="hidden" name="tradeId" value={trade.id} /> : null}

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

        {overLimit ? (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            Você está furando seu próprio limite de risco ({riskLimitPct}%). Clique novamente
            em &quot;Registrar mesmo assim&quot; para confirmar.
          </p>
        ) : null}
        {state.message ? <FieldError message={state.message} /> : null}

        <SubmitButton confirming={overLimit && confirmingOverLimit} />
      </form>

      <div className="space-y-4">
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
        <p className="text-xs text-text-disabled">
          O checklist de método (4 fases, 13 itens) e o medidor de disciplina chegam na Fase 3.
        </p>
      </div>
    </div>
  );
}
