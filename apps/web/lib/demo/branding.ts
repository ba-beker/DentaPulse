import { CLINIC_SLUG_PATTERN } from "@dentapulse/shared";
import { DEMO_CLINIC_NAME, DEMO_CLINIC_SLUG, DEMO_DOCTOR_NAME } from "./catalog";

export function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function resolveBranding(input: {
  slug?: string | null;
  cabinet?: string | null;
  doctor?: string | null;
  fallbackName: string;
  fallbackDoctor: string;
}): { name: string; doctorName: string; personalized: boolean } {
  const slug = input.slug?.trim().toLowerCase() ?? "";
  const validSlug = CLINIC_SLUG_PATTERN.test(slug) ? slug : "";
  const cabinet = input.cabinet?.trim() || "";
  const doctor = input.doctor?.trim() || "";

  const nameFromSlug =
    validSlug.length > 0
      ? validSlug === DEMO_CLINIC_SLUG
        ? DEMO_CLINIC_NAME
        : titleFromSlug(validSlug)
      : "";

  const name = cabinet || nameFromSlug || input.fallbackName;
  const doctorName =
    doctor ||
    (validSlug === DEMO_CLINIC_SLUG && !cabinet ? DEMO_DOCTOR_NAME : input.fallbackDoctor);

  return {
    name,
    doctorName,
    personalized: Boolean(cabinet || doctor || validSlug),
  };
}
