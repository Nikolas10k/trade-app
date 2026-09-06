"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { resendVerificationAction } from "../actions";

export function ResendVerificationButton() {
  const [cooldown, setCooldown] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setCooldown(true);
    const result = await resendVerificationAction();
    setMessage(result.message ?? null);
    setTimeout(() => setCooldown(false), 60_000);
  }

  return (
    <div>
      <Button variant="ghost" onClick={handleClick} disabled={cooldown}>
        {cooldown ? "Aguarde para reenviar…" : "Reenviar e-mail de verificação"}
      </Button>
      {message ? <p className="mt-3 text-sm text-text-muted">{message}</p> : null}
    </div>
  );
}
