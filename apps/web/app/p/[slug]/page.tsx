"use client";

import { useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BookingWizard } from "../../../components/booking-wizard";
import { resolveBranding } from "../../../lib/demo/branding";
import { useDemo } from "../../../lib/demo/context";

function PublicCabinet() {
  const t = useTranslations("Booking");
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const { ready, state } = useDemo();
  const branding = resolveBranding({
    slug: params.slug,
    cabinet: search.get("cabinet"),
    doctor: search.get("doctor"),
    fallbackName: state.clinic.name,
    fallbackDoctor: state.clinic.doctorName,
  });

  if (!ready) return <div className="min-h-96" />;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-medium text-teal-700">{t("eyebrow")}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{branding.name}</h1>
      <p className="mt-1 text-lg text-zinc-700">{branding.doctorName}</p>
      <p className="mt-2 text-sm text-zinc-500">
        {state.clinic.address}, {state.clinic.commune}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {state.clinic.specialties.map((item) => (
          <span key={item} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs text-teal-800">
            {item}
          </span>
        ))}
      </div>
      <p className="mt-6 max-w-xl text-sm text-zinc-600">{t("subtitle")}</p>
      <div className="mt-8">
        <BookingWizard
          clinicName={branding.name}
          doctorName={branding.doctorName}
          address={state.clinic.address}
        />
      </div>
    </main>
  );
}

export default function PublicSlugPage() {
  return (
    <Suspense fallback={<div className="min-h-96" />}>
      <PublicCabinet />
    </Suspense>
  );
}
