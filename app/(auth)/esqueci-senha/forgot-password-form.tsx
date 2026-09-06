"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, FieldError, Input, Label } from "@/components/ui";
import { forgotPasswordAction, type ActionState } from "../actions";

const initialState: ActionState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Enviando…" : "Enviar link"}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, initialState);

  if (state.ok && state.message) {
    return <p className="text-sm text-success">{state.message}</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        <FieldError message={state.fieldErrors?.email} />
      </div>
      {state.message ? <FieldError message={state.message} /> : null}
      <SubmitButton />
    </form>
  );
}
