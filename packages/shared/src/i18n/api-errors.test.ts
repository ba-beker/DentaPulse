import { describe, expect, it } from "vitest";
import { apiErrorCodes, apiErrorMessages, type ApiErrorCode } from "./api-errors.js";

describe("API error catalog", () => {
  it("has a French message for every code", () => {
    const codes = Object.values(apiErrorCodes);
    expect(Object.keys(apiErrorMessages).sort()).toEqual([...codes].sort());

    for (const code of codes) {
      const message: string = apiErrorMessages[code];
      expect(message.length).toBeGreaterThan(0);
      expect(message).not.toMatch(/\b(Invalid|Error|Not found|Unauthorized|Too many)\b/);
    }
  });

  it("keeps codes stable and distinct", () => {
    const codes = Object.values(apiErrorCodes) satisfies readonly ApiErrorCode[];
    expect(new Set(codes).size).toBe(codes.length);
  });
});
