import { z } from "zod";

export const toothConditionSchema = z.enum([
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

export const treatmentStatusSchema = z.enum(["planned", "in_progress", "completed", "cancelled"]);

export const appointmentStatusSchema = z.enum([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);

export const roleSchema = z.enum(["owner", "dentist", "assistant", "receptionist"]);

export const riskTagSchema = z.enum([
  "penicillin_allergy",
  "diabetes",
  "hypertension",
  "coagulation_risk",
  "pregnancy",
  "cardiac",
  "latex_allergy",
  "other",
]);

export const stockStatusSchema = z.enum(["in_stock", "low", "out", "expiring_soon", "expired"]);

export const stockMovementReasonSchema = z.enum([
  "treatment",
  "purchase_receipt",
  "manual_adjustment",
  "waste",
  "expiry",
]);

/** Reasons allowed on POST /consumables/:id/adjust. Treatment deductions go through the EMR. */
export const adjustStockReasonSchema = z.enum([
  "purchase_receipt",
  "manual_adjustment",
  "waste",
  "expiry",
]);

export const paymentMethodSchema = z.enum(["cash", "card", "transfer", "cheque"]);

export type ToothCondition = z.infer<typeof toothConditionSchema>;
export type TreatmentStatus = z.infer<typeof treatmentStatusSchema>;
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;
export type Role = z.infer<typeof roleSchema>;
export type RiskTag = z.infer<typeof riskTagSchema>;
export type StockStatus = z.infer<typeof stockStatusSchema>;
export type StockMovementReason = z.infer<typeof stockMovementReasonSchema>;
export type AdjustStockReason = z.infer<typeof adjustStockReasonSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
