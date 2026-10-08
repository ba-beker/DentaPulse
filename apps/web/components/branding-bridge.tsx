"use client";

import { createContext, useContext, useLayoutEffect, type ReactNode } from "react";
import { DEMO_CLINIC_NAME } from "../lib/demo/catalog";
import { useDemo } from "../lib/demo/context";
import type { ResolvedBranding } from "../lib/demo/branding";

const BrandingContext = createContext<ResolvedBranding | null>(null);

export function BrandingProvider({
  initial,
  children,
}: {
  initial: ResolvedBranding;
  children: ReactNode;
}) {
  return <BrandingContext.Provider value={initial}>{children}</BrandingContext.Provider>;
}

function useInitialBranding(): ResolvedBranding {
  const value = useContext(BrandingContext);
  if (!value) {
    throw new Error("BrandingProvider is missing");
  }
  return value;
}

/** Clinic name from the link when present, otherwise the name saved on this device. */
export function useDisplayedClinic(): ResolvedBranding {
  const initial = useInitialBranding();
  const { state } = useDemo();
  if (initial.personalized) return initial;
  return {
    name: state.clinic.name,
    doctorName: state.clinic.doctorName,
    personalized: state.clinic.name !== DEMO_CLINIC_NAME,
  };
}

export function BrandingBridge() {
  const initial = useInitialBranding();
  const { ready, state, actions } = useDemo();

  useLayoutEffect(() => {
    if (!ready) return;
    if (initial.personalized) {
      if (state.clinic.name !== initial.name || state.clinic.doctorName !== initial.doctorName) {
        actions.updateClinic({ name: initial.name, doctorName: initial.doctorName });
      }
      document.title = `${initial.name} — DentaPulse`;
      return;
    }
    if (state.clinic.name !== DEMO_CLINIC_NAME) {
      document.title = `${state.clinic.name} — DentaPulse`;
    }
  }, [actions, initial, ready, state.clinic.doctorName, state.clinic.name]);

  return null;
}
