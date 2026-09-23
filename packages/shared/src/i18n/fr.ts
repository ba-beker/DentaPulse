import type {
  AppointmentStatus,
  PaymentMethod,
  RiskTag,
  Role,
  StockMovementReason,
  StockStatus,
  ToothCondition,
  TreatmentStatus,
} from "../enums.js";
import type { RecordedPaymentMethod } from "../schemas/payment.js";
import type { Surface } from "../surfaces.js";
import type { Arch, Dentition } from "../teeth.js";

export const dentitionLabels = {
  adult: "Denture permanente",
  pediatric: "Denture temporaire",
  mixed: "Denture mixte",
} as const satisfies Record<Dentition, string>;

export const toothConditionLabels = {
  healthy: "Saine",
  caries: "Carie",
  filling: "Obturation",
  crown: "Couronne",
  implant: "Implant",
  missing: "Dent absente",
  endodontic: "Traitement endodontique",
  bridge: "Bridge",
  fracture: "Fracture",
  extraction_planned: "Extraction prévue",
} as const satisfies Record<ToothCondition, string>;

export const surfaceLabels = {
  O: "Occlusale",
  I: "Incisive",
  M: "Mésiale",
  D: "Distale",
  B: "Vestibulaire",
  L: "Linguale",
} as const satisfies Record<Surface, string>;

export const treatmentStatusLabels = {
  planned: "Planifié",
  in_progress: "En cours",
  completed: "Réalisé",
  cancelled: "Annulé",
} as const satisfies Record<TreatmentStatus, string>;

export const appointmentStatusLabels = {
  pending: "En attente",
  confirmed: "Confirmé",
  completed: "Terminé",
  cancelled: "Annulé",
  no_show: "Absent",
} as const satisfies Record<AppointmentStatus, string>;

export const roleLabels = {
  owner: "Administrateur",
  dentist: "Chirurgien-dentiste",
  assistant: "Assistant dentaire",
  receptionist: "Secrétaire",
} as const satisfies Record<Role, string>;

export const riskTagLabels = {
  penicillin_allergy: "Allergie à la pénicilline",
  diabetes: "Diabète",
  hypertension: "Hypertension",
  coagulation_risk: "Trouble de la coagulation",
  pregnancy: "Grossesse",
  cardiac: "Cardiopathie",
  latex_allergy: "Allergie au latex",
  other: "Autre",
} as const satisfies Record<RiskTag, string>;

export const stockStatusLabels = {
  in_stock: "En stock",
  low: "Stock faible",
  out: "Rupture de stock",
  expiring_soon: "Péremption proche",
  expired: "Périmé",
} as const satisfies Record<StockStatus, string>;

export const stockMovementReasonLabels = {
  treatment: "Soin",
  purchase_receipt: "Réception",
  manual_adjustment: "Ajustement manuel",
  waste: "Perte",
  expiry: "Péremption",
} as const satisfies Record<StockMovementReason, string>;

export const paymentMethodLabels = {
  cash: "Espèces",
  card: "Carte bancaire",
  transfer: "Virement",
  cheque: "Chèque",
} as const satisfies Record<PaymentMethod, string>;

export const recordedPaymentMethodLabels = {
  cash: "Espèces",
  cheque: "Chèque",
  bank_transfer: "Virement bancaire",
  ccp: "CCP",
  card_cib: "Carte CIB",
  card_edahabia: "Carte Edahabia",
  other: "Autre",
} as const satisfies Record<RecordedPaymentMethod, string>;

/** Printed ordonnance. Arabic is not composed here; the PDF renderer keeps a font slot for it. */
export const ordonnanceCopy = {
  title: "Ordonnance",
  dentist: "Chirurgien-dentiste",
  orderNumber: "N° d'ordre",
  patient: "Patient",
  ageLabel: "Âge",
  ageUnderOne: "Moins d'un an",
  ageOne: "1 an",
  ageMany: "{count} ans",
  madeAt: "Fait à {commune}, le {date}",
  duration: "Durée",
  signature: "Signature",
  stamp: "Cachet",
} as const;

export const purchaseOrderCopy = {
  pdfTitle: "Bon de commande",
  supplier: "Fournisseur",
  orderNumber: "Référence",
  orderDate: "Date",
  lineProduct: "Article",
  lineQty: "Qté",
  lineUnit: "Unité",
  lineUnitCost: "Prix unitaire",
  lineTotal: "Total",
  grandTotal: "Total",
  whatsAppGreeting: "Bonjour,",
  whatsAppIntro: "Veuillez trouver ci-dessous notre bon de commande :",
  whatsAppClosing: "Merci de confirmer la disponibilité et le délai de livraison.",
  mailSubject: "Bon de commande — {clinicName}",
} as const;

/** Linguale on the lower arch, palatine on the upper arch. */
export function surfaceLabel(surface: Surface, arch?: Arch): string {
  if (surface === "L" && arch === "upper") return "Palatine";
  return surfaceLabels[surface];
}
