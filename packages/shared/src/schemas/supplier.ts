import { z } from "zod";
import { dzPhoneSchema, objectIdSchema, paginationCursorSchema } from "./fields.js";

const nameSchema = z.string().trim().min(1).max(200);
const emailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((email) => email.toLowerCase());
const notesSchema = z.string().trim().max(2000);

export const createSupplierBodySchema = z
  .object({
    name: nameSchema,
    phone: dzPhoneSchema.optional(),
    email: emailSchema.optional(),
    whatsapp: dzPhoneSchema.optional(),
    notes: notesSchema.optional(),
  })
  .strict();

export const updateSupplierBodySchema = z
  .object({
    name: nameSchema.optional(),
    phone: dzPhoneSchema.optional().nullable(),
    email: emailSchema.optional().nullable(),
    whatsapp: dzPhoneSchema.optional().nullable(),
    notes: notesSchema.optional().nullable(),
  })
  .strict()
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "Aucune modification à enregistrer.",
  });

export const supplierParamsSchema = z
  .object({
    supplierId: objectIdSchema,
  })
  .strict();

export const listSuppliersQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    cursor: paginationCursorSchema,
    search: z.string().trim().max(120).optional(),
  })
  .strict();

export type CreateSupplierBody = z.infer<typeof createSupplierBodySchema>;
export type UpdateSupplierBody = z.infer<typeof updateSupplierBodySchema>;
export type ListSuppliersQuery = z.infer<typeof listSuppliersQuerySchema>;

export const supplierSchemas = {
  create: createSupplierBodySchema,
  update: updateSupplierBodySchema,
  params: supplierParamsSchema,
  listQuery: listSuppliersQuerySchema,
};
