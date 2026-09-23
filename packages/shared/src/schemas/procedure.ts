import { z } from "zod";
import { objectIdSchema, paginationCursorSchema } from "./fields.js";

const nameSchema = z.string().trim().min(1).max(200);
const categorySchema = z.string().trim().min(1).max(80);
const codeSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .transform((value) => value.toUpperCase());
const basePriceSchema = z.number().int().min(0).max(100_000_000);
const durationSchema = z.number().int().min(1).max(1_440);

const recipeLineSchema = z
  .object({
    consumableId: objectIdSchema.transform((value) => value.toLowerCase()),
    quantityUsed: z.number().positive().finite().max(10_000),
  })
  .strict();

const recipeSchema = z
  .array(recipeLineSchema)
  .max(40)
  .superRefine((lines, ctx) => {
    const seen = new Set<string>();
    for (const [index, line] of lines.entries()) {
      if (seen.has(line.consumableId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Un consommable ne peut figurer qu'une seule fois dans la recette.",
          path: [index, "consumableId"],
        });
      }
      seen.add(line.consumableId);
    }
  });

export const createProcedureBodySchema = z
  .object({
    name: nameSchema,
    code: codeSchema.optional(),
    basePrice: basePriceSchema,
    durationMinutes: durationSchema,
    category: categorySchema,
    isActive: z.boolean().default(true),
    consumables: recipeSchema.default([]),
  })
  .strict();

export const updateProcedureBodySchema = z
  .object({
    name: nameSchema.optional(),
    code: codeSchema.optional().nullable(),
    basePrice: basePriceSchema.optional(),
    durationMinutes: durationSchema.optional(),
    category: categorySchema.optional(),
    isActive: z.boolean().optional(),
    consumables: recipeSchema.optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "Aucune modification à enregistrer.",
  });

export const procedureParamsSchema = z
  .object({
    procedureId: objectIdSchema,
  })
  .strict();

export const listProceduresQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    cursor: paginationCursorSchema,
    search: z.string().trim().max(120).optional(),
    category: categorySchema.optional(),
    active: z.enum(["true", "false"]).optional(),
  })
  .strict();

export const previewDeductionBodySchema = z
  .object({
    quantity: z.number().int().min(1).max(100).default(1),
  })
  .strict();

export type CreateProcedureBody = z.infer<typeof createProcedureBodySchema>;
export type UpdateProcedureBody = z.infer<typeof updateProcedureBodySchema>;
export type ListProceduresQuery = z.infer<typeof listProceduresQuerySchema>;
export type PreviewDeductionBody = z.infer<typeof previewDeductionBodySchema>;

export const procedureSchemas = {
  create: createProcedureBodySchema,
  update: updateProcedureBodySchema,
  params: procedureParamsSchema,
  listQuery: listProceduresQuerySchema,
  previewDeduction: previewDeductionBodySchema,
};
