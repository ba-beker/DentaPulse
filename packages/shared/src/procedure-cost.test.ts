import { describe, expect, it } from "vitest";
import { analyzeProcedureCost, previewProcedureDeduction } from "./procedure-cost.js";

describe("procedure cost analysis", () => {
  it("sums rounded line costs and subtracts them from the fee", () => {
    const analysis = analyzeProcedureCost(8_000, [
      { consumableId: "resin", quantityUsed: 1, costPerUnit: 350, currentStock: 10 },
      { consumableId: "gel", quantityUsed: 1.5, costPerUnit: 40, currentStock: 10 },
      { consumableId: "brush", quantityUsed: 0.5, costPerUnit: 101, currentStock: 10 },
    ]);

    expect(analysis.lines.map((line) => line.lineCost)).toEqual([350, 60, 51]);
    expect(analysis.consumableCost).toBe(461);
    expect(analysis.margin).toBe(7_539);
  });

  it("reports a negative margin when consumables cost more than the fee", () => {
    const analysis = analyzeProcedureCost(100, [
      { consumableId: "implant", quantityUsed: 1, costPerUnit: 250, currentStock: 2 },
    ]);

    expect(analysis.consumableCost).toBe(250);
    expect(analysis.margin).toBe(-150);
  });

  it("is limited by the scarcest consumable and keeps the first tie", () => {
    const analysis = analyzeProcedureCost(1_000, [
      { consumableId: "gloves", quantityUsed: 2, costPerUnit: 20, currentStock: 10 },
      { consumableId: "anesthetic", quantityUsed: 1, costPerUnit: 80, currentStock: 3 },
      { consumableId: "gauze", quantityUsed: 3, costPerUnit: 15, currentStock: 9 },
      { consumableId: "mask", quantityUsed: 1, costPerUnit: 15, currentStock: 3 },
    ]);

    expect(analysis.lines.map((line) => line.feasibleCount)).toEqual([5, 3, 3, 3]);
    expect(analysis.feasibleCount).toBe(3);
    expect(analysis.limitingConsumableId).toBe("anesthetic");
  });

  it("is blocked when the scarcest stock cannot cover one use", () => {
    const analysis = analyzeProcedureCost(4_000, [
      { consumableId: "anesthetic", quantityUsed: 1, costPerUnit: 80, currentStock: 0 },
      { consumableId: "gauze", quantityUsed: 2, costPerUnit: 15, currentStock: 4 },
    ]);

    expect(analysis.feasibleCount).toBe(0);
    expect(analysis.limitingConsumableId).toBe("anesthetic");
  });

  it("counts an exact multiple and treats a fraction of a dose as not enough", () => {
    const exact = analyzeProcedureCost(500, [
      { consumableId: "gel", quantityUsed: 0.5, costPerUnit: 40, currentStock: 2 },
    ]);
    expect(exact.feasibleCount).toBe(4);

    const short = analyzeProcedureCost(500, [
      { consumableId: "gel", quantityUsed: 2, costPerUnit: 40, currentStock: 1.5 },
    ]);
    expect(short.feasibleCount).toBe(0);
  });

  it("survives a repeating binary fraction when counting uses", () => {
    const analysis = analyzeProcedureCost(500, [
      { consumableId: "dose", quantityUsed: 0.1, costPerUnit: 10, currentStock: 0.3 },
    ]);
    expect(analysis.feasibleCount).toBe(3);
    expect(analysis.lines[0]?.lineCost).toBe(1);
  });

  it("does not limit an act that consumes nothing", () => {
    const analysis = analyzeProcedureCost(2_000, []);
    expect(analysis).toEqual({
      consumableCost: 0,
      margin: 2_000,
      feasibleCount: null,
      limitingConsumableId: null,
      lines: [],
    });
  });

  it("rejects a fee or a unit cost that is not whole dinars", () => {
    expect(() => analyzeProcedureCost(10.5, [])).toThrow(RangeError);
    expect(() =>
      analyzeProcedureCost(100, [
        { consumableId: "gel", quantityUsed: 1, costPerUnit: 10.5, currentStock: 1 },
      ]),
    ).toThrow(RangeError);
  });
});

describe("procedure deduction preview", () => {
  const lines = [
    { consumableId: "resin", quantityUsed: 1, currentStock: 5 },
    { consumableId: "brush", quantityUsed: 2, currentStock: 10 },
    { consumableId: "anesthetic", quantityUsed: 1, currentStock: 3 },
  ];

  it("scales the recipe and lists only the lines that would be short", () => {
    const preview = previewProcedureDeduction(4, lines);

    expect(preview.quantity).toBe(4);
    expect(preview.canPerform).toBe(false);
    expect(preview.consumed).toEqual([
      { consumableId: "resin", quantity: 4 },
      { consumableId: "brush", quantity: 8 },
      { consumableId: "anesthetic", quantity: 4 },
    ]);
    expect(preview.short).toEqual([
      { consumableId: "anesthetic", required: 4, currentStock: 3, quantity: 1 },
    ]);
  });

  it("reports no shortage when stock covers the requested quantity", () => {
    const preview = previewProcedureDeduction(3, lines);
    expect(preview.canPerform).toBe(true);
    expect(preview.short).toEqual([]);
    expect(preview.consumed.map((line) => line.quantity)).toEqual([3, 6, 3]);
  });

  it("keeps a partial dose exact", () => {
    const preview = previewProcedureDeduction(3, [
      { consumableId: "dose", quantityUsed: 0.1, currentStock: 0.2 },
    ]);
    expect(preview.consumed).toEqual([{ consumableId: "dose", quantity: 0.3 }]);
    expect(preview.short).toEqual([
      { consumableId: "dose", required: 0.3, currentStock: 0.2, quantity: 0.1 },
    ]);
  });

  it("can preview an empty recipe", () => {
    expect(previewProcedureDeduction(1, [])).toEqual({
      quantity: 1,
      canPerform: true,
      consumed: [],
      short: [],
    });
  });

  it("rejects a quantity below one", () => {
    expect(() => previewProcedureDeduction(0, [])).toThrow(RangeError);
  });
});
