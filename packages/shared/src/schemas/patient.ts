import { z } from "zod";
import { riskTagSchema } from "../enums.js";
import { wilayaByCode } from "../locale/wilayas.js";
import { dzPhoneSchema, objectIdSchema } from "./fields.js";

const fullNameSchema = z.string().trim().min(1).max(200);
const emailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((email) => email.toLowerCase());
const allergiesSchema = z.array(z.string().trim().min(1).max(100)).max(30);
const medicalNotesSchema = z.string().trim().max(5000);
const patientSexSchema = z.enum(["female", "male"]);
const preferredLanguageSchema = z.enum(["fr", "ar"]);
const insuranceTypeSchema = z.enum(["none", "cnas", "casnos", "mutuelle", "other"]);
const communeSchema = z.string().trim().min(1).max(120);
const wilayaSchema = z
  .number()
  .int()
  .refine((code) => wilayaByCode(code) !== undefined, "Wilaya inconnue.");

function isIsoCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day
  );
}

const dateOfBirthSchema = z
  .string()
  .refine(isIsoCalendarDate, "Date de naissance invalide.")
  .refine((value) => value >= "1900-01-01", "Date de naissance invalide.")
  .refine((value) => value <= new Date().toISOString().slice(0, 10), "Date de naissance invalide.");

const insuranceSchema = z
  .object({
    type: insuranceTypeSchema,
    number: z.string().trim().min(1).max(50).optional(),
  })
  .strict();

const riskTagsSchema = z
  .array(riskTagSchema)
  .max(riskTagSchema.options.length)
  .transform((tags) => [...new Set(tags)]);

const patientProfileFields = {
  fullName: fullNameSchema,
  phone: dzPhoneSchema,
  email: emailSchema.optional(),
  dateOfBirth: dateOfBirthSchema.optional(),
  sex: patientSexSchema.optional(),
  wilaya: wilayaSchema.optional(),
  commune: communeSchema.optional(),
  preferredLanguage: preferredLanguageSchema.optional(),
  insurance: insuranceSchema.optional(),
  riskTags: riskTagsSchema.optional(),
  allergies: allergiesSchema.optional(),
  medicalNotes: medicalNotesSchema.optional(),
};

export const createPatientBodySchema = z.object(patientProfileFields).strict();

export const updatePatientBodySchema = z
  .object({
    fullName: fullNameSchema.optional(),
    phone: dzPhoneSchema.optional(),
    email: emailSchema.optional(),
    dateOfBirth: dateOfBirthSchema.optional(),
    sex: patientSexSchema.optional(),
    wilaya: wilayaSchema.optional(),
    commune: communeSchema.optional(),
    preferredLanguage: preferredLanguageSchema.optional(),
    insurance: insuranceSchema.optional(),
    riskTags: riskTagsSchema.optional(),
    allergies: allergiesSchema.optional(),
    medicalNotes: medicalNotesSchema.optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "Aucune modification à enregistrer.",
  });

export const patchPatientRiskTagsBodySchema = z
  .object({
    riskTags: riskTagsSchema,
  })
  .strict();

export const patchPatientAllergiesBodySchema = z
  .object({
    allergies: allergiesSchema,
  })
  .strict();

export const patientParamsSchema = z
  .object({
    patientId: objectIdSchema,
  })
  .strict();

export const patientSortSchema = z.enum(["fullName", "-fullName", "createdAt", "-createdAt"]);

const riskTagsQuerySchema = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return value;
}, z.array(riskTagSchema).min(1).max(riskTagSchema.options.length).optional());

export const listPatientsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    cursor: z
      .string()
      .trim()
      .min(1)
      .max(512)
      .regex(/^[A-Za-z0-9_-]+$/, "Curseur de pagination invalide.")
      .optional(),
    search: z.string().trim().max(120).optional(),
    riskTags: riskTagsQuerySchema,
    sort: patientSortSchema.optional(),
  })
  .strict();

export type CreatePatientBody = z.infer<typeof createPatientBodySchema>;
export type UpdatePatientBody = z.infer<typeof updatePatientBodySchema>;
export type PatchPatientRiskTagsBody = z.infer<typeof patchPatientRiskTagsBodySchema>;
export type PatchPatientAllergiesBody = z.infer<typeof patchPatientAllergiesBodySchema>;
export type ListPatientsQuery = z.infer<typeof listPatientsQuerySchema>;
export type PatientSort = z.infer<typeof patientSortSchema>;

export const patientSchemas = {
  create: createPatientBodySchema,
  update: updatePatientBodySchema,
  patchRiskTags: patchPatientRiskTagsBodySchema,
  patchAllergies: patchPatientAllergiesBodySchema,
  params: patientParamsSchema,
  listQuery: listPatientsQuerySchema,
};
