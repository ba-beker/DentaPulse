import { describe, expect, it } from "vitest";
import {
  adjustStockBodySchema,
  createConsumableBodySchema,
  listConsumablesQuerySchema,
  updateConsumableBodySchema,
} from "./consumable.js";

describe("consumable schemas", () => {
  it("requires a non-zero delta and a manual-adjustment reason", () => {
    const parsed = adjustStockBodySchema.parse({
      delta: -2,
      reason: "waste",
      note: "Flacon cassé",
    });
    expect(parsed).toEqual({ delta: -2, reason: "waste", note: "Flacon cassé" });

    expect(adjustStockBodySchema.safeParse({ delta: 0, reason: "manual_adjustment" }).success).toBe(
      false,
    );
    expect(adjustStockBodySchema.safeParse({ delta: 1 }).success).toBe(false);
    expect(adjustStockBodySchema.safeParse({ delta: 1, reason: "treatment" }).success).toBe(false);
  });

  it("uppercases the SKU and rejects a max below the alert", () => {
    const parsed = createConsumableBodySchema.parse({
      name: "Résine composite A2",
      sku: "res-a2",
      category: "Restaurateur",
      unit: "Capsule",
      costPerUnit: 850,
    });
    expect(parsed.sku).toBe("RES-A2");

    expect(
      createConsumableBodySchema.safeParse({
        name: "Gants",
        category: "Protection",
        unit: "Boîte",
        costPerUnit: 500,
        minStockAlert: 10,
        maxStockLevel: 5,
      }).success,
    ).toBe(false);
  });

  it("accepts a list query with search, status and sort", () => {
    const parsed = listConsumablesQuerySchema.parse({
      search: " gants ",
      status: "low",
      sort: "-currentStock",
      limit: "20",
    });
    expect(parsed.search).toBe("gants");
    expect(parsed.status).toBe("low");
    expect(parsed.sort).toBe("-currentStock");
    expect(parsed.limit).toBe(20);
  });

  it("rejects an empty patch", () => {
    expect(updateConsumableBodySchema.safeParse({}).success).toBe(false);
  });
});
