import { z } from "zod";
import { surfaceSchema, surfacesFor, type Surface } from "../surfaces.js";
import { isValidFdi } from "../teeth.js";
import { objectIdSchema } from "./fields.js";

export const createClinicalRecordBodySchema = z
  .object({
    patientId: objectIdSchema,
    procedureId: objectIdSchema,
    toothNumber: z
      .number()
      .int()
      .refine(
        (value) => isValidFdi(value, "adult") || isValidFdi(value, "pediatric"),
        "Numéro de dent FDI invalide.",
      )
      .optional(),
    surfaces: z.array(surfaceSchema).max(6).optional(),
    notes: z.string().trim().max(5000).optional(),
  })
  .strict();

export const clinicalRecordParamsSchema = z
  .object({
    recordId: objectIdSchema,
  })
  .strict();

const toothNumberSchema = z
  .number()
  .int()
  .refine(
    (value) => isValidFdi(value, "adult") || isValidFdi(value, "pediatric"),
    "Numéro de dent FDI invalide.",
  );

export const completeTreatmentBodySchema = z
  .object({
    patientId: objectIdSchema,
    procedureId: objectIdSchema,
    toothNumber: toothNumberSchema.optional(),
    surfaces: z.array(surfaceSchema).max(6).optional(),
    treatmentPlanItemId: objectIdSchema.optional(),
    notes: z.string().trim().max(5000).optional(),
    allowExpired: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const surfaces = value.surfaces ?? [];
    if (surfaces.length > 0 && value.toothNumber === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le numéro de dent est requis pour indiquer les faces.",
        path: ["toothNumber"],
      });
      return;
    }
    if (new Set(surfaces).size !== surfaces.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Une face ne peut figurer qu'une seule fois.",
        path: ["surfaces"],
      });
    }
    if (value.toothNumber === undefined) return;
    if (!isValidFdi(value.toothNumber, "adult") && !isValidFdi(value.toothNumber, "pediatric")) {
      return;
    }
    const allowed = new Set<Surface>(surfacesFor(value.toothNumber));
    for (const [index, surface] of surfaces.entries()) {
      if (!allowed.has(surface)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Face non valide pour cette dent.",
          path: ["surfaces", index],
        });
      }
    }
  });

export type CreateClinicalRecordBody = z.infer<typeof createClinicalRecordBodySchema>;
export type CompleteTreatmentBody = z.infer<typeof completeTreatmentBodySchema>;

export const clinicalRecordSchemas = {
  create: createClinicalRecordBodySchema,
  complete: completeTreatmentBodySchema,
  params: clinicalRecordParamsSchema,
};
