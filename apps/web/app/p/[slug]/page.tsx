"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BookingWizard } from "../../../components/booking-wizard";
import { PublicFrame } from "../../../components/public-frame";
import { resolveBranding } from "../../../lib/demo/branding";
import { useDemo } from "../../../lib/demo/context";

function PublicCabinet() {
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

export default function PublicSlugPage() {
  return (
    <Suspense fallback={<div className="min-h-96" />}>
      <PublicCabinet />
    </Suspense>
  );
}
