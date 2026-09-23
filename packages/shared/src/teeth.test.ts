import { describe, expect, it } from "vitest";
import {
  ADULT_TEETH,
  PEDIATRIC_TEETH,
  chartRows,
  defaultDentition,
  isValidFdi,
  quadrantsFor,
  teethInQuadrant,
  toothMeta,
  type Arch,
  type Quadrant,
  type Side,
  type ToothDentition,
  type ToothType,
} from "./teeth.js";

function range(quadrant: number, count: number): number[] {
  return Array.from({ length: count }, (_, index) => quadrant * 10 + index + 1);
}

function expectedType(position: number, dentition: ToothDentition): ToothType {
  if (position <= 2) return "incisor";
  if (position === 3) return "canine";
  if (dentition === "pediatric" || position >= 6) return "molar";
  return "premolar";
}

function expectedArch(quadrant: number): Arch {
  return quadrant === 1 || quadrant === 2 || quadrant === 5 || quadrant === 6 ? "upper" : "lower";
}

function expectedSide(quadrant: number): Side {
  return quadrant === 1 || quadrant === 4 || quadrant === 5 || quadrant === 8 ? "right" : "left";
}

describe("FDI teeth", () => {
  it("lists 32 adult and 20 pediatric teeth in quadrant order", () => {
    expect(ADULT_TEETH).toEqual([...range(1, 8), ...range(2, 8), ...range(3, 8), ...range(4, 8)]);
    expect(PEDIATRIC_TEETH).toEqual([
      ...range(5, 5),
      ...range(6, 5),
      ...range(7, 5),
      ...range(8, 5),
    ]);
    expect(new Set(ADULT_TEETH).size).toBe(32);
    expect(new Set(PEDIATRIC_TEETH).size).toBe(20);
  });

  it("describes every adult and pediatric tooth", () => {
    for (const fdi of ADULT_TEETH) {
      const quadrant = Math.floor(fdi / 10) as Quadrant;
      const position = fdi % 10;
      expect(isValidFdi(fdi, "adult")).toBe(true);
      expect(isValidFdi(fdi, "pediatric")).toBe(false);
      expect(isValidFdi(fdi, "mixed")).toBe(true);
      expect(toothMeta(fdi)).toEqual({
        quadrant,
        arch: expectedArch(quadrant),
        side: expectedSide(quadrant),
        type: expectedType(position, "adult"),
        dentition: "adult",
      });
    }

    for (const fdi of PEDIATRIC_TEETH) {
      const quadrant = Math.floor(fdi / 10) as Quadrant;
      const position = fdi % 10;
      expect(isValidFdi(fdi, "pediatric")).toBe(true);
      expect(isValidFdi(fdi, "adult")).toBe(false);
      expect(isValidFdi(fdi, "mixed")).toBe(true);
      expect(toothMeta(fdi)).toEqual({
        quadrant,
        arch: expectedArch(quadrant),
        side: expectedSide(quadrant),
        type: expectedType(position, "pediatric"),
        dentition: "pediatric",
      });
    }
  });

  it("keeps primary molars out of the premolar class", () => {
    for (const fdi of PEDIATRIC_TEETH) {
      expect(toothMeta(fdi).type).not.toBe("premolar");
    }
    expect(toothMeta(54).type).toBe("molar");
    expect(toothMeta(14).type).toBe("premolar");
    expect(toothMeta(13).type).toBe("canine");
    expect(toothMeta(11).type).toBe("incisor");
    expect(toothMeta(16).type).toBe("molar");
  });

  it("rejects numbers outside the dentition", () => {
    for (const fdi of [0, 10, 19, 20, 29, 50, 56, 86, 99, -11, 11.5, Number.NaN]) {
      expect(isValidFdi(fdi, "adult")).toBe(false);
      expect(isValidFdi(fdi, "pediatric")).toBe(false);
      expect(isValidFdi(fdi, "mixed")).toBe(false);
      expect(() => toothMeta(fdi)).toThrow(RangeError);
    }
  });

  it("lists each quadrant from the viewer's left to right", () => {
    expect(quadrantsFor("adult")).toEqual([1, 2, 3, 4]);
    expect(quadrantsFor("pediatric")).toEqual([5, 6, 7, 8]);
    expect(quadrantsFor("mixed")).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(teethInQuadrant(1)).toEqual([18, 17, 16, 15, 14, 13, 12, 11]);
    expect(teethInQuadrant(2)).toEqual([21, 22, 23, 24, 25, 26, 27, 28]);
    expect(teethInQuadrant(3)).toEqual([31, 32, 33, 34, 35, 36, 37, 38]);
    expect(teethInQuadrant(4)).toEqual([48, 47, 46, 45, 44, 43, 42, 41]);
    expect(teethInQuadrant(5)).toEqual([55, 54, 53, 52, 51]);
    expect(teethInQuadrant(6)).toEqual([61, 62, 63, 64, 65]);
    expect(teethInQuadrant(7)).toEqual([71, 72, 73, 74, 75]);
    expect(teethInQuadrant(8)).toEqual([85, 84, 83, 82, 81]);
    expect(() => teethInQuadrant(0 as Quadrant)).toThrow(RangeError);
    expect(() => teethInQuadrant(9 as Quadrant)).toThrow(RangeError);
  });

  it("builds both arches in chart order", () => {
    expect(chartRows("adult")).toEqual({
      upper: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
      lower: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
    });
    expect(chartRows("pediatric")).toEqual({
      upper: [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
      lower: [85, 84, 83, 82, 81, 71, 72, 73, 74, 75],
    });

    const adultListed = [...chartRows("adult").upper, ...chartRows("adult").lower];
    const pediatricListed = [...chartRows("pediatric").upper, ...chartRows("pediatric").lower];
    expect(new Set(adultListed)).toEqual(new Set(ADULT_TEETH));
    expect(new Set(pediatricListed)).toEqual(new Set(PEDIATRIC_TEETH));

    const mixed = chartRows("mixed");
    expect(mixed.upper).toEqual([...chartRows("adult").upper, ...chartRows("pediatric").upper]);
    expect(mixed.lower).toEqual([...chartRows("adult").lower, ...chartRows("pediatric").lower]);
  });

  it("picks the chart from age in Algiers", () => {
    const noon = (iso: string) => new Date(`${iso}T12:00:00.000Z`);
    const now = noon("2026-09-22");
    expect(defaultDentition(undefined, now)).toBe("adult");
    expect(defaultDentition(noon("2022-09-22"), now)).toBe("pediatric");
    expect(defaultDentition(noon("2020-09-23"), now)).toBe("pediatric");
    expect(defaultDentition(noon("2020-09-22"), now)).toBe("mixed");
    expect(defaultDentition(noon("2014-09-23"), now)).toBe("mixed");
    expect(defaultDentition(noon("2014-09-22"), now)).toBe("adult");
  });
});
