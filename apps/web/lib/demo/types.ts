import type {
  AppointmentStatus,
  Dentition,
  RecordedPaymentMethod,
  RiskTag,
  Role,
  StockMovementReason,
  Surface,
  ToothCondition,
  TreatmentStatus,
} from "@dentapulse/shared";

export const DEMO_STATE_VERSION = 2 as const;

export interface ClinicRecord {
  id: string;
  slug: string;
  name: string;
  doctorName: string;
  address: string;
  wilaya: number;
  commune: string;
  phone: string;
  whatsapp: string;
  specialties: string[];
  publicShowPrices: boolean;
}

export interface StaffUser {
  id: string;
  email: string;
  role: Role;
  fullName: string;
}

export interface SupplierRecord {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
}

export interface ConsumableRecord {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentStock: number;
  minStockAlert: number;
  costPerUnit: number;
  expirationDate?: string;
  supplierId?: string;
}

export interface ProcedureRecipeLine {
  consumableId: string;
  quantityUsed: number;
}

export interface ProcedureRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  basePrice: number;
  durationMinutes: number;
  isActive: boolean;
  consumables: ProcedureRecipeLine[];
}

export interface PatientRecord {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  sex?: "female" | "male";
  wilaya: number;
  commune: string;
  preferredLanguage: "fr" | "ar";
  riskTags: RiskTag[];
  allergies: string[];
  medicalNotes?: string;
  createdAt: string;
}

export interface ToothStateRecord {
  fdi: number;
  wholeCondition: ToothCondition;
  surfaces: Partial<Record<Surface, ToothCondition>>;
  notes?: string;
}

export interface ChartRecord {
  id: string;
  patientId: string;
  dentition: Dentition;
  version: number;
  teeth: ToothStateRecord[];
}

export interface ClinicalRecord {
  id: string;
  patientId: string;
  procedureId: string;
  procedureName: string;
  toothNumber?: number;
  surfaces: Surface[];
  totalBilled: number;
  performedAt: string;
  performedBy: string;
}

export interface TreatmentPlanItem {
  procedureId: string;
  toothNumber?: number;
  surfaces: Surface[];
  price: number;
  status: TreatmentStatus;
  sequence: number;
}

export interface InstallmentRecord {
  number: number;
  amount: number;
  dueDate: string;
}

export interface TreatmentPlanRecord {
  id: string;
  patientId: string;
  dentistId: string;
  items: TreatmentPlanItem[];
  discount: number;
  total: number;
  installments: InstallmentRecord[];
  createdAt: string;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  dentistId: string;
  procedureId: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  source: "staff" | "public";
}

export interface PaymentRecord {
  id: string;
  patientId: string;
  treatmentPlanId: string;
  installmentNo: number;
  amount: number;
  method: RecordedPaymentMethod;
  paidAt: string;
}

export interface DrugRecord {
  id: string;
  dci: string;
  brand?: string;
  aliases: string[];
  custom: boolean;
}

export interface PrescriptionLine {
  drug: string;
  dci?: string;
  brand?: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionRecord {
  id: string;
  patientId: string;
  dentistId: string;
  items: PrescriptionLine[];
  createdAt: string;
}

export interface StockMovementRecord {
  id: string;
  consumableId: string;
  delta: number;
  reason: StockMovementReason;
  note?: string;
  createdAt: string;
}

export interface DemoState {
  version: typeof DEMO_STATE_VERSION;
  clinic: ClinicRecord;
  users: StaffUser[];
  suppliers: SupplierRecord[];
  consumables: ConsumableRecord[];
  procedures: ProcedureRecord[];
  patients: PatientRecord[];
  charts: ChartRecord[];
  clinicalRecords: ClinicalRecord[];
  treatmentPlans: TreatmentPlanRecord[];
  appointments: AppointmentRecord[];
  payments: PaymentRecord[];
  movements: StockMovementRecord[];
  drugs: DrugRecord[];
  prescriptions: PrescriptionRecord[];
}

export class DemoError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DemoError";
    this.code = code;
  }
}
