"use client";

import { useActionState } from "react";
import { FieldError, Input, Label } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { DELETE_ACCOUNT_PHRASE } from "@/lib/validation/account";
import { deleteAccountAction, type DeleteAccountState } from "./actions";

const initialState: DeleteAccountState = { ok: false };

export function DeleteAccountForm() {
  const [state, formAction] = useActionState(deleteAccountAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="confirmation">
          Digite <span className="font-mono text-danger">{DELETE_ACCOUNT_PHRASE}</span> para
          confirmar
        </Label>
        <Input id="confirmation" name="confirmation" autoComplete="off" required />
        <FieldError message={state.message} />
      </div>
      <ConfirmSubmitButton
        variant="danger"
        confirmMessage="Tem certeza? Isso apaga sua conta e todos os seus trades de forma definitiva — não tem como desfazer."
      >
        Excluir minha conta
      </ConfirmSubmitButton>
    </form>
  );
}
