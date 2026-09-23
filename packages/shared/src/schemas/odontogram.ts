import { z } from "zod";
import { toothConditionSchema } from "../enums.js";
import { DENTITIONS, isValidFdi } from "../teeth.js";
import { objectIdSchema } from "./fields.js";

export const dentitionSchema = z.enum(DENTITIONS);

const surfaceConditionSchema = toothConditionSchema.superRefine((value, ctx) => {
  if (value === "crown" || value === "implant" || value === "missing") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Cette condition concerne toute la dent.",
    });
  }
});

export const toothSurfacesPatchSchema = z
  .object({
    O: surfaceConditionSchema.optional(),
    I: surfaceConditionSchema.optional(),
    M: surfaceConditionSchema.optional(),
    D: surfaceConditionSchema.optional(),
    B: surfaceConditionSchema.optional(),
    L: surfaceConditionSchema.optional(),
  })
  .strict();

export const chartParamsSchema = z
  .object({
    patientId: objectIdSchema,
  })
  .strict();

export const chartToothParamsSchema = z
  .object({
    patientId: objectIdSchema,
    fdi: z.coerce
      .number()
      .int()
      .refine(
        (value) => isValidFdi(value, "adult") || isValidFdi(value, "pediatric"),
        "Numéro de dent FDI invalide.",
      ),
  })
  .strict();

export const patchToothBodySchema = z
  .object({
    version: z.number().int().nonnegative(),
    wholeCondition: toothConditionSchema.optional(),
    surfaces: toothSurfacesPatchSchema.optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.wholeCondition !== undefined ||
      value.surfaces !== undefined ||
      value.notes !== undefined,
    { message: "Aucune modification à enregistrer." },
  );

export const patchDentitionBodySchema = z
  .object({
    version: z.number().int().nonnegative(),
    dentition: dentitionSchema,
  })
  .strict();

export type PatchToothBody = z.infer<typeof patchToothBodySchema>;
export type PatchDentitionBody = z.infer<typeof patchDentitionBodySchema>;

export const odontogramSchemas = {
  params: chartParamsSchema,
  toothParams: chartToothParamsSchema,
  patchTooth: patchToothBodySchema,
  patchDentition: patchDentitionBodySchema,
};
