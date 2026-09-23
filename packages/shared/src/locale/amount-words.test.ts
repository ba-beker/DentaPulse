import { describe, expect, it } from "vitest";
import { amountInWords } from "./amount-words.js";

describe("amount in words", () => {
  it("spells dinars in French, singular only for one", () => {
    expect(amountInWords(12_500)).toBe("douze mille cinq cents dinars algériens");
    expect(amountInWords(1)).toBe("un dinar algérien");
    expect(amountInWords(0)).toBe("zéro dinars algériens");
    expect(amountInWords(21)).toBe("vingt et un dinars algériens");
    expect(amountInWords(80)).toBe("quatre-vingts dinars algériens");
  });
});
