import { describe, expect, it } from "vitest";
import { needsMfaChallenge } from "./mfa";

describe("needsMfaChallenge", () => {
  it("exige desafio quando a sessão está em aal1 mas o próximo nível é aal2", () => {
    expect(needsMfaChallenge({ currentLevel: "aal1", nextLevel: "aal2" })).toBe(true);
  });

  it("não exige desafio quando já está em aal2", () => {
    expect(needsMfaChallenge({ currentLevel: "aal2", nextLevel: "aal2" })).toBe(false);
  });

  it("não exige desafio quando o usuário não tem nenhum fator verificado (aal1 → aal1)", () => {
    expect(needsMfaChallenge({ currentLevel: "aal1", nextLevel: "aal1" })).toBe(false);
  });

  it("não exige desafio quando os níveis vêm null (sem sessão)", () => {
    expect(needsMfaChallenge({ currentLevel: null, nextLevel: null })).toBe(false);
  });
});
