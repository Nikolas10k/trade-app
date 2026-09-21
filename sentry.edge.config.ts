import * as Sentry from "@sentry/nextjs";

/** Mesmo guard de sentry.server.config.ts — ver ali para o porquê. Cobre o proxy.ts (middleware), que roda no runtime edge. */
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}
