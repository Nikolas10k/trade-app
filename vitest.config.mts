import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": import.meta.dirname,
      // Fora do build do Next, "server-only" sempre lança — a proteção real é do
      // bundler, não faz sentido em testes de unidade (Node puro).
      "server-only": `${import.meta.dirname}/tests/stubs/server-only.ts`,
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "lib/**/*.test.ts", "app/**/*.test.ts"],
  },
});
