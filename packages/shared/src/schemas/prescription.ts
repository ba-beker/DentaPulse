import { z } from "zod";
import { objectIdSchema } from "./fields.js";

const drugLineSchema = z
  .object({
    drug: z.string().trim().min(1).max(200),
    dci: z.string().trim().min(1).max(200).optional(),
    brand: z.string().trim().min(1).max(200).optional(),
    dosage: z.string().trim().min(1).max(200),
    duration: z.string().trim().min(1).max(120),
    instructions: z.string().trim().min(1).max(500).optional(),
  })
  .strict();

export const createPrescriptionBodySchema = z
  .object({
    items: z.array(drugLineSchema).min(1).max(10),
    acknowledgeWarnings: z.boolean().optional(),
  })
  .strict();

export const prescriptionParamsSchema = z
  .object({
    prescriptionId: objectIdSchema,
  })
  .strict();

export const prescriptionPdfQuerySchema = z
  .object({
    format: z.enum(["a5", "a4"]).optional(),
  })
  .strict();

export type CreatePrescriptionBody = z.infer<typeof createPrescriptionBodySchema>;
export type PrescriptionPdfFormat = "a5" | "a4";
