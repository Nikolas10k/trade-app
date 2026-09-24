"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, FieldError, Input, Label } from "@/components/ui";
import type { ActionState } from "../actions";
import { verifyTwoFactorAction } from "./actions";

const initialState: ActionState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Verificando…" : "Verificar"}
    </Button>
  );
}

export function VerifyTwoFactorForm() {
  const [state, formAction] = useActionState(verifyTwoFactorAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="code">Código de 6 dígitos</Label>
        <Input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          pattern="\d{6}"
          autoFocus
          required
          className="text-center text-lg tracking-[0.5em]"
        />
        <FieldError message={state.fieldErrors?.code} />
      </div>
      {state.message ? <FieldError message={state.message} /> : null}
      <SubmitButton />
    </form>
  );
}
