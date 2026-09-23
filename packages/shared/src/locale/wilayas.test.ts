import { describe, expect, it } from "vitest";
import {
  WILAYA_COUNT,
  WILAYA_LIST_VERSION,
  WILAYA_TRANSITION_ENDS,
  WILAYAS,
  wilayaByCode,
} from "./wilayas.js";

describe("wilayas", () => {
  it("lists 69 unique official wilayas", () => {
    expect(WILAYAS).toHaveLength(WILAYA_COUNT);
    expect(WILAYA_COUNT).toBe(69);
    expect(WILAYA_LIST_VERSION).toBe("2026-06-03");
    expect(WILAYA_TRANSITION_ENDS).toBe("2026-12-31");

    const codes = WILAYAS.map((wilaya) => wilaya.code);
    const namesFr = WILAYAS.map((wilaya) => wilaya.nameFr);
    const namesAr = WILAYAS.map((wilaya) => wilaya.nameAr);

    expect(new Set(codes)).toEqual(new Set(Array.from({ length: 69 }, (_, index) => index + 1)));
    expect(codes).toEqual([...codes].sort((a, b) => a - b));
    expect(new Set(namesFr).size).toBe(69);
    expect(new Set(namesAr).size).toBe(69);

    for (const wilaya of WILAYAS) {
      expect(wilaya.nameFr.length).toBeGreaterThan(0);
      expect(wilaya.nameAr).toMatch(/\p{Script=Arabic}/u);
      expect(wilaya.nameFr).not.toMatch(/\p{Script=Arabic}/u);
      expect(wilayaByCode(wilaya.code)).toEqual(wilaya);
    }

    expect(wilayaByCode(0)).toBeUndefined();
    expect(wilayaByCode(70)).toBeUndefined();
  });

  it("keeps the Journal officiel spellings for the new codes", () => {
    expect(wilayaByCode(16)?.nameFr).toBe("Alger");
    expect(wilayaByCode(31)?.nameFr).toBe("Oran");
    expect(wilayaByCode(38)?.nameAr).toBe("تيسمسيلت");
    expect(wilayaByCode(57)?.nameFr).toBe("El M'Ghaier");
    expect(wilayaByCode(58)?.nameFr).toBe("El Meniaa");
    expect(wilayaByCode(59)?.nameFr).toBe("Aflou");
    expect(wilayaByCode(65)?.nameFr).toBe("Aïn Ouessara");
    expect(wilayaByCode(65)?.nameAr).toBe("عين وسارة");
    expect(wilayaByCode(68)?.nameFr).toBe("Bou Saâda");
    expect(wilayaByCode(69)?.nameFr).toBe("El Abiodh Sidi Cheikh");
    expect(wilayaByCode(69)?.nameAr).toBe("الأبيض سيدي الشيخ");
  });
});
