import { describe, expect, it } from "vitest";
import {
  adjustStockReasonSchema,
  appointmentStatusSchema,
  paymentMethodSchema,
  riskTagSchema,
  roleSchema,
  stockMovementReasonSchema,
  stockStatusSchema,
  toothConditionSchema,
  treatmentStatusSchema,
} from "./enums.js";

describe("domain enums", () => {
  it("locks the clinical and operational values", () => {
    expect(toothConditionSchema.options).toEqual([
      "healthy",
      "caries",
      "filling",
      "crown",
      "implant",
      "missing",
      "endodontic",
      "bridge",
      "fracture",
      "extraction_planned",
    ]);
    expect(treatmentStatusSchema.options).toEqual([
      "planned",
      "in_progress",
      "completed",
      "cancelled",
    ]);
    expect(appointmentStatusSchema.options).toEqual([
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "no_show",
    ]);
    expect(roleSchema.options).toEqual(["owner", "dentist", "assistant", "receptionist"]);
    expect(riskTagSchema.options).toEqual([
      "penicillin_allergy",
      "diabetes",
      "hypertension",
      "coagulation_risk",
      "pregnancy",
      "cardiac",
      "latex_allergy",
      "other",
    ]);
    expect(stockStatusSchema.options).toEqual([
      "in_stock",
      "low",
      "out",
      "expiring_soon",
      "expired",
    ]);
    expect(stockMovementReasonSchema.options).toEqual([
      "treatment",
      "purchase_receipt",
      "manual_adjustment",
      "waste",
      "expiry",
    ]);
    expect(adjustStockReasonSchema.options).toEqual([
      "purchase_receipt",
      "manual_adjustment",
      "waste",
      "expiry",
    ]);
    expect(paymentMethodSchema.options).toEqual(["cash", "card", "transfer", "cheque"]);
  });

  it("rejects unknown values", () => {
    expect(toothConditionSchema.safeParse("decay").success).toBe(false);
    expect(roleSchema.safeParse("admin").success).toBe(false);
    expect(paymentMethodSchema.parse("cash")).toBe("cash");
  });
});
