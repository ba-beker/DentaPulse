"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BookingWizard } from "../../components/booking-wizard";
import { useDisplayedClinic } from "../../components/branding-bridge";
import { LocaleToggle } from "../../components/locale-toggle";
import { PricingSection } from "../../components/offer-bar";
import { PublicFrame } from "../../components/public-frame";
import { resolveBranding } from "../../lib/demo/branding";
import { useDemo } from "../../lib/demo/context";

function BookingContent() {
  const params = useSearchParams();
  const { ready, state } = useDemo();
  const displayed = useDisplayedClinic();
  const branding = resolveBranding({
    cabinet: params.get("cabinet"),
    doctor: params.get("doctor"),
    fallbackName: displayed.name,
    fallbackDoctor: displayed.doctorName,
  });
  const name = branding.personalized ? branding.name : displayed.name;
  const doctorName = branding.personalized ? branding.doctorName : displayed.doctorName;

  if (!ready) return <div className="min-h-96" />;

  return (
    <PublicFrame
      name={name}
      doctorName={doctorName}
      address={state.clinic.address}
      commune={state.clinic.commune}
      specialties={state.clinic.specialties}
    >
      <div className="mb-3 flex justify-end">
        <LocaleToggle tone="light" />
      </div>
      <BookingWizard clinicName={name} doctorName={doctorName} address={state.clinic.address} />
      <div className="mt-6">
        <PricingSection />
      </div>
    </PublicFrame>
  );
}

export default function ReservePage() {
  return (
    <Suspense fallback={<div className="min-h-96" />}>
      <BookingContent />
    </Suspense>
  );
}
