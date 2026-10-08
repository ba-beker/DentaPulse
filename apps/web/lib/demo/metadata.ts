import type { Metadata } from "next";
import { headers } from "next/headers";
import { DEMO_CLINIC_NAME, DEMO_DOCTOR_NAME } from "./catalog";
import { resolveBranding, type ResolvedBranding } from "./branding";

function decodeHeader(value: string | null): string {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function brandingFromHeaders(): Promise<ResolvedBranding> {
  const incoming = await headers();
  return resolveBranding({
    slug: decodeHeader(incoming.get("x-dp-slug")),
    cabinet: decodeHeader(incoming.get("x-dp-cabinet")),
    doctor: decodeHeader(incoming.get("x-dp-doctor")),
    fallbackName: DEMO_CLINIC_NAME,
    fallbackDoctor: DEMO_DOCTOR_NAME,
  });
}

export function metadataBaseUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return new URL(explicit.endsWith("/") ? explicit : `${explicit}/`);
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return new URL(`https://${vercel}/`);
  return new URL("http://localhost:3000/");
}

export function previewMetadata(clinicName: string, personalized: boolean): Metadata {
  const title = personalized ? `${clinicName} — DentaPulse` : "DentaPulse";
  const description = personalized
    ? `Aperçu préparé pour ${clinicName}. Rappels WhatsApp en arabe et en français, confirmation en un clic, et relance des impayés. Essai 30 jours : vous ne payez que si ça marche.`
    : "Démonstration de gestion de cabinet dentaire : rappels WhatsApp, agenda et impayés.";
  const image = `/og?title=${encodeURIComponent(personalized ? clinicName : "DentaPulse")}`;
  return {
    metadataBase: metadataBaseUrl(),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_DZ",
      siteName: "DentaPulse",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
