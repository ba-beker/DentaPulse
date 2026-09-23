import { DEMO_STATE_VERSION, type DemoState } from "./types";

export const DEMO_STORAGE_KEY = "dentapulse.demo.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDemoState(value: unknown): value is DemoState {
  if (!isRecord(value)) return false;
  if (value.version !== DEMO_STATE_VERSION) return false;
  if (!isRecord(value.clinic)) return false;
  const collections = [
    "users",
    "suppliers",
    "consumables",
    "procedures",
    "patients",
    "charts",
    "clinicalRecords",
    "treatmentPlans",
    "appointments",
    "payments",
    "movements",
    "drugs",
    "prescriptions",
  ] as const;
  return collections.every((key) => Array.isArray(value[key]));
}

export function readDemoState(): DemoState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isDemoState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeDemoState(state: DemoState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
}

export function clearDemoState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_STORAGE_KEY);
}
