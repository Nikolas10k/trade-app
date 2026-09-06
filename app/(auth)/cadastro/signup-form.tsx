"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, FieldError, Input, Label } from "@/components/ui";
import { passwordStrength } from "@/lib/validation/auth";
import { signUpAction, type ActionState } from "../actions";

const initialState: ActionState = { ok: false };

const STRENGTH_LABELS = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
const STRENGTH_COLORS = ["bg-danger", "bg-danger", "bg-gold", "bg-secondary", "bg-success"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Criando conta…" : "Começar 3 dias grátis"}
    </Button>
  );
}

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);
  const [password, setPassword] = useState("");
  const strength = passwordStrength(password);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="displayName">Nome</Label>
        <Input id="displayName" name="displayName" autoComplete="name" required />
        <FieldError message={state.fieldErrors?.displayName} />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        <FieldError message={state.fieldErrors?.email} />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {password ? (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-full flex-1 rounded-full ${
                    i < strength ? STRENGTH_COLORS[strength] : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-text-muted">{STRENGTH_LABELS[strength]}</span>
          </div>
        ) : null}
        <FieldError message={state.fieldErrors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
        <FieldError message={state.fieldErrors?.confirmPassword} />
      </div>
      <div className="flex items-start gap-2">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-white/20 bg-black/20"
        />
        <Label htmlFor="consent" className="mb-0 font-normal">
          Li e aceito os{" "}
          <a href="/termos" className="text-secondary-light hover:underline" target="_blank">
            Termos de Uso
          </a>{" "}
          e a{" "}
          <a href="/privacidade" className="text-secondary-light hover:underline" target="_blank">
            Política de Privacidade
          </a>
          .
        </Label>
      </div>
      <FieldError message={state.fieldErrors?.consent} />
      {state.message ? <FieldError message={state.message} /> : null}
      <SubmitButton />
    </form>
  );
}
