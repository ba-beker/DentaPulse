import { describe, expect, it } from "vitest";
import { surfaceSchema, surfacesFor } from "./surfaces.js";
import { ADULT_TEETH, PEDIATRIC_TEETH, toothMeta } from "./teeth.js";

describe("surfacesFor", () => {
  it("returns the five valid surfaces for every tooth", () => {
    for (const fdi of [...ADULT_TEETH, ...PEDIATRIC_TEETH]) {
      const surfaces = surfacesFor(fdi);
      const type = toothMeta(fdi).type;
      const first = type === "incisor" || type === "canine" ? "I" : "O";
      expect(surfaces).toEqual([first, "M", "D", "B", "L"]);
      expect(surfaces).toHaveLength(5);
      expect(surfaces.includes("O") && surfaces.includes("I")).toBe(false);
    }
  });

  it("uses I on anterior teeth and O on posterior teeth", () => {
    expect(surfacesFor(11)).toEqual(["I", "M", "D", "B", "L"]);
    expect(surfacesFor(13)).toEqual(["I", "M", "D", "B", "L"]);
    expect(surfacesFor(14)).toEqual(["O", "M", "D", "B", "L"]);
    expect(surfacesFor(16)).toEqual(["O", "M", "D", "B", "L"]);
    expect(surfacesFor(53)).toEqual(["I", "M", "D", "B", "L"]);
    expect(surfacesFor(54)).toEqual(["O", "M", "D", "B", "L"]);
  });

  it("rejects an unknown tooth and unknown surface codes", () => {
    expect(() => surfacesFor(19)).toThrow(RangeError);
    expect(surfaceSchema.safeParse("B").success).toBe(true);
    expect(surfaceSchema.safeParse("V").success).toBe(false);
    expect(surfaceSchema.options).toEqual(["O", "I", "M", "D", "B", "L"]);
  });
});
