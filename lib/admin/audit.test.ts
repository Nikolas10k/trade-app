import { describe, expect, it } from "vitest";
import { formatAuditMetadata } from "./audit";

describe("formatAuditMetadata", () => {
  it("retorna null para metadata ausente ou vazia", () => {
    expect(formatAuditMetadata(null)).toBeNull();
    expect(formatAuditMetadata({})).toBeNull();
  });

  it("formata pares chave/valor em string curta", () => {
    expect(formatAuditMetadata({ days: 7 })).toBe("days: 7");
    expect(formatAuditMetadata({ days: 30, plan: "mensal" })).toBe("days: 30, plan: mensal");
  });

  it("ignora arrays e valores primitivos (não é um objeto de metadata válido)", () => {
    expect(formatAuditMetadata([1, 2, 3] as never)).toBeNull();
  });
});
