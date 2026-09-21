import * as Sentry from "@sentry/nextjs";

/**
 * Sem SENTRY_DSN (padrão até a Fase 9/go-live), isto é um no-op completo —
 * nenhuma chamada de rede, nenhum overhead. Ver docs/SECURITY.md (A09) e
 * RUNBOOK.md para como conectar uma conta Sentry real depois.
 */
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    // Payload de trade/checklist do usuário nunca deve ir pro Sentry — só
    // stack trace e contexto de request. Nenhum código deste app chama
    // Sentry.setContext/setExtra com dado de trade, então não há vazamento
    // por construção, mas deixamos explícito aqui como guarda de intenção.
    sendDefaultPii: false,
  });
}
