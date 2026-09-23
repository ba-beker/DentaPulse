import {
  ADULT_TEETH,
  addCalendarDays,
  algiersIsoDay,
  COMMON_DRUGS,
  roleSchema,
  type Surface,
  type ToothCondition,
} from "@dentapulse/shared";
import {
  DEMO_CLINIC_NAME,
  DEMO_CLINIC_SLUG,
  DEMO_DOCTOR_NAME,
  DEMO_EXAMPLE_PROCEDURE_PRICES,
  DEMO_FIRST_NAMES,
  DEMO_LAST_NAMES,
  DEMO_RISK_COMBOS,
  DEMO_USER_EMAILS,
  DEMO_USER_NAMES,
  DEMO_WILAYAS,
  defaultConsumableTemplates,
  defaultProcedureTemplates,
  demoSuppliers,
} from "./catalog";
import { ID_BUCKET, rememberId, resetIdCounter, seededId } from "./ids";
import type {
  AppointmentRecord,
  ChartRecord,
  ClinicalRecord,
  ConsumableRecord,
  DemoState,
  DrugRecord,
  PatientRecord,
  PrescriptionRecord,
  ProcedureRecord,
  StaffUser,
  StockMovementRecord,
  SupplierRecord,
  ToothStateRecord,
  TreatmentPlanRecord,
} from "./types";
import { DEMO_STATE_VERSION } from "./types";

const CLINICAL_RECORD_TARGET = 60;
const APPOINTMENT_TARGET = 25;
const TOOTH_CONDITIONS: ToothCondition[] = [
  "healthy",
  "caries",
  "filling",
  "crown",
  "endodontic",
  "missing",
  "implant",
];

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function yearsAgoIso(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  date.setMonth(3, 15);
  date.setHours(0, 0, 0, 0);
  return algiersIsoDay(date);
}

function expirationInDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return algiersIsoDay(date);
}

function teethForPatient(index: number): ToothStateRecord[] {
  const teeth: ToothStateRecord[] = [];
  const count = 3 + (index % 4);
  for (let offset = 0; offset < count; offset += 1) {
    const fdi = ADULT_TEETH[(index * 5 + offset * 3) % ADULT_TEETH.length];
    if (fdi === undefined) continue;
    const condition = TOOTH_CONDITIONS[(index + offset) % TOOTH_CONDITIONS.length] ?? "healthy";
    if (condition === "healthy") continue;
    teeth.push({
      fdi,
      wholeCondition: condition,
      surfaces:
        condition === "caries" || condition === "filling" ? { O: condition, M: condition } : {},
    });
  }
  if (teeth.length === 0) {
    const fallback = ADULT_TEETH[index % ADULT_TEETH.length];
    if (fallback !== undefined) {
      teeth.push({ fdi: fallback, wholeCondition: "filling", surfaces: { O: "filling" } });
    }
  }
  return teeth;
}

function nextWorkingSlot(base: Date, slotIndex: number): { start: Date; end: Date } {
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1 + (slotIndex % 14));
  while (start.getDay() === 5) {
    start.setDate(start.getDate() + 1);
  }
  const hours = [9, 10, 11, 14, 15, 16];
  start.setHours(hours[slotIndex % hours.length] ?? 9, (slotIndex * 11) % 60, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);
  return { start, end };
}

function buildDrugs(): DrugRecord[] {
  return COMMON_DRUGS.map((drug, index) => ({
    id: seededId(ID_BUCKET.drug, index + 1),
    dci: drug.dci,
    brand: drug.brand,
    aliases: [...drug.aliases],
    custom: false,
  }));
}

function buildPatients(): PatientRecord[] {
  const createdAt = new Date().toISOString();
  const patients: PatientRecord[] = [];
  for (let index = 0; index < 40; index += 1) {
    const first = DEMO_FIRST_NAMES[index % DEMO_FIRST_NAMES.length] ?? "Demo";
    const last = DEMO_LAST_NAMES[(index * 7) % DEMO_LAST_NAMES.length] ?? "Patient";
    const seq = String(index + 1).padStart(2, "0");
    patients.push({
      id: seededId(ID_BUCKET.patient, index + 1),
      fullName: `${first} ${last}`,
      phone: `+213555${seq}2345`,
      wilaya: DEMO_WILAYAS[index % DEMO_WILAYAS.length] ?? 31,
      commune: index % 2 === 0 ? "El Amria" : "Centre-ville",
      preferredLanguage: "fr",
      riskTags: [...(DEMO_RISK_COMBOS[index % DEMO_RISK_COMBOS.length] ?? [])],
      allergies: index % 5 === 0 ? ["Pénicilline (déclaratif démo)"] : [],
      createdAt,
      ...(index % 11 === 0 ? { dateOfBirth: yearsAgoIso(8) } : {}),
      ...(index % 13 === 0 ? { dateOfBirth: yearsAgoIso(35) } : {}),
    });
  }
  return patients;
}

function buildConsumables(supplierIds: string[]): ConsumableRecord[] {
  const nearMinimum = new Set(["MASQUE", "MICROBROSSE", "AIGUILLE", "DIGUE", "SUTURE"]);
  const expiring = expirationInDays(30);

  return defaultConsumableTemplates.map((template, index) => {
    let stock = Math.max(template.minStockAlert * 3, 20);
    if (template.key === "GANTS") stock = 8;
    if (template.key === "COURONNE_PROV") stock = 0;
    if (nearMinimum.has(template.key)) stock = template.minStockAlert;
    if (template.key === "FRAISE") stock = 12;

    const record: ConsumableRecord = {
      id: seededId(ID_BUCKET.consumable, index + 1),
      name: template.name,
      sku: template.key,
      category: template.category,
      unit: template.unit,
      currentStock: stock,
      minStockAlert: template.minStockAlert,
      costPerUnit: template.costPerUnit,
      supplierId: supplierIds[index % supplierIds.length],
    };

    if (template.key === "COMPOSITE" || template.key === "GEL_BLANCHIMENT") {
      record.expirationDate = expiring;
    }

    return record;
  });
}

function buildTreatmentPlans(
  patients: PatientRecord[],
  procedureByCode: Map<string, ProcedureRecord>,
  dentistId: string,
): TreatmentPlanRecord[] {
  const today = algiersIsoDay(new Date());
  const configs = [
    {
      patientIndex: 0,
      lines: [
        { code: "OBTURATION", tooth: 16, price: 4_000 },
        { code: "COURONNE", tooth: 16, price: 25_000 },
      ],
      discount: 0,
      installments: [
        { number: 1, amount: 10_000, dueDays: 0 },
        { number: 2, amount: 10_000, dueDays: 30 },
        { number: 3, amount: 9_000, dueDays: 60 },
      ],
    },
    {
      patientIndex: 3,
      lines: [{ code: "DEVITALISATION", tooth: 26, price: 8_000 }],
      discount: 500,
      installments: [
        { number: 1, amount: 3_750, dueDays: 0 },
        { number: 2, amount: 3_750, dueDays: 45 },
      ],
    },
    {
      patientIndex: 5,
      lines: [
        { code: "IMPLANT", tooth: 46, price: 80_000 },
        { code: "DETARTRAGE", price: 3_000 },
      ],
      discount: 0,
      installments: [
        { number: 1, amount: 40_000, dueDays: 0 },
        { number: 2, amount: 43_000, dueDays: 90 },
      ],
    },
  ] as const;

  return configs.flatMap((config, planIndex) => {
    const patient = patients[config.patientIndex];
    if (!patient) return [];

    const items = config.lines.map((line, sequence) => {
      const procedure = procedureByCode.get(line.code);
      if (!procedure) {
        throw new Error(`Acte de démo introuvable : ${line.code}`);
      }
      const toothNumber = "tooth" in line ? line.tooth : undefined;
      return {
        procedureId: procedure.id,
        ...(toothNumber !== undefined ? { toothNumber } : {}),
        surfaces: toothNumber !== undefined ? (["O"] satisfies Surface[]) : [],
        price: line.price,
        status: "planned" as const,
        sequence: 900 + planIndex * 10 + sequence,
      };
    });

    const sum = items.reduce((total, item) => total + item.price, 0);
    return [
      {
        id: seededId(ID_BUCKET.plan, planIndex + 1),
        patientId: patient.id,
        dentistId,
        items,
        discount: config.discount,
        total: sum - config.discount,
        createdAt: new Date().toISOString(),
        installments: config.installments.map((row) => ({
          number: row.number,
          amount: row.amount,
          dueDate: addCalendarDays(today, row.dueDays),
        })),
      } satisfies TreatmentPlanRecord,
    ];
  });
}

export function createDemoSeed(): DemoState {
  resetIdCounter(1);

  const clinicId = seededId(ID_BUCKET.clinic, 1);
  const users: StaffUser[] = roleSchema.options.map((role, index) => ({
    id: seededId(ID_BUCKET.user, index + 1),
    email: DEMO_USER_EMAILS[role],
    role,
    fullName: DEMO_USER_NAMES[role],
  }));

  const dentist = users.find((user) => user.role === "dentist");
  if (!dentist) throw new Error("Chirurgien-dentiste de démo introuvable.");

  const suppliers: SupplierRecord[] = demoSuppliers.map((supplier, index) => ({
    id: seededId(ID_BUCKET.supplier, index + 1),
    name: supplier.name,
    phone: supplier.phone,
    ...("whatsapp" in supplier ? { whatsapp: supplier.whatsapp } : {}),
    ...("email" in supplier ? { email: supplier.email } : {}),
  }));

  const consumables = buildConsumables(suppliers.map((row) => row.id));
  const consumableBySku = new Map(consumables.map((row) => [row.sku, row]));

  const procedures: ProcedureRecord[] = defaultProcedureTemplates.map((template, index) => ({
    id: seededId(ID_BUCKET.procedure, index + 1),
    code: template.code,
    name: template.name,
    category: template.category,
    basePrice: DEMO_EXAMPLE_PROCEDURE_PRICES[template.code] ?? template.basePrice,
    durationMinutes: template.durationMinutes,
    isActive: true,
    consumables: template.consumables.map((line) => {
      const consumable = consumableBySku.get(line.consumableKey);
      if (!consumable) {
        throw new Error(`${template.code} cite un consommable absent : ${line.consumableKey}`);
      }
      return { consumableId: consumable.id, quantityUsed: line.quantityUsed };
    }),
  }));

  const procedureByCode = new Map(procedures.map((row) => [row.code, row]));
  const patients = buildPatients();

  const charts: ChartRecord[] = patients.map((patient, index) => ({
    id: seededId(ID_BUCKET.chart, index + 1),
    patientId: patient.id,
    dentition: "adult",
    version: 1,
    teeth: teethForPatient(index),
  }));

  const clinicalRecords: ClinicalRecord[] = [];
  for (let index = 0; index < CLINICAL_RECORD_TARGET; index += 1) {
    const procedure = procedures[index % procedures.length];
    const patient = patients[index % patients.length];
    const tooth = ADULT_TEETH[index % ADULT_TEETH.length];
    if (!procedure || !patient || tooth === undefined) continue;
    const performedAt = new Date();
    performedAt.setDate(performedAt.getDate() - (index % 90));
    performedAt.setHours(9 + (index % 6), (index * 7) % 60, 0, 0);
    clinicalRecords.push({
      id: seededId(ID_BUCKET.record, index + 1),
      patientId: patient.id,
      procedureId: procedure.id,
      procedureName: procedure.name,
      toothNumber: tooth,
      surfaces: index % 3 === 0 ? ["O"] : [],
      totalBilled: procedure.basePrice,
      performedAt: performedAt.toISOString(),
      performedBy: dentist.id,
    });
  }

  const treatmentPlans = buildTreatmentPlans(patients, procedureByCode, dentist.id);
  const firstPlan = treatmentPlans[0];

  const appointments: AppointmentRecord[] = [];
  const consult = procedureByCode.get("CONSULT");
  const detartrage = procedureByCode.get("DETARTRAGE");
  const obturation = procedureByCode.get("OBTURATION");
  const rotation = [consult, detartrage, obturation].filter(
    (row): row is ProcedureRecord => row !== undefined,
  );
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let index = 0; index < APPOINTMENT_TARGET; index += 1) {
    const patient = patients[index % patients.length];
    const procedure = rotation[index % rotation.length];
    if (!patient || !procedure) continue;
    const { start, end } = nextWorkingSlot(base, index);
    appointments.push({
      id: seededId(ID_BUCKET.appointment, index + 1),
      patientId: patient.id,
      dentistId: dentist.id,
      procedureId: procedure.id,
      start: start.toISOString(),
      end: end.toISOString(),
      status: index % 4 === 0 ? "pending" : "confirmed",
      source: "staff",
    });
  }

  const drugs = buildDrugs();
  const samplePatient = patients[1];
  const amoxicillin = drugs.find((row) => row.dci === "Amoxicilline");
  const paracetamol = drugs.find((row) => row.dci === "Paracétamol");
  const prescriptions: PrescriptionRecord[] =
    samplePatient && amoxicillin && paracetamol
      ? [
          {
            id: seededId(ID_BUCKET.prescription, 1),
            patientId: samplePatient.id,
            dentistId: dentist.id,
            createdAt: isoDaysAgo(3),
            items: [
              {
                drug: amoxicillin.brand ?? amoxicillin.dci,
                dci: amoxicillin.dci,
                ...(amoxicillin.brand ? { brand: amoxicillin.brand } : {}),
                dosage: "1 gélule matin et soir",
                duration: "6 jours",
              },
              {
                drug: paracetamol.brand ?? paracetamol.dci,
                dci: paracetamol.dci,
                ...(paracetamol.brand ? { brand: paracetamol.brand } : {}),
                dosage: "1 comprimé si douleur, 3 fois par jour au maximum",
                duration: "3 jours",
              },
            ],
          },
        ]
      : [];

  const movements: StockMovementRecord[] = [
    {
      id: seededId(ID_BUCKET.movement, 1),
      consumableId: consumables[0]?.id ?? seededId(ID_BUCKET.consumable, 1),
      delta: 40,
      reason: "purchase_receipt",
      note: "Réception initiale de démonstration",
      createdAt: isoDaysAgo(14),
    },
  ];

  const state: DemoState = {
    version: DEMO_STATE_VERSION,
    clinic: {
      id: clinicId,
      slug: DEMO_CLINIC_SLUG,
      name: DEMO_CLINIC_NAME,
      doctorName: DEMO_DOCTOR_NAME,
      address: "12 rue des Frères Bouadou",
      wilaya: 31,
      commune: "El Amria",
      phone: "+2137700555123",
      whatsapp: "+2137700555123",
      specialties: ["Soins conservateurs", "Prothèse", "Implantologie"],
      publicShowPrices: true,
    },
    users,
    suppliers,
    consumables,
    procedures,
    patients,
    charts,
    clinicalRecords,
    treatmentPlans,
    appointments,
    payments: firstPlan
      ? [
          {
            id: seededId(ID_BUCKET.payment, 1),
            patientId: firstPlan.patientId,
            treatmentPlanId: firstPlan.id,
            installmentNo: 1,
            amount: 10_000,
            method: "cash",
            paidAt: isoDaysAgo(2),
          },
        ]
      : [],
    movements,
    drugs,
    prescriptions,
  };

  walkIds(state, rememberId);
  return state;
}

export function walkIds(state: DemoState, visit: (id: string) => void): void {
  visit(state.clinic.id);
  for (const row of state.users) visit(row.id);
  for (const row of state.suppliers) visit(row.id);
  for (const row of state.consumables) visit(row.id);
  for (const row of state.procedures) visit(row.id);
  for (const row of state.patients) visit(row.id);
  for (const row of state.charts) visit(row.id);
  for (const row of state.clinicalRecords) visit(row.id);
  for (const row of state.treatmentPlans) visit(row.id);
  for (const row of state.appointments) visit(row.id);
  for (const row of state.payments) visit(row.id);
  for (const row of state.movements) visit(row.id);
  for (const row of state.drugs) visit(row.id);
  for (const row of state.prescriptions) visit(row.id);
}
