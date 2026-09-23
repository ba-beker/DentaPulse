import { describe, expect, it } from "vitest";
import { applyToothUpdate, dentitionFitsTeeth, type ChartToothState } from "./chart-rules.js";

function tooth(overrides: Partial<ChartToothState> = {}): ChartToothState {
  return {
    fdi: 16,
    wholeCondition: "healthy",
    surfaces: {},
    ...overrides,
  };
}

describe("applyToothUpdate", () => {
  it("accepts I on incisors and canines, and O on premolars and molars", () => {
    expect(applyToothUpdate(undefined, 11, { surfaces: { I: "caries" } }).ok).toBe(true);
    expect(applyToothUpdate(undefined, 13, { surfaces: { I: "caries" } }).ok).toBe(true);
    expect(applyToothUpdate(undefined, 53, { surfaces: { I: "filling" } }).ok).toBe(true);
    expect(applyToothUpdate(undefined, 14, { surfaces: { O: "caries" } }).ok).toBe(true);
    expect(applyToothUpdate(undefined, 16, { surfaces: { O: "caries" } }).ok).toBe(true);
    expect(applyToothUpdate(undefined, 54, { surfaces: { O: "caries" } }).ok).toBe(true);
  });

  it("rejects O on anterior teeth and I on posterior teeth", () => {
    const incisor = applyToothUpdate(undefined, 11, { surfaces: { O: "caries" } });
    const canine = applyToothUpdate(undefined, 13, { surfaces: { O: "caries" } });
    const premolar = applyToothUpdate(undefined, 14, { surfaces: { I: "caries" } });
    const molar = applyToothUpdate(undefined, 16, { surfaces: { I: "caries" } });
    const primaryMolar = applyToothUpdate(undefined, 54, { surfaces: { I: "caries" } });

    expect(incisor).toEqual({ ok: false, error: { code: "invalid_surface", surface: "O" } });
    expect(canine).toEqual({ ok: false, error: { code: "invalid_surface", surface: "O" } });
    expect(premolar).toEqual({ ok: false, error: { code: "invalid_surface", surface: "I" } });
    expect(molar).toEqual({ ok: false, error: { code: "invalid_surface", surface: "I" } });
    expect(primaryMolar).toEqual({ ok: false, error: { code: "invalid_surface", surface: "I" } });
  });

  it("rejects crown, implant, and missing as surface conditions", () => {
    for (const condition of ["crown", "implant", "missing"] as const) {
      expect(applyToothUpdate(undefined, 16, { surfaces: { O: condition } })).toEqual({
        ok: false,
        error: { code: "whole_tooth_surface", surface: "O" },
      });
    }
  });

  it("clears surfaces when the tooth is marked missing, crowned, or implanted", () => {
    const current = tooth({ surfaces: { O: "caries", M: "filling" } });

    for (const wholeCondition of ["missing", "crown", "implant"] as const) {
      const result = applyToothUpdate(current, 16, {
        wholeCondition,
        surfaces: { O: "caries" },
      });
      expect(result).toEqual({
        ok: true,
        tooth: { fdi: 16, wholeCondition, surfaces: {} },
      });
    }
  });

  it("refuses new surfaces on a tooth that is already missing, crowned, or implanted", () => {
    const current = tooth({ wholeCondition: "crown", surfaces: {} });
    expect(applyToothUpdate(current, 16, { surfaces: { O: "caries" } })).toEqual({
      ok: false,
      error: { code: "surfaces_not_allowed" },
    });
  });

  it("keeps untouched surfaces and replaces only the faces sent", () => {
    const result = applyToothUpdate(tooth({ surfaces: { O: "caries", M: "filling" } }), 16, {
      surfaces: { M: "healthy" },
    });
    expect(result).toEqual({
      ok: true,
      tooth: {
        fdi: 16,
        wholeCondition: "healthy",
        surfaces: { O: "caries", M: "healthy" },
      },
    });
  });

  it("drops blank notes and keeps notes when they are omitted", () => {
    const cleared = applyToothUpdate(tooth({ notes: "Ancienne note" }), 16, { notes: "  " });
    const kept = applyToothUpdate(tooth({ notes: "Surveillance" }), 16, {
      wholeCondition: "caries",
    });
    expect(cleared.ok && cleared.tooth.notes).toBeUndefined();
    expect(kept.ok && kept.tooth.notes).toBe("Surveillance");
  });
});

describe("dentitionFitsTeeth", () => {
  it("allows a primary tooth beside a permanent tooth only on a mixed chart", () => {
    expect(dentitionFitsTeeth([11, 51], "mixed")).toBe(true);
    expect(dentitionFitsTeeth([51], "adult")).toBe(false);
    expect(dentitionFitsTeeth([16], "pediatric")).toBe(false);
    expect(dentitionFitsTeeth([11, 16], "adult")).toBe(true);
    expect(dentitionFitsTeeth([], "pediatric")).toBe(true);
  });
});
