"use server";

import { redirect } from "next/navigation";
import { getAppBaseUrl } from "@/lib/db/env";
import { createClient } from "@/lib/db/supabase-server";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/lib/validation/auth";
import { fieldErrorsFromZod } from "@/lib/validation/zod-errors";

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${getAppBaseUrl()}/auth/confirm?type=signup`,
    },
  });

  // Mensagem sempre igual, exista ou não o e-mail, para não permitir enumeração.
  if (error && error.code !== "user_already_exists") {
    return {
      ok: false,
      message: "Não foi possível completar o cadastro. Tente novamente em instantes.",
    };
  }

  redirect("/verificar-email");
}

export async function logInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Mensagem genérica: não revela se o e-mail existe, está errado ou não foi
    // verificado (evita enumeração de contas).
    return { ok: false, message: "E-mail ou senha inválidos, ou conta ainda não verificada." };
  }

  redirect("/dashboard");
}

export async function logOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getAppBaseUrl()}/auth/confirm?type=recovery`,
  });

  // Sempre "sucesso" do ponto de vista do usuário, exista ou não o e-mail.
  return { ok: true, message: "Se o e-mail existir, enviaremos um link de redefinição." };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/esqueci-senha");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { ok: false, message: "Não foi possível redefinir a senha. Peça um novo link." };
  }

  redirect("/dashboard");
}

export async function resendVerificationAction(): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email) {
    await supabase.auth.resend({ type: "signup", email: user.email });
  }
  return { ok: true, message: "Se a conta existir e ainda não tiver sido verificada, reenviamos o e-mail." };
}
