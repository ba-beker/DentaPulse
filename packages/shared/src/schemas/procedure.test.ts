import { describe, expect, it } from "vitest";
import {
  createProcedureBodySchema,
  previewDeductionBodySchema,
  updateProcedureBodySchema,
} from "./procedure.js";

const consumableA = "a".repeat(24);
const consumableB = "b".repeat(24);

const base = {
  name: "Obturation composite",
  category: "Soins conservateurs",
  basePrice: 8000,
  durationMinutes: 45,
};

describe("procedure schemas", () => {
  it("uppercases the code and keeps a recipe", () => {
    const parsed = createProcedureBodySchema.parse({
      ...base,
      code: "obt-comp",
      consumables: [
        { consumableId: consumableA, quantityUsed: 1 },
        { consumableId: consumableB.toUpperCase(), quantityUsed: 0.5 },
      ],
    });
    expect(parsed.code).toBe("OBT-COMP");
    expect(parsed.isActive).toBe(true);
    expect(parsed.consumables[1]?.consumableId).toBe(consumableB);
  });

  it("rejects a consumable repeated with a different id case", () => {
    const result = createProcedureBodySchema.safeParse({
      ...base,
      consumables: [
        { consumableId: consumableA, quantityUsed: 1 },
        { consumableId: consumableA.toUpperCase(), quantityUsed: 2 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a quantity that is not strictly positive", () => {
    expect(
      createProcedureBodySchema.safeParse({
        ...base,
        consumables: [{ consumableId: consumableA, quantityUsed: 0 }],
      }).success,
    ).toBe(false);
  });

  it("rejects an empty patch", () => {
    expect(updateProcedureBodySchema.safeParse({}).success).toBe(false);
  });

  it("defaults a deduction preview to one act", () => {
    expect(previewDeductionBodySchema.parse({})).toEqual({ quantity: 1 });
    expect(previewDeductionBodySchema.safeParse({ quantity: 0 }).success).toBe(false);
    expect(previewDeductionBodySchema.safeParse({ quantity: 1.5 }).success).toBe(false);
  });
});
