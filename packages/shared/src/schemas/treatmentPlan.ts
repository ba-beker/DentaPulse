import { z } from "zod";
import { isValidFdi } from "../teeth.js";
import { surfaceSchema, surfacesFor } from "../surfaces.js";
import { isoCalendarDateSchema, objectIdSchema } from "./fields.js";

const priceSchema = z.number().int().min(0).max(100_000_000);
const sequenceSchema = z.number().int().min(0).max(10_000);
const idSchema = objectIdSchema.transform((value) => value.toLowerCase());

export const treatmentPlanItemInputSchema = z
  .object({
    procedureId: idSchema,
    toothNumber: z.number().int().optional(),
    surfaces: z.array(surfaceSchema).max(5).default([]),
    price: priceSchema.optional(),
    sequence: sequenceSchema,
  })
  .strict()
  .superRefine((item, ctx) => {
    if (new Set(item.surfaces).size !== item.surfaces.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Une face ne peut figurer qu'une seule fois.",
        path: ["surfaces"],
      });
    }
    if (item.toothNumber === undefined) {
      if (item.surfaces.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Les faces exigent une dent.",
          path: ["surfaces"],
        });
      }
      return;
    }
    if (!isValidFdi(item.toothNumber, "mixed")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dent invalide.",
        path: ["toothNumber"],
      });
      return;
    }
    const allowed = new Set(surfacesFor(item.toothNumber));
    item.surfaces.forEach((surface, index) => {
      if (!allowed.has(surface)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cette face ne correspond pas à cette dent.",
          path: ["surfaces", index],
        });
      }
    });
  });

const itemsSchema = z
  .array(treatmentPlanItemInputSchema)
  .min(1)
  .max(40)
  .superRefine((items, ctx) => {
    const seen = new Set<number>();
    items.forEach((item, index) => {
      if (seen.has(item.sequence)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le rang est déjà utilisé.",
          path: [index, "sequence"],
        });
      }
      seen.add(item.sequence);
    });
  });

export const createTreatmentPlanBodySchema = z
  .object({
    discount: priceSchema.default(0),
    items: itemsSchema,
  })
  .strict();

const reorderSchema = z
  .object({
    itemId: idSchema,
    sequence: sequenceSchema,
  })
  .strict();

export const patchTreatmentPlanBodySchema = z
  .object({
    discount: priceSchema.optional(),
    add: itemsSchema.optional(),
    remove: z.array(idSchema).min(1).max(40).optional(),
    reorder: z.array(reorderSchema).min(1).max(40).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.discount !== undefined ||
      value.add !== undefined ||
      value.remove !== undefined ||
      value.reorder !== undefined,
    { message: "Aucune modification à enregistrer." },
  );

export const createInstallmentsBodySchema = z
  .object({
    count: z.number().int().min(1).max(60),
    firstDueDate: isoCalendarDateSchema,
    interval: z.number().int().min(1).max(366),
  })
  .strict();

export const createQuoteBodySchema = z
  .object({
    validUntil: isoCalendarDateSchema,
  })
  .strict();

export const treatmentPlanParamsSchema = z
  .object({
    treatmentPlanId: objectIdSchema,
  })
  .strict();

export const treatmentPlanSchemas = {
  create: createTreatmentPlanBodySchema,
  patch: patchTreatmentPlanBodySchema,
  installments: createInstallmentsBodySchema,
  quote: createQuoteBodySchema,
  params: treatmentPlanParamsSchema,
};

export type TreatmentPlanItemInput = z.infer<typeof treatmentPlanItemInputSchema>;
export type CreateTreatmentPlanBody = z.infer<typeof createTreatmentPlanBodySchema>;
export type PatchTreatmentPlanBody = z.infer<typeof patchTreatmentPlanBodySchema>;
export type CreateInstallmentsBody = z.infer<typeof createInstallmentsBodySchema>;
export type CreateQuoteBody = z.infer<typeof createQuoteBodySchema>;
