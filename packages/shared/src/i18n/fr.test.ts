import { describe, expect, it } from "vitest";
import { DENTITIONS } from "../teeth.js";
import {
  appointmentStatusSchema,
  paymentMethodSchema,
  riskTagSchema,
  roleSchema,
  stockMovementReasonSchema,
  stockStatusSchema,
  toothConditionSchema,
  treatmentStatusSchema,
} from "../enums.js";
import { surfaceSchema } from "../surfaces.js";
import { recordedPaymentMethodSchema } from "../schemas/payment.js";
import {
  appointmentStatusLabels,
  paymentMethodLabels,
  recordedPaymentMethodLabels,
  riskTagLabels,
  roleLabels,
  stockMovementReasonLabels,
  stockStatusLabels,
  dentitionLabels,
  ordonnanceCopy,
  surfaceLabel,
  surfaceLabels,
  toothConditionLabels,
  treatmentStatusLabels,
} from "./fr.js";

function expectLabels<T extends string>(values: readonly T[], labels: Record<T, string>): void {
  expect(Object.keys(labels).sort()).toEqual([...values].sort());
  for (const value of values) {
    expect(labels[value].length).toBeGreaterThan(0);
  }
}

describe("French labels", () => {
  it("covers every enum value", () => {
    expectLabels(DENTITIONS, dentitionLabels);
    expectLabels(toothConditionSchema.options, toothConditionLabels);
    expectLabels(surfaceSchema.options, surfaceLabels);
    expectLabels(treatmentStatusSchema.options, treatmentStatusLabels);
    expectLabels(appointmentStatusSchema.options, appointmentStatusLabels);
    expectLabels(roleSchema.options, roleLabels);
    expectLabels(riskTagSchema.options, riskTagLabels);
    expectLabels(stockStatusSchema.options, stockStatusLabels);
    expectLabels(stockMovementReasonSchema.options, stockMovementReasonLabels);
    expectLabels(paymentMethodSchema.options, paymentMethodLabels);
    expectLabels(recordedPaymentMethodSchema.options, recordedPaymentMethodLabels);
  });

  it("follows the glossary", () => {
    expect(dentitionLabels.mixed).toBe("Denture mixte");
    expect(dentitionLabels.pediatric).toBe("Denture temporaire");
    expect(toothConditionLabels.caries).toBe("Carie");
    expect(toothConditionLabels.filling).toBe("Obturation");
    expect(toothConditionLabels.missing).toBe("Dent absente");
    expect(toothConditionLabels.endodontic).toBe("Traitement endodontique");
    expect(toothConditionLabels.extraction_planned).toBe("Extraction prévue");
    expect(surfaceLabels.O).toBe("Occlusale");
    expect(surfaceLabels.B).toBe("Vestibulaire");
    expect(surfaceLabel("L")).toBe("Linguale");
    expect(surfaceLabel("L", "lower")).toBe("Linguale");
    expect(surfaceLabel("L", "upper")).toBe("Palatine");
    expect(surfaceLabel("M", "upper")).toBe("Mésiale");
    expect(appointmentStatusLabels.pending).toBe("En attente");
    expect(appointmentStatusLabels.no_show).toBe("Absent");
    expect(appointmentStatusLabels.completed).toBe("Terminé");
    expect(treatmentStatusLabels.completed).toBe("Réalisé");
    expect(roleLabels.dentist).toBe("Chirurgien-dentiste");
    expect(roleLabels.assistant).toBe("Assistant dentaire");
    expect(roleLabels.receptionist).toBe("Secrétaire");
    expect(riskTagLabels.penicillin_allergy).toBe("Allergie à la pénicilline");
    expect(ordonnanceCopy.title).toBe("Ordonnance");
    expect(ordonnanceCopy.dentist).toBe("Chirurgien-dentiste");
    expect(ordonnanceCopy.stamp).toBe("Cachet");
    expect(ordonnanceCopy.madeAt).toContain("Fait à");
    expect(riskTagLabels.coagulation_risk).toBe("Trouble de la coagulation");
    expect(riskTagLabels.cardiac).toBe("Cardiopathie");
    expect(stockStatusLabels.low).toBe("Stock faible");
    expect(stockStatusLabels.out).toBe("Rupture de stock");
    expect(stockMovementReasonLabels.purchase_receipt).toBe("Réception");
    expect(paymentMethodLabels.cash).toBe("Espèces");
    expect(paymentMethodLabels.cheque).toBe("Chèque");
  });
});
