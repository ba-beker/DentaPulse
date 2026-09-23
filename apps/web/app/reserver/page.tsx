"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BookingWizard } from "../../components/booking-wizard";
import { resolveBranding } from "../../lib/demo/branding";
import { useDemo } from "../../lib/demo/context";

function BookingContent() {
  const t = useTranslations("Booking");
  const params = useSearchParams();
  const { ready, state } = useDemo();
  const branding = resolveBranding({
    cabinet: params.get("cabinet"),
    doctor: params.get("doctor"),
    fallbackName: state.clinic.name,
    fallbackDoctor: state.clinic.doctorName,
  });

  if (!ready) return <div className="min-h-96" />;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-medium text-teal-700">{t("eyebrow")}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{branding.name}</h1>
      <p className="mt-1 text-zinc-600">{branding.doctorName}</p>
      <p className="mt-4 max-w-xl text-sm text-zinc-600">{t("subtitle")}</p>
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

export default function ReservePage() {
  return (
    <Suspense fallback={<div className="min-h-96" />}>
      <BookingContent />
    </Suspense>
  );
}
