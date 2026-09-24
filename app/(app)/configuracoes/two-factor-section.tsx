"use client";

import { useState } from "react";
import { Button, FieldError, Input, Label } from "@/components/ui";
import { createClient } from "@/lib/db/supabase-browser";
import { logTwoFactorDisabledAction, logTwoFactorEnabledAction } from "./two-factor-actions";

type EnrollState = { factorId: string; qrCode: string; secret: string };

export function TwoFactorSection({
  initialEnabled,
  initialFactorId,
}: {
  initialEnabled: boolean;
  initialFactorId: string | null;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [factorId, setFactorId] = useState(initialFactorId);
  const [enrollment, setEnrollment] = useState<EnrollState | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleActivate() {
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setPending(false);
    if (enrollError || !data) {
      setError("Não foi possível iniciar a ativação. Tente novamente.");
      return;
    }
    setEnrollment({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  }

  async function handleCancelEnrollment() {
    if (enrollment) {
      const supabase = createClient();
      await supabase.auth.mfa.unenroll({ factorId: enrollment.factorId });
    }
    setEnrollment(null);
    setCode("");
    setError(null);
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollment) return;
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enrollment.factorId,
      code,
    });
    setPending(false);
    if (verifyError) {
      setError("Código inválido ou expirado. Tente novamente.");
      return;
    }
    await logTwoFactorEnabledAction();
    setFactorId(enrollment.factorId);
    setEnabled(true);
    setEnrollment(null);
    setCode("");
  }

  async function handleDisable() {
    if (!factorId) return;
    if (!window.confirm("Desativar a verificação em duas etapas?")) return;
    setPending(true);
    const supabase = createClient();
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
    setPending(false);
    if (unenrollError) {
      setError("Não foi possível desativar agora. Tente novamente.");
      return;
    }
    await logTwoFactorDisabledAction();
    setEnabled(false);
    setFactorId(null);
  }

  if (enrollment) {
    return (
      <div>
        <p className="mb-3 text-sm text-text-secondary">
          Escaneie o QR code com seu aplicativo autenticador (Google Authenticator, Authy, 1Password
          etc.) e digite o código gerado para confirmar.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- QR code é gerado por sessão (data URI), não um asset estático otimizável */}
        <img
          src={`data:image/svg+xml;utf-8,${encodeURIComponent(enrollment.qrCode)}`}
          alt="QR code para configurar o autenticador"
          className="mb-3 h-40 w-40 rounded-lg bg-white p-2"
        />
        <p className="mb-4 text-xs text-text-muted">
          Não consegue escanear? Digite manualmente:{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">{enrollment.secret}</code>
        </p>
        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <Label htmlFor="totp-code">Código de 6 dígitos</Label>
            <Input
              id="totp-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              pattern="\d{6}"
              autoFocus
              required
              className="text-center text-lg tracking-[0.5em]"
            />
            <FieldError message={error ?? undefined} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Confirmando…" : "Confirmar"}
            </Button>
            <Button type="button" variant="ghost" onClick={handleCancelEnrollment} disabled={pending}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-text-secondary">
        {enabled
          ? "Ativada. Um código do seu aplicativo autenticador é pedido a cada login."
          : "Desativada. Ative para exigir um código do seu aplicativo autenticador a cada login, além da senha."}
      </p>
      <FieldError message={error ?? undefined} />
      {enabled ? (
        <Button variant="danger" onClick={handleDisable} disabled={pending}>
          {pending ? "Desativando…" : "Desativar 2FA"}
        </Button>
      ) : (
        <Button onClick={handleActivate} disabled={pending}>
          {pending ? "Iniciando…" : "Ativar 2FA"}
        </Button>
      )}
    </div>
  );
}
