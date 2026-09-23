import { z } from "zod";
import { isoCalendarDateSchema, objectIdSchema, paginationCursorSchema } from "./fields.js";

const idSchema = objectIdSchema.transform((value) => value.toLowerCase());
const quantitySchema = z.number().int().min(1).max(1_000_000);
const lotNumberSchema = z.string().trim().min(1).max(80);

export const purchaseOrderParamsSchema = z
  .object({
    purchaseOrderId: idSchema,
  })
  .strict();

export const listPurchaseOrdersQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    cursor: paginationCursorSchema,
    status: z.enum(["draft", "sent", "received", "cancelled"]).optional(),
  })
  .strict();

export const patchPurchaseOrderBodySchema = z
  .object({
    updates: z
      .array(
        z
          .object({
            consumableId: idSchema,
            quantity: quantitySchema,
          })
          .strict(),
      )
      .max(200)
      .optional(),
    remove: z.array(idSchema).max(200).optional(),
  })
  .strict()
  .refine((value) => (value.updates?.length ?? 0) + (value.remove?.length ?? 0) > 0, {
    message: "Aucune modification à enregistrer.",
  });

export const receivePurchaseOrderBodySchema = z
  .object({
    items: z
      .array(
        z
          .object({
            consumableId: idSchema,
            receivedQty: quantitySchema,
            lotNumber: lotNumberSchema.optional(),
            expirationDate: isoCalendarDateSchema.optional(),
          })
          .strict(),
      )
      .min(1)
      .max(200),
  })
  .strict();

export type ListPurchaseOrdersQuery = z.infer<typeof listPurchaseOrdersQuerySchema>;
export type PatchPurchaseOrderBody = z.infer<typeof patchPurchaseOrderBodySchema>;
export type ReceivePurchaseOrderBody = z.infer<typeof receivePurchaseOrderBodySchema>;

export const purchaseOrderSchemas = {
  params: purchaseOrderParamsSchema,
  listQuery: listPurchaseOrdersQuerySchema,
  patch: patchPurchaseOrderBodySchema,
  receive: receivePurchaseOrderBodySchema,
};
