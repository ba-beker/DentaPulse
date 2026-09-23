import { describe, expect, it } from "vitest";
import { formatNational, isValidDzMobile, normalizeToE164, phoneSearchDigits } from "./phone.js";

const MOBILE_E164 = "+213555123456";

describe("DZ phone helpers", () => {
  it("normalizes mobile variants to E.164", () => {
    for (const input of [
      "0555123456",
      "0555 12 34 56",
      "05 55 12 34 56",
      "0555-12-34-56",
      "+213555123456",
      "+213 555 12 34 56",
      "00213555123456",
      "00213 555 12 34 56",
    ]) {
      expect(normalizeToE164(input)).toBe(MOBILE_E164);
      expect(formatNational(input)).toBe("0555 12 34 56");
      expect(isValidDzMobile(input)).toBe(true);
      expect(phoneSearchDigits(input)).toBe("555123456");
    }
  });

  it("accepts 06 and 07 mobiles", () => {
    expect(normalizeToE164("0666123456")).toBe("+213666123456");
    expect(formatNational("00213 666 12 34 56")).toBe("0666 12 34 56");
    expect(isValidDzMobile("+213777123456")).toBe(true);
    expect(formatNational("0777123456")).toBe("0777 12 34 56");
  });

  it("keeps a landline dialable and out of the mobile check", () => {
    expect(normalizeToE164("021 23 45 67")).toBe("+21321234567");
    expect(formatNational("021234567")).toBe("021 23 45 67");
    expect(isValidDzMobile("021 23 45 67")).toBe(false);
    expect(isValidDzMobile("+21321234567")).toBe(false);
  });

  it("rejects empty, foreign and incomplete numbers", () => {
    for (const input of ["", "   ", "abc", "055512345", "05551234567", "+33612345678"]) {
      expect(normalizeToE164(input)).toBeNull();
      expect(formatNational(input)).toBeNull();
      expect(isValidDzMobile(input)).toBe(false);
    }
  });
});
