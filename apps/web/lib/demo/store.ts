import {
  applyToothUpdate,
  createAppointmentBodySchema,
  createPatientBodySchema,
  createPaymentBodySchema,
  createPrescriptionBodySchema,
  createPublicAppointmentBodySchema,
  DEFAULT_TIMEZONE,
  dentitionFitsTeeth,
  generateDaySlots,
  isClinicClosedOnDate,
  foldClinicalText,
  isoDayInTimezone,
  matchPrescriptionWarnings,
  patientBalance,
  previewProcedureDeduction,
  stockStatus,
  updateAppointmentBodySchema,
  updatePatientBodySchema,
  upsertDrugBodySchema,
  type CreatePatientBody,
  type CreatePaymentBody,
  type CreatePrescriptionBody,
  type Dentition,
  type PatchToothBody,
  type ProcedureDeductionPreview,
  type StockMovementReason,
  type ToothCondition,
  type UpdateAppointmentBody,
  type UpdatePatientBody,
} from "@dentapulse/shared";
import { DEMO_SCHEDULE } from "./catalog";
import { createId, rememberId, resetIdCounter } from "./ids";
import { createDemoSeed, walkIds } from "./seed";
import { clearDemoState, readDemoState, writeDemoState } from "./storage";
import {
  DemoError,
  type AppointmentRecord,
  type ChartRecord,
  type ClinicalRecord,
  type ConsumableRecord,
  type DemoState,
  type DrugRecord,
  type PatientRecord,
  type PrescriptionRecord,
  type PaymentRecord,
  type ProcedureRecord,
  type StaffUser,
  type StockMovementRecord,
  type ToothStateRecord,
} from "./types";

type Listener = () => void;

const listeners = new Set<Listener>();

const emptySeed = createDemoSeed();
let state: DemoState = emptySeed;
let hydrated = false;

function emit(): void {
  writeDemoState(state);
  for (const listener of listeners) listener();
}

function replaceState(next: DemoState): void {
  resetIdCounter(1);
  walkIds(next, rememberId);
  state = next;
  emit();
}

function findOrThrow<T>(items: T[], predicate: (item: T) => boolean, code: string): T {
  const found = items.find(predicate);
  if (!found) throw new DemoError(code, code);
  return found;
}

function overlaps(startA: string, endA: string, startB: string, endB: string): boolean {
  return (
    new Date(startA).getTime() < new Date(endB).getTime() &&
    new Date(startB).getTime() < new Date(endA).getTime()
  );
}

function dentist(): StaffUser {
  const user = state.users.find((row) => row.role === "dentist");
  if (!user) throw new DemoError("DENTIST_MISSING", "DENTIST_MISSING");
  return user;
}

function chartFor(patientId: string): ChartRecord {
  const existing = state.charts.find((row) => row.patientId === patientId);
  if (existing) return existing;
  const created: ChartRecord = {
    id: createId(),
    patientId,
    dentition: "adult",
    version: 1,
    teeth: [],
  };
  state = { ...state, charts: [...state.charts, created] };
  return created;
}

export function getDemoState(): DemoState {
  return state;
}

export function getServerDemoState(): DemoState {
  return emptySeed;
}

export function subscribeDemo(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function hydrateDemoStore(): void {
  if (hydrated) return;
  hydrated = true;
  const stored = readDemoState();
  if (stored) {
    resetIdCounter(1);
    walkIds(stored, rememberId);
    state = stored;
    for (const listener of listeners) listener();
    return;
  }
  replaceState(createDemoSeed());
}

export function resetDemoStore(): void {
  clearDemoState();
  hydrated = true;
  replaceState(createDemoSeed());
}

export function updateClinic(
  patch: Partial<Pick<DemoState["clinic"], "name" | "doctorName" | "phone" | "commune">>,
): void {
  state = { ...state, clinic: { ...state.clinic, ...patch } };
  emit();
}

export function createPatient(input: CreatePatientBody): PatientRecord {
  const parsed = createPatientBodySchema.parse(input);
  const duplicate = state.patients.some((row) => row.phone === parsed.phone);
  if (duplicate) throw new DemoError("PHONE_TAKEN", "PHONE_TAKEN");

  const patient: PatientRecord = {
    id: createId(),
    fullName: parsed.fullName,
    phone: parsed.phone,
    preferredLanguage: parsed.preferredLanguage ?? "fr",
    wilaya: parsed.wilaya ?? 31,
    commune: parsed.commune ?? state.clinic.commune,
    riskTags: parsed.riskTags ?? [],
    allergies: parsed.allergies ?? [],
    createdAt: new Date().toISOString(),
    ...(parsed.email ? { email: parsed.email } : {}),
    ...(parsed.dateOfBirth ? { dateOfBirth: parsed.dateOfBirth } : {}),
    ...(parsed.sex ? { sex: parsed.sex } : {}),
    ...(parsed.medicalNotes ? { medicalNotes: parsed.medicalNotes } : {}),
  };

  const chart: ChartRecord = {
    id: createId(),
    patientId: patient.id,
    dentition: "adult",
    version: 1,
    teeth: [],
  };

  state = {
    ...state,
    patients: [patient, ...state.patients],
    charts: [...state.charts, chart],
  };
  emit();
  return patient;
}

export function updatePatient(patientId: string, input: UpdatePatientBody): PatientRecord {
  const parsed = updatePatientBodySchema.parse(input);
  const current = findOrThrow(state.patients, (row) => row.id === patientId, "PATIENT_NOT_FOUND");
  if (parsed.phone && parsed.phone !== current.phone) {
    if (state.patients.some((row) => row.phone === parsed.phone && row.id !== patientId)) {
      throw new DemoError("PHONE_TAKEN", "PHONE_TAKEN");
    }
  }

  const next: PatientRecord = {
    ...current,
    ...parsed,
    email: parsed.email ?? current.email,
    dateOfBirth: parsed.dateOfBirth ?? current.dateOfBirth,
    medicalNotes: parsed.medicalNotes ?? current.medicalNotes,
  };

  state = {
    ...state,
    patients: state.patients.map((row) => (row.id === patientId ? next : row)),
  };
  emit();
  return next;
}

export function deletePatient(patientId: string): void {
  findOrThrow(state.patients, (row) => row.id === patientId, "PATIENT_NOT_FOUND");
  state = {
    ...state,
    patients: state.patients.filter((row) => row.id !== patientId),
    charts: state.charts.filter((row) => row.patientId !== patientId),
    clinicalRecords: state.clinicalRecords.filter((row) => row.patientId !== patientId),
    treatmentPlans: state.treatmentPlans.filter((row) => row.patientId !== patientId),
    appointments: state.appointments.filter((row) => row.patientId !== patientId),
    payments: state.payments.filter((row) => row.patientId !== patientId),
    prescriptions: state.prescriptions.filter((row) => row.patientId !== patientId),
  };
  emit();
}

export function createDrug(input: { dci: string; brand?: string }): DrugRecord {
  const parsed = upsertDrugBodySchema.parse(input);
  const existing = state.drugs.find(
    (row) =>
      foldClinicalText(row.dci) === foldClinicalText(parsed.dci) &&
      foldClinicalText(row.brand ?? "") === foldClinicalText(parsed.brand ?? ""),
  );
  if (existing) return existing;

  const created: DrugRecord = {
    id: createId(),
    dci: parsed.dci,
    ...(parsed.brand ? { brand: parsed.brand } : {}),
    aliases: parsed.aliases ?? [],
    custom: true,
  };
  state = { ...state, drugs: [...state.drugs, created] };
  emit();
  return created;
}

export function createPrescription(
  patientId: string,
  input: CreatePrescriptionBody,
): PrescriptionRecord {
  const patient = findOrThrow(state.patients, (row) => row.id === patientId, "PATIENT_NOT_FOUND");
  const parsed = createPrescriptionBodySchema.parse(input);
  const warnings = matchPrescriptionWarnings(
    { riskTags: patient.riskTags, allergies: patient.allergies },
    parsed.items,
    state.drugs,
  );
  if (warnings.length > 0 && parsed.acknowledgeWarnings !== true) {
    throw new DemoError("PRESCRIPTION_WARNINGS", "PRESCRIPTION_WARNINGS");
  }

  const created: PrescriptionRecord = {
    id: createId(),
    patientId,
    dentistId: dentist().id,
    items: parsed.items.map((item) => ({
      drug: item.drug,
      dosage: item.dosage,
      duration: item.duration,
      ...(item.dci ? { dci: item.dci } : {}),
      ...(item.brand ? { brand: item.brand } : {}),
      ...(item.instructions ? { instructions: item.instructions } : {}),
    })),
    createdAt: new Date().toISOString(),
  };
  state = { ...state, prescriptions: [created, ...state.prescriptions] };
  emit();
  return created;
}

export function patchTooth(
  patientId: string,
  fdi: number,
  patch: Omit<PatchToothBody, "version">,
): ChartRecord {
  findOrThrow(state.patients, (row) => row.id === patientId, "PATIENT_NOT_FOUND");
  const chart = chartFor(patientId);
  const current = chart.teeth.find((tooth) => tooth.fdi === fdi);
  const result = applyToothUpdate(current, fdi, patch);
  if (!result.ok) {
    throw new DemoError("INVALID_TOOTH", result.error.code);
  }

  const teeth = current
    ? chart.teeth.map((tooth) => (tooth.fdi === fdi ? result.tooth : tooth))
    : [...chart.teeth, result.tooth];

  const next: ChartRecord = { ...chart, version: chart.version + 1, teeth };
  state = { ...state, charts: state.charts.map((row) => (row.id === chart.id ? next : row)) };
  emit();
  return next;
}

export function patchDentition(patientId: string, dentition: Dentition): ChartRecord {
  findOrThrow(state.patients, (row) => row.id === patientId, "PATIENT_NOT_FOUND");
  const chart = chartFor(patientId);
  const fdiList = chart.teeth.map((tooth) => tooth.fdi);
  if (!dentitionFitsTeeth(fdiList, dentition)) {
    throw new DemoError("DENTITION_MISMATCH", "DENTITION_MISMATCH");
  }
  const next: ChartRecord = { ...chart, dentition, version: chart.version + 1 };
  state = { ...state, charts: state.charts.map((row) => (row.id === chart.id ? next : row)) };
  emit();
  return next;
}

export function adjustStock(
  consumableId: string,
  delta: number,
  reason: Exclude<StockMovementReason, "treatment">,
  note?: string,
): ConsumableRecord {
  if (!Number.isInteger(delta) || delta === 0) {
    throw new DemoError("INVALID_QTY", "INVALID_QTY");
  }
  const current = findOrThrow(
    state.consumables,
    (row) => row.id === consumableId,
    "CONSUMABLE_NOT_FOUND",
  );
  const nextStock = current.currentStock + delta;
  if (nextStock < 0) throw new DemoError("STOCK_NEGATIVE", "STOCK_NEGATIVE");

  const next: ConsumableRecord = { ...current, currentStock: nextStock };
  const movement: StockMovementRecord = {
    id: createId(),
    consumableId,
    delta,
    reason,
    createdAt: new Date().toISOString(),
    ...(note ? { note } : {}),
  };

  state = {
    ...state,
    consumables: state.consumables.map((row) => (row.id === consumableId ? next : row)),
    movements: [movement, ...state.movements],
  };
  emit();
  return next;
}

export function createConsumable(input: {
  name: string;
  category: string;
  unit: string;
  costPerUnit: number;
  currentStock: number;
  minStockAlert: number;
}): ConsumableRecord {
  const sku = `CUSTOM_${createId().slice(-6).toUpperCase()}`;
  const record: ConsumableRecord = {
    id: createId(),
    sku,
    name: input.name.trim(),
    category: input.category.trim(),
    unit: input.unit.trim(),
    costPerUnit: input.costPerUnit,
    currentStock: input.currentStock,
    minStockAlert: input.minStockAlert,
  };
  if (
    !record.name ||
    !record.category ||
    !record.unit ||
    !Number.isInteger(record.costPerUnit) ||
    record.costPerUnit < 0 ||
    !Number.isFinite(record.currentStock) ||
    record.currentStock < 0 ||
    !Number.isFinite(record.minStockAlert) ||
    record.minStockAlert < 0
  ) {
    throw new DemoError("VALIDATION", "VALIDATION");
  }
  state = { ...state, consumables: [record, ...state.consumables] };
  emit();
  return record;
}

export function previewTreatment(procedureId: string, quantity = 1): ProcedureDeductionPreview {
  const procedure = findOrThrow(
    state.procedures,
    (row) => row.id === procedureId,
    "PROCEDURE_NOT_FOUND",
  );
  const lines = procedure.consumables.map((line) => {
    const consumable = findOrThrow(
      state.consumables,
      (row) => row.id === line.consumableId,
      "CONSUMABLE_NOT_FOUND",
    );
    return {
      consumableId: consumable.id,
      quantityUsed: line.quantityUsed,
      currentStock: consumable.currentStock,
    };
  });
  return previewProcedureDeduction(quantity, lines);
}

export function completeTreatment(input: {
  patientId: string;
  procedureId: string;
  toothNumber?: number;
  surfaces?: ToothStateRecord["surfaces"];
}): ClinicalRecord {
  const patient = findOrThrow(
    state.patients,
    (row) => row.id === input.patientId,
    "PATIENT_NOT_FOUND",
  );
  const procedure = findOrThrow(
    state.procedures,
    (row) => row.id === input.procedureId,
    "PROCEDURE_NOT_FOUND",
  );
  const preview = previewTreatment(procedure.id);
  if (!preview.canPerform) {
    throw new DemoError("INSUFFICIENT_STOCK", "INSUFFICIENT_STOCK");
  }

  const now = new Date().toISOString();
  const nextConsumables = state.consumables.map((row) => {
    const used = preview.consumed.find((line) => line.consumableId === row.id);
    if (!used) return row;
    return { ...row, currentStock: row.currentStock - used.quantity };
  });

  const movements: StockMovementRecord[] = preview.consumed.map((line) => ({
    id: createId(),
    consumableId: line.consumableId,
    delta: -line.quantity,
    reason: "treatment",
    note: procedure.name,
    createdAt: now,
  }));

  const record: ClinicalRecord = {
    id: createId(),
    patientId: patient.id,
    procedureId: procedure.id,
    procedureName: procedure.name,
    totalBilled: procedure.basePrice,
    performedAt: now,
    performedBy: dentist().id,
    surfaces: input.surfaces
      ? (Object.keys(input.surfaces) as Array<keyof NonNullable<typeof input.surfaces>>)
      : [],
    ...(input.toothNumber !== undefined ? { toothNumber: input.toothNumber } : {}),
  };

  let charts = state.charts;
  if (input.toothNumber !== undefined) {
    const chart = chartFor(patient.id);
    const condition: ToothCondition =
      procedure.code === "COURONNE"
        ? "crown"
        : procedure.code === "IMPLANT"
          ? "implant"
          : procedure.code === "EXTRACT_SIMPLE" || procedure.code === "EXTRACT_CHIR"
            ? "missing"
            : procedure.code === "DEVITALISATION"
              ? "endodontic"
              : "filling";
    const current = chart.teeth.find((tooth) => tooth.fdi === input.toothNumber);
    const result = applyToothUpdate(current, input.toothNumber, { wholeCondition: condition });
    if (result.ok) {
      const teeth = current
        ? chart.teeth.map((tooth) => (tooth.fdi === input.toothNumber ? result.tooth : tooth))
        : [...chart.teeth, result.tooth];
      const nextChart = { ...chart, version: chart.version + 1, teeth };
      charts = state.charts.some((row) => row.id === chart.id)
        ? state.charts.map((row) => (row.id === chart.id ? nextChart : row))
        : [...state.charts, nextChart];
    }
  }

  state = {
    ...state,
    consumables: nextConsumables,
    movements: [...movements, ...state.movements],
    clinicalRecords: [record, ...state.clinicalRecords],
    charts,
  };
  emit();
  return record;
}

export function createAppointment(input: {
  patientId: string;
  procedureId: string;
  start: string;
  end: string;
  dentistId?: string;
}): AppointmentRecord {
  const parsed = createAppointmentBodySchema.parse({
    patientId: input.patientId,
    procedureId: input.procedureId,
    dentistId: input.dentistId ?? dentist().id,
    start: input.start,
    end: input.end,
  });

  findOrThrow(state.patients, (row) => row.id === parsed.patientId, "PATIENT_NOT_FOUND");
  findOrThrow(state.procedures, (row) => row.id === parsed.procedureId, "PROCEDURE_NOT_FOUND");

  const isoDay = isoDayInTimezone(new Date(parsed.start), DEFAULT_TIMEZONE);
  if (isClinicClosedOnDate(DEMO_SCHEDULE, isoDay)) {
    throw new DemoError("CLINIC_CLOSED", "CLINIC_CLOSED");
  }

  const conflict = state.appointments.some(
    (row) =>
      row.status !== "cancelled" &&
      row.dentistId === parsed.dentistId &&
      overlaps(row.start, row.end, parsed.start, parsed.end),
  );
  if (conflict) throw new DemoError("SLOT_CONFLICT", "SLOT_CONFLICT");

  const appointment: AppointmentRecord = {
    id: createId(),
    patientId: parsed.patientId,
    dentistId: parsed.dentistId,
    procedureId: parsed.procedureId,
    start: parsed.start,
    end: parsed.end,
    status: "confirmed",
    source: "staff",
  };
  state = { ...state, appointments: [...state.appointments, appointment] };
  emit();
  return appointment;
}

export function updateAppointment(
  appointmentId: string,
  input: UpdateAppointmentBody,
): AppointmentRecord {
  const parsed = updateAppointmentBodySchema.parse(input);
  const current = findOrThrow(
    state.appointments,
    (row) => row.id === appointmentId,
    "APPOINTMENT_NOT_FOUND",
  );
  const next: AppointmentRecord = { ...current, ...parsed };
  if (parsed.start && parsed.end) {
    const conflict = state.appointments.some(
      (row) =>
        row.id !== appointmentId &&
        row.status !== "cancelled" &&
        row.dentistId === next.dentistId &&
        overlaps(row.start, row.end, next.start, next.end),
    );
    if (conflict) throw new DemoError("SLOT_CONFLICT", "SLOT_CONFLICT");
  }
  state = {
    ...state,
    appointments: state.appointments.map((row) => (row.id === appointmentId ? next : row)),
  };
  emit();
  return next;
}

export function deleteAppointment(appointmentId: string): void {
  findOrThrow(state.appointments, (row) => row.id === appointmentId, "APPOINTMENT_NOT_FOUND");
  state = { ...state, appointments: state.appointments.filter((row) => row.id !== appointmentId) };
  emit();
}

export function createPayment(input: CreatePaymentBody): PaymentRecord {
  const parsed = createPaymentBodySchema.parse(input);
  findOrThrow(state.patients, (row) => row.id === parsed.patientId, "PATIENT_NOT_FOUND");
  const plan = findOrThrow(
    state.treatmentPlans,
    (row) => row.id === parsed.treatmentPlanId,
    "PLAN_NOT_FOUND",
  );
  if (plan.patientId !== parsed.patientId) throw new DemoError("PLAN_NOT_FOUND", "PLAN_NOT_FOUND");

  const payment: PaymentRecord = {
    id: createId(),
    patientId: parsed.patientId,
    treatmentPlanId: parsed.treatmentPlanId,
    installmentNo: parsed.installmentNo,
    amount: parsed.amount,
    method: parsed.method,
    paidAt: parsed.paidAt ?? new Date().toISOString(),
  };
  state = { ...state, payments: [payment, ...state.payments] };
  emit();
  return payment;
}

export function bookPublic(input: {
  procedureId: string;
  dentistId: string;
  start: string;
  fullName: string;
  phone: string;
}): AppointmentRecord {
  const parsed = createPublicAppointmentBodySchema.parse({
    procedureId: input.procedureId,
    dentistId: input.dentistId,
    start: input.start,
    guest: { fullName: input.fullName, phone: input.phone },
  });

  const procedure = findOrThrow(
    state.procedures,
    (row) => row.id === parsed.procedureId,
    "PROCEDURE_NOT_FOUND",
  );
  findOrThrow(state.users, (row) => row.id === parsed.dentistId, "DENTIST_MISSING");

  const end = new Date(
    new Date(parsed.start).getTime() + procedure.durationMinutes * 60_000,
  ).toISOString();
  let patient = state.patients.find((row) => row.phone === parsed.guest.phone);
  if (!patient) {
    patient = createPatient({
      fullName: parsed.guest.fullName,
      phone: parsed.guest.phone,
      commune: state.clinic.commune,
      wilaya: state.clinic.wilaya,
    });
  }

  const appointment: AppointmentRecord = {
    id: createId(),
    patientId: patient.id,
    dentistId: parsed.dentistId,
    procedureId: parsed.procedureId,
    start: parsed.start,
    end,
    status: "pending",
    source: "public",
  };

  const conflict = state.appointments.some(
    (row) =>
      row.status !== "cancelled" &&
      row.dentistId === appointment.dentistId &&
      overlaps(row.start, row.end, appointment.start, appointment.end),
  );
  if (conflict) throw new DemoError("SLOT_CONFLICT", "SLOT_CONFLICT");

  state = { ...state, appointments: [...state.appointments, appointment] };
  emit();
  return appointment;
}

export function listAvailability(procedureId: string, isoDay: string) {
  const procedure = findOrThrow(
    state.procedures,
    (row) => row.id === procedureId,
    "PROCEDURE_NOT_FOUND",
  );
  const doctor = dentist();
  const busy = state.appointments
    .filter((row) => row.dentistId === doctor.id && row.status !== "cancelled")
    .map((row) => ({ start: new Date(row.start), end: new Date(row.end) }));

  return generateDaySlots({
    clinic: DEMO_SCHEDULE,
    isoDay,
    procedureDurationMinutes: procedure.durationMinutes,
    dentistId: doctor.id,
    busyIntervals: busy,
    notBefore: new Date(),
  });
}

export function patientFinancials(patientId: string) {
  const plans = state.treatmentPlans.filter((row) => row.patientId === patientId);
  const payments = state.payments.filter((row) => row.patientId === patientId);
  return patientBalance({
    plans: plans.map((plan) => ({
      id: plan.id,
      total: plan.total,
      installments: plan.installments,
    })),
    payments: payments.map((payment) => ({
      treatmentPlanId: payment.treatmentPlanId,
      installmentNo: payment.installmentNo,
      amount: payment.amount,
    })),
    today: isoDayInTimezone(new Date(), DEFAULT_TIMEZONE),
  });
}

export function inventoryAlerts() {
  return state.consumables
    .map((row) => ({
      ...row,
      status: stockStatus(
        row.currentStock,
        row.minStockAlert,
        row.expirationDate ? new Date(`${row.expirationDate}T12:00:00+01:00`) : null,
      ),
    }))
    .filter((row) => row.status !== "in_stock");
}

export function lookupProcedure(id: string): ProcedureRecord | undefined {
  return state.procedures.find((row) => row.id === id);
}

export function lookupPatient(id: string): PatientRecord | undefined {
  return state.patients.find((row) => row.id === id);
}

export function lookupUser(id: string): StaffUser | undefined {
  return state.users.find((row) => row.id === id);
}

export function toothHistory(patientId: string, fdi: number): ClinicalRecord[] {
  return state.clinicalRecords.filter(
    (row) => row.patientId === patientId && row.toothNumber === fdi,
  );
}
