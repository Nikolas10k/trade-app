"use client";

import Script from "next/script";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * CAPTCHA nos formulários de login/cadastro/esqueci-senha, usando o suporte
 * nativo do Supabase Auth (basta mandar captchaToken em options — a chave
 * secreta fica configurada no dashboard do Supabase, nunca no app). Sem
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY configurada, não renderiza nada e os
 * formulários seguem funcionando sem CAPTCHA — mesmo padrão condicional do
 * Sentry (docs/SECURITY.md A09).
 */
export function TurnstileWidget() {
  if (!siteKey) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="dark" />
    </>
  );
}
