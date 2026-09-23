import { beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { installFrenchZodErrorMap } from "./zod-fr.js";

beforeAll(() => {
  installFrenchZodErrorMap();
});

function messageOf(result: z.SafeParseReturnType<unknown, unknown>): string {
  expect(result.success).toBe(false);
  if (result.success) return "";
  return result.error.issues[0]?.message ?? "";
}

describe("French zod error map", () => {
  it("translates a missing field", () => {
    const result = z.object({ name: z.string() }).safeParse({});
    expect(messageOf(result)).toBe("Ce champ est requis.");
  });

  it("translates an email and a minimum length", () => {
    expect(messageOf(z.string().email().safeParse("pas-un-courriel"))).toBe(
      "Adresse e-mail invalide.",
    );
    expect(messageOf(z.string().min(3).safeParse("ab"))).toBe(
      "Le texte doit contenir au moins 3 caractères.",
    );
  });

  it("translates a type mismatch without echoing the value", () => {
    const secret = "mot-de-passe-secret";
    const text = messageOf(z.number().safeParse(secret));
    expect(text).toBe("Type attendu : nombre. Type reçu : texte.");
    expect(text).not.toContain(secret);
  });

  it("is idempotent", () => {
    installFrenchZodErrorMap();
    expect(messageOf(z.string().safeParse(undefined))).toBe("Ce champ est requis.");
  });
});
