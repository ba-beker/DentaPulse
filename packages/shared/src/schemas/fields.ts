import { z } from "zod";
import { normalizeToE164 } from "../locale/phone.js";

export const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Identifiant invalide.");

export function isIsoCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day
  );
}

export const isoCalendarDateSchema = z.string().trim().refine(isIsoCalendarDate, "Date invalide.");

export const paginationCursorSchema = z
  .string()
  .trim()
  .min(1)
  .max(512)
  .regex(/^[A-Za-z0-9_-]+$/, "Curseur de pagination invalide.")
  .optional();

/** Algerian phone numbers stored as E.164. */
export const dzPhoneSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const e164 = normalizeToE164(value);
    if (!e164) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Numéro de téléphone invalide." });
      return z.NEVER;
    }
    return e164;
  });

export const listQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strict();
