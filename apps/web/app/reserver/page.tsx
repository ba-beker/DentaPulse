"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BookingWizard } from "../../components/booking-wizard";
import { PublicFrame } from "../../components/public-frame";
import { resolveBranding } from "../../lib/demo/branding";
import { useDemo } from "../../lib/demo/context";

function BookingContent() {
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
    <PublicFrame
      name={branding.name}
      doctorName={branding.doctorName}
      address={state.clinic.address}
      commune={state.clinic.commune}
      specialties={state.clinic.specialties}
    >
      <BookingWizard
        clinicName={branding.name}
        doctorName={branding.doctorName}
        address={state.clinic.address}
      />
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
