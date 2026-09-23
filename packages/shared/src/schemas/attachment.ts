import { z } from "zod";
import { ATTACHMENT_MAX_BYTES } from "../clinical/limits.js";
import { isValidFdi } from "../teeth.js";
import { objectIdSchema } from "./fields.js";

export const attachmentMimeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export type AttachmentMime = z.infer<typeof attachmentMimeSchema>;

const EXTENSIONS: Record<AttachmentMime, readonly string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
};

export function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot <= 0) return "";
  return fileName.slice(dot).toLowerCase();
}

/** Drops path segments and characters that do not belong in a stored file name. */
export function sanitizeFileName(fileName: string): string {
  const base = fileName.replace(/\\/g, "/").split("/").pop() ?? "";
  return base
    .replace(/[^\p{L}\p{N}._ -]+/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

const toothNumberSchema = z
  .number()
  .int()
  .refine(
    (value) => isValidFdi(value, "adult") || isValidFdi(value, "pediatric"),
    "Numéro de dent FDI invalide.",
  );

export const presignAttachmentBodySchema = z
  .object({
    fileName: z
      .string()
      .trim()
      .min(1)
      .max(180)
      .transform((value, ctx) => {
        const cleaned = sanitizeFileName(value);
        if (cleaned.length === 0 || extensionOf(cleaned).length === 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nom de fichier invalide." });
          return z.NEVER;
        }
        return cleaned;
      }),
    mime: attachmentMimeSchema,
    size: z.number().int().min(1).max(ATTACHMENT_MAX_BYTES),
    clinicalRecordId: objectIdSchema.optional(),
    toothNumber: toothNumberSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const allowed = EXTENSIONS[value.mime];
    if (!allowed.includes(extensionOf(value.fileName))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fileName"],
        message: "L'extension ne correspond pas au type de fichier.",
      });
    }
  });

export const attachmentParamsSchema = z
  .object({
    attachmentId: objectIdSchema,
  })
  .strict();

export type PresignAttachmentBody = z.infer<typeof presignAttachmentBodySchema>;
