import { CLINIC_SLUG_PATTERN, RESERVED_CLINIC_SLUGS } from "@dentapulse/shared";
import { DEMO_CLINIC_NAME, DEMO_CLINIC_SLUG, DEMO_DOCTOR_NAME } from "./catalog";

/** Routes owned by the app, not by a cabinet slug. */
export const APP_PATHS = new Set([
  "actes",
  "agenda",
  "og",
  "p",
  "patients",
  "rappels",
  "reserver",
  "stock",
]);

const CLINIC_WORD =
  /عياد|لجراحة|جراحة|اسنان|أسنان|طب\s*الأسنان|cabinet|clinique|dentaire|chirurgie|centre|مركز/i;

export interface ResolvedBranding {
  name: string;
  doctorName: string;
  personalized: boolean;
}

export function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function clinicSlugFromPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const raw = parts[0] === "p" && parts[1] ? parts[1] : parts.length === 1 ? parts[0] : "";
  if (!raw) return "";
  const slug = decodeURIComponent(raw).trim().toLowerCase();
  if (!CLINIC_SLUG_PATTERN.test(slug)) return "";
  if (APP_PATHS.has(slug) || RESERVED_CLINIC_SLUGS.has(slug)) return "";
  return slug;
}

/** A real practitioner name, not a clinic title or a chopped « عيادة ». */
export function isPlausibleDoctorName(value: string, cabinet = ""): boolean {
  const name = value.trim();
  if (name.length < 2) return false;
  if (CLINIC_WORD.test(name)) return false;
  const cab = cabinet.trim();
  if (cab && (cab === name || cab.includes(name) || name.includes(cab))) return false;
  if (/^[\u0629\u062f]/.test(name) && /[\u0600-\u06FF]/.test(name)) {
    if (!/^(?:د\.|دكتور|دكتورة|طبيب|طبيبة)/.test(name)) return false;
  }
  return true;
}

function nameFromSlug(validSlug: string): string {
  if (validSlug === DEMO_CLINIC_SLUG) return DEMO_CLINIC_NAME;
  const titled = titleFromSlug(validSlug);
  if (/^(cabinet|clinique)\b/i.test(titled)) return titled;
  return `Cabinet ${titled}`;
}

export function resolveBranding(input: {
  slug?: string | null;
  cabinet?: string | null;
  doctor?: string | null;
  fallbackName: string;
  fallbackDoctor: string;
}): ResolvedBranding {
  const slug = input.slug?.trim().toLowerCase() ?? "";
  const validSlug =
    CLINIC_SLUG_PATTERN.test(slug) && !APP_PATHS.has(slug) && !RESERVED_CLINIC_SLUGS.has(slug)
      ? slug
      : "";
  const cabinet = input.cabinet?.trim() || "";
  const doctor = input.doctor?.trim() || "";
  const slugName = validSlug ? nameFromSlug(validSlug) : "";
  const name = cabinet || slugName || input.fallbackName;
  const hasCustomSlug = Boolean(validSlug) && validSlug !== DEMO_CLINIC_SLUG;
  const doctorOk = Boolean(doctor) && isPlausibleDoctorName(doctor, name);
  const personalized = Boolean(cabinet || doctorOk || hasCustomSlug);

  let doctorName = input.fallbackDoctor;
  if (doctorOk) doctorName = doctor;
  else if (personalized) doctorName = "";
  else if (validSlug === DEMO_CLINIC_SLUG && !cabinet) doctorName = DEMO_DOCTOR_NAME;

  return { name, doctorName, personalized };
}
