import { z } from "zod";
import { isoCalendarDateSchema, objectIdSchema } from "./fields.js";

/** Values stored on Payment. Keep aligned with the model enum. */
export const recordedPaymentMethodSchema = z.enum([
  "cash",
  "cheque",
  "bank_transfer",
  "ccp",
  "card_cib",
  "card_edahabia",
  "other",
]);

export const createPaymentBodySchema = z
  .object({
    patientId: objectIdSchema,
    treatmentPlanId: objectIdSchema,
    amount: z.number().int().positive(),
    method: recordedPaymentMethodSchema,
    installmentNo: z.number().int().min(1),
    paidAt: z.string().datetime().optional(),
  })
  .strict();

export type CreatePaymentBody = z.infer<typeof createPaymentBodySchema>;
export type RecordedPaymentMethod = z.infer<typeof recordedPaymentMethodSchema>;

export const paymentParamsSchema = z
  .object({
    paymentId: objectIdSchema,
  })
  .strict();

export const revenueGroupBySchema = z.enum(["day", "month", "procedure", "dentist"]);

export const revenueQuerySchema = z
  .object({
    from: isoCalendarDateSchema,
    to: isoCalendarDateSchema,
    groupBy: revenueGroupBySchema,
  })
  .strict()
  .refine((value) => value.from <= value.to, {
    message: "La date de fin précède la date de début.",
    path: ["to"],
  });

export type RevenueGroupBy = z.infer<typeof revenueGroupBySchema>;
export type RevenueQuery = z.infer<typeof revenueQuerySchema>;

export const paymentSchemas = {
  create: createPaymentBodySchema,
  params: paymentParamsSchema,
  revenueQuery: revenueQuerySchema,
};
