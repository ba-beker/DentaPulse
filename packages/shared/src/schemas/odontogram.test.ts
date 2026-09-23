import { describe, expect, it } from "vitest";
import { DENTITIONS } from "../teeth.js";
import {
  chartToothParamsSchema,
  dentitionSchema,
  patchDentitionBodySchema,
  patchToothBodySchema,
} from "./odontogram.js";

describe("odontogram schemas", () => {
  it("locks dentition to adult, pediatric, and mixed", () => {
    expect(dentitionSchema.options).toEqual([...DENTITIONS]);
    expect(patchDentitionBodySchema.safeParse({ version: 0, dentition: "mixed" }).success).toBe(
      true,
    );
    expect(patchDentitionBodySchema.safeParse({ version: 0, dentition: "primary" }).success).toBe(
      false,
    );
  });

  it("requires a version and at least one tooth change", () => {
    expect(patchToothBodySchema.safeParse({ wholeCondition: "caries" }).success).toBe(false);
    expect(patchToothBodySchema.safeParse({ version: 0 }).success).toBe(false);
    expect(patchToothBodySchema.safeParse({ version: 1, notes: "Contrôle" }).success).toBe(true);
  });

  it("rejects crown, implant, and missing on a face", () => {
    for (const condition of ["crown", "implant", "missing"]) {
      const parsed = patchToothBodySchema.safeParse({
        version: 0,
        surfaces: { O: condition },
      });
      expect(parsed.success).toBe(false);
    }
    expect(patchToothBodySchema.safeParse({ version: 0, surfaces: { O: "caries" } }).success).toBe(
      true,
    );
  });

  it("rejects an FDI number outside both dentitions", () => {
    expect(chartToothParamsSchema.safeParse({ patientId: "a".repeat(24), fdi: "19" }).success).toBe(
      false,
    );
    expect(chartToothParamsSchema.safeParse({ patientId: "a".repeat(24), fdi: "16" }).success).toBe(
      true,
    );
    expect(chartToothParamsSchema.safeParse({ patientId: "a".repeat(24), fdi: "51" }).success).toBe(
      true,
    );
  });
});
