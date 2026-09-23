import { z } from "zod";
import { CLINIC_SLUG_PATTERN, RESERVED_CLINIC_SLUGS } from "../clinic-slug.js";
import { wilayaByCode } from "../locale/wilayas.js";
import { dzPhoneSchema } from "./fields.js";

const clinicSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(63)
  .regex(CLINIC_SLUG_PATTERN, "Le lien du cabinet est invalide.")
  .refine((slug) => !RESERVED_CLINIC_SLUGS.has(slug), "Ce lien est réservé.");

const wilayaSchema = z
  .number()
  .int()
  .refine((code) => wilayaByCode(code) !== undefined, "Wilaya inconnue.");

export const registerClinicBodySchema = z
  .object({
    clinic: z
      .object({
        slug: clinicSlugSchema,
        name: z.string().trim().min(1).max(200),
        doctorName: z.string().trim().min(1).max(200),
        address: z.string().trim().min(1).max(300),
        wilaya: wilayaSchema,
        commune: z.string().trim().min(1).max(120),
        phone: dzPhoneSchema.optional(),
      })
      .strict(),
    owner: z
      .object({
        fullName: z.string().trim().min(1).max(200),
        email: z
          .string()
          .trim()
          .email()
          .max(254)
          .transform((email) => email.toLowerCase()),
        password: z.string().min(8).max(128),
      })
      .strict(),
  })
  .strict();

export const loginBodySchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((email) => email.toLowerCase()),
    password: z.string().min(1).max(128),
  })
  .strict();

export type RegisterClinicBody = z.infer<typeof registerClinicBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;

export const authSchemas = {
  registerClinic: registerClinicBodySchema,
  login: loginBodySchema,
};
