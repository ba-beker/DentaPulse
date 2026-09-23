import { DemoError } from "./types";

const ERROR_KEYS: Record<string, string> = {
  PATIENT_NOT_FOUND: "patientNotFound",
  PHONE_TAKEN: "phoneTaken",
  CONSUMABLE_NOT_FOUND: "consumableNotFound",
  PROCEDURE_NOT_FOUND: "procedureNotFound",
  APPOINTMENT_NOT_FOUND: "appointmentNotFound",
  PLAN_NOT_FOUND: "planNotFound",
  INSUFFICIENT_STOCK: "insufficientStock",
  STOCK_NEGATIVE: "stockNegative",
  INVALID_QTY: "invalidQty",
  SLOT_CONFLICT: "slotConflict",
  CLINIC_CLOSED: "clinicClosed",
  DENTITION_MISMATCH: "dentitionMismatch",
  INVALID_TOOTH: "invalidTooth",
  VALIDATION: "validation",
  DENTIST_MISSING: "dentistMissing",
  PRESCRIPTION_WARNINGS: "prescriptionWarnings",
};

export function errorMessageKey(error: unknown): string {
  if (error instanceof DemoError) {
    return ERROR_KEYS[error.code] ?? "generic";
  }
  if (error && typeof error === "object" && "issues" in error) {
    return "validation";
  }
  return "generic";
}
