import * as Sentry from "@sentry/nextjs";

/**
 * Hook oficial do Next.js, chamado uma vez quando o servidor sobe — ver
 * https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation.
 * Os configs importados abaixo só inicializam o Sentry de fato se
 * SENTRY_DSN estiver definido (ver sentry.server.config.ts).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError: typeof Sentry.captureRequestError = (...args) => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureRequestError(...args);
  }
};
