import { describe, expect, it } from "vitest";
import { hasVerifiedTotpFactor, needsMfaChallenge } from "./mfa";

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

describe("hasVerifiedTotpFactor", () => {
  it("false quando não há nenhum fator", () => {
    expect(hasVerifiedTotpFactor({ factors: [] })).toBe(false);
    expect(hasVerifiedTotpFactor({ factors: undefined })).toBe(false);
  });

  it("false quando o fator TOTP existe mas ainda não foi verificado", () => {
    expect(
      hasVerifiedTotpFactor({
        factors: [{ id: "1", factor_type: "totp", status: "unverified" } as never],
      }),
    ).toBe(false);
  });

  it("true quando há um fator TOTP verificado", () => {
    expect(
      hasVerifiedTotpFactor({
        factors: [{ id: "1", factor_type: "totp", status: "verified" } as never],
      }),
    ).toBe(true);
  });

  it("ignora fatores verificados de outro tipo (ex.: phone)", () => {
    expect(
      hasVerifiedTotpFactor({
        factors: [{ id: "1", factor_type: "phone", status: "verified" } as never],
      }),
    ).toBe(false);
  });
});
