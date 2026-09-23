import { z } from "zod";
import { adjustStockReasonSchema, stockStatusSchema } from "../enums.js";
import { isoCalendarDateSchema, objectIdSchema, paginationCursorSchema } from "./fields.js";

const nameSchema = z.string().trim().min(1).max(200);
const categorySchema = z.string().trim().min(1).max(80);
const unitSchema = z.string().trim().min(1).max(40);
const skuSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .transform((value) => value.toUpperCase());
const lotNumberSchema = z.string().trim().min(1).max(80);
const stockQuantitySchema = z.number().finite().min(0);
const wholeDinarsSchema = z.number().int().min(0);
const noteSchema = z.string().trim().max(500);

function maxAtLeastMin(min: number | undefined, max: number | undefined): boolean {
  if (min === undefined || max === undefined) return true;
  return max >= min;
}

export const adjustStockBodySchema = z
  .object({
    delta: z
      .number()
      .int()
      .refine((value) => value !== 0, "La quantité doit être différente de zéro."),
    reason: adjustStockReasonSchema,
    note: noteSchema.optional(),
  })
  .strict();

export const createConsumableBodySchema = z
  .object({
    name: nameSchema,
    sku: skuSchema.optional(),
    category: categorySchema,
    unit: unitSchema,
    currentStock: stockQuantitySchema.optional(),
    minStockAlert: stockQuantitySchema.optional(),
    maxStockLevel: stockQuantitySchema.optional(),
    costPerUnit: wholeDinarsSchema,
    expirationDate: isoCalendarDateSchema.optional(),
    supplierId: objectIdSchema.optional(),
    lotNumber: lotNumberSchema.optional(),
  })
  .strict()
  .refine((value) => maxAtLeastMin(value.minStockAlert, value.maxStockLevel), {
    message: "Le stock maximum doit être au moins égal au seuil d'alerte.",
    path: ["maxStockLevel"],
  });

export const updateConsumableBodySchema = z
  .object({
    name: nameSchema.optional(),
    sku: skuSchema.optional().nullable(),
    category: categorySchema.optional(),
    unit: unitSchema.optional(),
    minStockAlert: stockQuantitySchema.optional(),
    maxStockLevel: stockQuantitySchema.optional().nullable(),
    costPerUnit: wholeDinarsSchema.optional(),
    expirationDate: isoCalendarDateSchema.optional().nullable(),
    supplierId: objectIdSchema.optional().nullable(),
    lotNumber: lotNumberSchema.optional().nullable(),
  })
  .strict()
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "Aucune modification à enregistrer.",
  })
  .refine((value) => maxAtLeastMin(value.minStockAlert, value.maxStockLevel ?? undefined), {
    message: "Le stock maximum doit être au moins égal au seuil d'alerte.",
    path: ["maxStockLevel"],
  });

export const consumableParamsSchema = z
  .object({
    consumableId: objectIdSchema,
  })
  .strict();

export const consumableSortSchema = z.enum([
  "name",
  "-name",
  "currentStock",
  "-currentStock",
  "expirationDate",
  "-expirationDate",
  "createdAt",
  "-createdAt",
]);

export const listConsumablesQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    cursor: paginationCursorSchema,
    search: z.string().trim().max(120).optional(),
    status: stockStatusSchema.optional(),
    sort: consumableSortSchema.optional(),
  })
  .strict();

export const listMovementsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    cursor: paginationCursorSchema,
  })
  .strict();

export type AdjustStockBody = z.infer<typeof adjustStockBodySchema>;
export type CreateConsumableBody = z.infer<typeof createConsumableBodySchema>;
export type UpdateConsumableBody = z.infer<typeof updateConsumableBodySchema>;
export type ListConsumablesQuery = z.infer<typeof listConsumablesQuerySchema>;
export type ListMovementsQuery = z.infer<typeof listMovementsQuerySchema>;
export type ConsumableSort = z.infer<typeof consumableSortSchema>;

export const consumableSchemas = {
  create: createConsumableBodySchema,
  update: updateConsumableBodySchema,
  adjust: adjustStockBodySchema,
  params: consumableParamsSchema,
  listQuery: listConsumablesQuerySchema,
  movementsQuery: listMovementsQuerySchema,
};
