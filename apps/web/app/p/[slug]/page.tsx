"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BookingWizard } from "../../../components/booking-wizard";
import { useDisplayedClinic } from "../../../components/branding-bridge";
import { LocaleToggle } from "../../../components/locale-toggle";
import { PricingSection } from "../../../components/offer-bar";
import { PublicFrame } from "../../../components/public-frame";
import { resolveBranding } from "../../../lib/demo/branding";
import { useDemo } from "../../../lib/demo/context";

function PublicCabinet() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const { ready, state } = useDemo();
  const displayed = useDisplayedClinic();
  const branding = resolveBranding({
    slug: params.slug,
    cabinet: search.get("cabinet"),
    doctor: search.get("doctor"),
    fallbackName: displayed.name,
    fallbackDoctor: displayed.doctorName,
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
      <div className="mb-3 flex justify-end">
        <LocaleToggle tone="light" />
      </div>
      <BookingWizard
        clinicName={branding.name}
        doctorName={branding.doctorName}
        address={state.clinic.address}
      />
      <div className="mt-6">
        <PricingSection />
      </div>
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
