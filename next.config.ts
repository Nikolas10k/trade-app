import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://*.supabase.co";
const supabaseOrigin = (() => {
  try {
    return new URL(supabaseUrl).origin;
  } catch {
    return "https://*.supabase.co";
  }
})();

const csp = [
  "default-src 'self'",
  // 'unsafe-inline' é necessário mesmo em produção: o próprio Next.js injeta
  // scripts inline para entregar o conteúdo das páginas com streaming/
  // Suspense (loading.tsx). Sem isso, toda página com loading.tsx trava no
  // esqueleto pra sempre — só o CSP bloqueando o próprio Next.js.
  // Um CSP com nonce por request eliminaria essa permissão, mas exige tornar
  // TODAS as páginas dinâmicas (perde o cache estático da landing/telas de
  // auth) — troca de performance que não faço sem decisão explícita.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} https://api.mercadopago.com`,
  "font-src 'self' https://fonts.gstatic.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // Habilita forbidden()/unauthorized() (usados por requireAdmin) para dar
  // um 403 de verdade em vez de um redirect genérico.
  experimental: {
    authInterrupts: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
