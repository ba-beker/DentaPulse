import { z } from "zod";

const aliasSchema = z.string().trim().min(1).max(80);

export const drugIdSchema = z
  .string()
  .trim()
  .regex(/^(?:[a-fA-F0-9]{24}|catalog:[a-z0-9-]{1,64})$/, "Identifiant invalide.");

export const listDrugsQuerySchema = z
  .object({
    q: z.string().trim().max(80).optional(),
  })
  .strict();

export const upsertDrugBodySchema = z
  .object({
    dci: z.string().trim().min(1).max(160),
    brand: z.string().trim().min(1).max(160).optional(),
    aliases: z.array(aliasSchema).max(8).optional(),
  })
  .strict();

export const drugParamsSchema = z
  .object({
    drugId: drugIdSchema,
  })
  .strict();

export type ListDrugsQuery = z.infer<typeof listDrugsQuerySchema>;
export type UpsertDrugBody = z.infer<typeof upsertDrugBodySchema>;
