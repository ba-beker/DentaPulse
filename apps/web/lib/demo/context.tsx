"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  adjustStock,
  bookPublic,
  completeTreatment,
  createAppointment,
  createConsumable,
  createDrug,
  createPatient,
  createPayment,
  createPrescription,
  deleteAppointment,
  deletePatient,
  getDemoState,
  getServerDemoState,
  hydrateDemoStore,
  inventoryAlerts,
  listAvailability,
  lookupPatient,
  lookupProcedure,
  lookupUser,
  patchDentition,
  patchTooth,
  patientFinancials,
  previewTreatment,
  resetDemoStore,
  subscribeDemo,
  toothHistory,
  updateAppointment,
  updateClinic,
  updatePatient,
} from "./store";
import type { DemoState } from "./types";

const actions = {
  adjustStock,
  bookPublic,
  completeTreatment,
  createAppointment,
  createConsumable,
  createDrug,
  createPatient,
  createPayment,
  createPrescription,
  deleteAppointment,
  deletePatient,
  inventoryAlerts,
  listAvailability,
  lookupPatient,
  lookupProcedure,
  lookupUser,
  patchDentition,
  patchTooth,
  patientFinancials,
  previewTreatment,
  resetDemoStore,
  toothHistory,
  updateAppointment,
  updateClinic,
  updatePatient,
};

export type DemoActions = typeof actions;

interface DemoContextValue {
  ready: boolean;
  state: DemoState;
  actions: DemoActions;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribeDemo, getDemoState, getServerDemoState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateDemoStore();
    setReady(true);
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({ ready, state: snapshot, actions }),
    [ready, snapshot],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const value = useContext(DemoContext);
  if (!value) {
    throw new Error("useDemo must be used within DemoStoreProvider");
  }
  return value;
}
