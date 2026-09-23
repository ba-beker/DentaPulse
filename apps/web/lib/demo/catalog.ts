import type { ClinicScheduleInput, RiskTag } from "@dentapulse/shared";

export const DEMO_CLINIC_SLUG = "cabinet-dentaire-el-amria" as const;
export const DEMO_CLINIC_NAME = "Cabinet Dentaire El Amria";
export const DEMO_DOCTOR_NAME = "Dr. Benali";

export const DEMO_EXAMPLE_PROCEDURE_PRICES: Readonly<Record<string, number>> = {
  CONSULT: 1_500,
  DETARTRAGE: 3_000,
  OBTURATION: 4_000,
  EXTRACT_SIMPLE: 4_000,
  EXTRACT_CHIR: 8_000,
  DEVITALISATION: 8_000,
  COURONNE: 25_000,
  BLANCHIMENT: 15_000,
  IMPLANT: 80_000,
  RADIO_PANO: 3_000,
  PULPOTOMIE: 6_000,
  SCELLEMENT: 3_000,
};

export interface ConsumableTemplate {
  key: string;
  name: string;
  category: string;
  unit: string;
  costPerUnit: number;
  minStockAlert: number;
}

export interface ProcedureTemplate {
  code: string;
  name: string;
  category: string;
  basePrice: number;
  durationMinutes: number;
  consumables: readonly { consumableKey: string; quantityUsed: number }[];
}

export const defaultConsumableTemplates: readonly ConsumableTemplate[] = [
  {
    key: "ANESTHESIE",
    name: "Cartouche d'anesthésique articaïne 4 %",
    category: "Anesthésie",
    unit: "cartouche",
    costPerUnit: 80,
    minStockAlert: 10,
  },
  {
    key: "AIGUILLE",
    name: "Aiguille dentaire 27G (courte)",
    category: "Anesthésie",
    unit: "unité",
    costPerUnit: 15,
    minStockAlert: 20,
  },
  {
    key: "GANTS",
    name: "Gants d'examen nitrile (taille M)",
    category: "Protection",
    unit: "paire",
    costPerUnit: 20,
    minStockAlert: 20,
  },
  {
    key: "MASQUE",
    name: "Masque chirurgical type IIR",
    category: "Protection",
    unit: "unité",
    costPerUnit: 15,
    minStockAlert: 20,
  },
  {
    key: "BAVETTE",
    name: "Bavette patient imperméable",
    category: "Protection",
    unit: "unité",
    costPerUnit: 10,
    minStockAlert: 20,
  },
  {
    key: "COTON",
    name: "Rouleau de coton stérile",
    category: "Protection",
    unit: "unité",
    costPerUnit: 5,
    minStockAlert: 30,
  },
  {
    key: "COMPOSITE",
    name: "Composite photopolymérisable teinte A2",
    category: "Restaurateur",
    unit: "capsule",
    costPerUnit: 350,
    minStockAlert: 10,
  },
  {
    key: "MORDANCAGE",
    name: "Gel de mordançant phosphorique 37 %",
    category: "Restaurateur",
    unit: "dose",
    costPerUnit: 40,
    minStockAlert: 10,
  },
  {
    key: "ADHESIF",
    name: "Adhésif amélo-dentinaire",
    category: "Restaurateur",
    unit: "dose",
    costPerUnit: 120,
    minStockAlert: 10,
  },
  {
    key: "MICROBROSSE",
    name: "Microbrosse applicatrice",
    category: "Restaurateur",
    unit: "unité",
    costPerUnit: 10,
    minStockAlert: 30,
  },
  {
    key: "CUPULE",
    name: "Cupule à polir prophylaxie",
    category: "Prévention",
    unit: "unité",
    costPerUnit: 30,
    minStockAlert: 10,
  },
  {
    key: "PATE_PROPHY",
    name: "Pâte à prophylaxie fluorée",
    category: "Prévention",
    unit: "dose",
    costPerUnit: 25,
    minStockAlert: 10,
  },
  {
    key: "COMPRESSE",
    name: "Compresse stérile 10 × 10 cm",
    category: "Chirurgie",
    unit: "unité",
    costPerUnit: 15,
    minStockAlert: 20,
  },
  {
    key: "LAME",
    name: "Lame de bistouri stérile n° 15",
    category: "Chirurgie",
    unit: "unité",
    costPerUnit: 40,
    minStockAlert: 10,
  },
  {
    key: "SUTURE",
    name: "Fil de suture résorbable 3-0",
    category: "Chirurgie",
    unit: "unité",
    costPerUnit: 150,
    minStockAlert: 5,
  },
  {
    key: "DIGUE",
    name: "Feuille de digue latex",
    category: "Endodontie",
    unit: "unité",
    costPerUnit: 50,
    minStockAlert: 10,
  },
  {
    key: "LIME",
    name: "Lime endodontique rotative M2",
    category: "Endodontie",
    unit: "unité",
    costPerUnit: 80,
    minStockAlert: 20,
  },
  {
    key: "HYPOCHLORITE",
    name: "Hypochlorite de sodium 2,5 %",
    category: "Endodontie",
    unit: "dose",
    costPerUnit: 20,
    minStockAlert: 10,
  },
  {
    key: "POINTE_PAPIER",
    name: "Pointe de papier stérile",
    category: "Endodontie",
    unit: "unité",
    costPerUnit: 15,
    minStockAlert: 20,
  },
  {
    key: "CIMENT_CANAL",
    name: "Ciment de scellement canalaire",
    category: "Endodontie",
    unit: "dose",
    costPerUnit: 200,
    minStockAlert: 5,
  },
  {
    key: "SILICONE",
    name: "Silicone d'empreinte additionnel",
    category: "Prothèse",
    unit: "dose",
    costPerUnit: 400,
    minStockAlert: 5,
  },
  {
    key: "FIL_RETRACTION",
    name: "Fil de rétraction gingival",
    category: "Prothèse",
    unit: "unité",
    costPerUnit: 30,
    minStockAlert: 10,
  },
  {
    key: "CIMENT_SCELLEMENT",
    name: "Ciment de scellement définitif",
    category: "Prothèse",
    unit: "dose",
    costPerUnit: 250,
    minStockAlert: 5,
  },
  {
    key: "COURONNE_PROV",
    name: "Couronne provisoire en résine",
    category: "Prothèse",
    unit: "unité",
    costPerUnit: 300,
    minStockAlert: 5,
  },
  {
    key: "GEL_BLANCHIMENT",
    name: "Gel de blanchiment 16 %",
    category: "Esthétique",
    unit: "dose",
    costPerUnit: 800,
    minStockAlert: 5,
  },
  {
    key: "ECARTEUR",
    name: "Écarteur buccal",
    category: "Esthétique",
    unit: "unité",
    costPerUnit: 40,
    minStockAlert: 5,
  },
  {
    key: "IMPLANT",
    name: "Implant dentaire titane 4,2 × 10 mm",
    category: "Implantologie",
    unit: "unité",
    costPerUnit: 18_000,
    minStockAlert: 2,
  },
  {
    key: "VIS_COUVERTURE",
    name: "Vis de couverture implantaire",
    category: "Implantologie",
    unit: "unité",
    costPerUnit: 1_500,
    minStockAlert: 2,
  },
  {
    key: "GAINE_RADIO",
    name: "Gaine de protection radiographique",
    category: "Imagerie",
    unit: "unité",
    costPerUnit: 20,
    minStockAlert: 10,
  },
  {
    key: "MTA",
    name: "Ciment MTA (pulpotomie)",
    category: "Pédodontie",
    unit: "dose",
    costPerUnit: 600,
    minStockAlert: 5,
  },
  {
    key: "CIMENT_PEDO",
    name: "Ciment d'obturation pédiatrique",
    category: "Pédodontie",
    unit: "dose",
    costPerUnit: 150,
    minStockAlert: 5,
  },
  {
    key: "SEALANT",
    name: "Résine de scellement",
    category: "Pédodontie",
    unit: "dose",
    costPerUnit: 200,
    minStockAlert: 5,
  },
  {
    key: "FRAISE",
    name: "Fraise diamantée FG — occlusale",
    category: "Chirurgie",
    unit: "unité",
    costPerUnit: 450,
    minStockAlert: 5,
  },
];

export const defaultProcedureTemplates: readonly ProcedureTemplate[] = [
  {
    code: "CONSULT",
    name: "Consultation et bilan",
    category: "Diagnostic",
    basePrice: 2_000,
    durationMinutes: 30,
    consumables: [
      { consumableKey: "GANTS", quantityUsed: 1 },
      { consumableKey: "MASQUE", quantityUsed: 1 },
      { consumableKey: "BAVETTE", quantityUsed: 1 },
    ],
  },
  {
    code: "DETARTRAGE",
    name: "Détartrage",
    category: "Prévention",
    basePrice: 3_500,
    durationMinutes: 30,
    consumables: [
      { consumableKey: "GANTS", quantityUsed: 1 },
      { consumableKey: "MASQUE", quantityUsed: 1 },
      { consumableKey: "CUPULE", quantityUsed: 1 },
      { consumableKey: "PATE_PROPHY", quantityUsed: 1 },
      { consumableKey: "COTON", quantityUsed: 2 },
    ],
  },
  {
    code: "OBTURATION",
    name: "Obturation composite",
    category: "Soins conservateurs",
    basePrice: 8_000,
    durationMinutes: 45,
    consumables: [
      { consumableKey: "ANESTHESIE", quantityUsed: 1 },
      { consumableKey: "AIGUILLE", quantityUsed: 1 },
      { consumableKey: "COMPOSITE", quantityUsed: 1 },
      { consumableKey: "MORDANCAGE", quantityUsed: 1 },
      { consumableKey: "ADHESIF", quantityUsed: 1 },
      { consumableKey: "MICROBROSSE", quantityUsed: 2 },
      { consumableKey: "GANTS", quantityUsed: 1 },
    ],
  },
  {
    code: "EXTRACT_SIMPLE",
    name: "Extraction simple",
    category: "Chirurgie",
    basePrice: 4_000,
    durationMinutes: 30,
    consumables: [
      { consumableKey: "ANESTHESIE", quantityUsed: 1 },
      { consumableKey: "AIGUILLE", quantityUsed: 1 },
      { consumableKey: "COMPRESSE", quantityUsed: 2 },
      { consumableKey: "GANTS", quantityUsed: 1 },
    ],
  },
  {
    code: "EXTRACT_CHIR",
    name: "Extraction chirurgicale",
    category: "Chirurgie",
    basePrice: 8_000,
    durationMinutes: 60,
    consumables: [
      { consumableKey: "ANESTHESIE", quantityUsed: 2 },
      { consumableKey: "AIGUILLE", quantityUsed: 2 },
      { consumableKey: "LAME", quantityUsed: 1 },
      { consumableKey: "SUTURE", quantityUsed: 1 },
      { consumableKey: "COMPRESSE", quantityUsed: 4 },
      { consumableKey: "GANTS", quantityUsed: 2 },
    ],
  },
  {
    code: "DEVITALISATION",
    name: "Dévitalisation",
    category: "Endodontie",
    basePrice: 12_000,
    durationMinutes: 75,
    consumables: [
      { consumableKey: "ANESTHESIE", quantityUsed: 1 },
      { consumableKey: "AIGUILLE", quantityUsed: 1 },
      { consumableKey: "DIGUE", quantityUsed: 1 },
      { consumableKey: "LIME", quantityUsed: 6 },
      { consumableKey: "HYPOCHLORITE", quantityUsed: 1 },
      { consumableKey: "POINTE_PAPIER", quantityUsed: 6 },
      { consumableKey: "CIMENT_CANAL", quantityUsed: 1 },
      { consumableKey: "GANTS", quantityUsed: 1 },
    ],
  },
  {
    code: "COURONNE",
    name: "Pose de couronne",
    category: "Prothèse",
    basePrice: 25_000,
    durationMinutes: 60,
    consumables: [
      { consumableKey: "ANESTHESIE", quantityUsed: 1 },
      { consumableKey: "AIGUILLE", quantityUsed: 1 },
      { consumableKey: "SILICONE", quantityUsed: 1 },
      { consumableKey: "FIL_RETRACTION", quantityUsed: 1 },
      { consumableKey: "CIMENT_SCELLEMENT", quantityUsed: 1 },
      { consumableKey: "COURONNE_PROV", quantityUsed: 1 },
      { consumableKey: "GANTS", quantityUsed: 1 },
    ],
  },
  {
    code: "BLANCHIMENT",
    name: "Blanchiment",
    category: "Esthétique",
    basePrice: 15_000,
    durationMinutes: 60,
    consumables: [
      { consumableKey: "GEL_BLANCHIMENT", quantityUsed: 1 },
      { consumableKey: "ECARTEUR", quantityUsed: 1 },
      { consumableKey: "GANTS", quantityUsed: 1 },
      { consumableKey: "BAVETTE", quantityUsed: 1 },
    ],
  },
  {
    code: "IMPLANT",
    name: "Pose d'implant",
    category: "Implantologie",
    basePrice: 80_000,
    durationMinutes: 90,
    consumables: [
      { consumableKey: "ANESTHESIE", quantityUsed: 2 },
      { consumableKey: "AIGUILLE", quantityUsed: 2 },
      { consumableKey: "IMPLANT", quantityUsed: 1 },
      { consumableKey: "VIS_COUVERTURE", quantityUsed: 1 },
      { consumableKey: "LAME", quantityUsed: 1 },
      { consumableKey: "SUTURE", quantityUsed: 1 },
      { consumableKey: "COMPRESSE", quantityUsed: 4 },
      { consumableKey: "GANTS", quantityUsed: 2 },
    ],
  },
  {
    code: "RADIO_PANO",
    name: "Radiographie panoramique",
    category: "Imagerie",
    basePrice: 3_000,
    durationMinutes: 15,
    consumables: [{ consumableKey: "GAINE_RADIO", quantityUsed: 1 }],
  },
  {
    code: "PULPOTOMIE",
    name: "Pulpotomie (enfant)",
    category: "Pédodontie",
    basePrice: 6_000,
    durationMinutes: 40,
    consumables: [
      { consumableKey: "ANESTHESIE", quantityUsed: 1 },
      { consumableKey: "AIGUILLE", quantityUsed: 1 },
      { consumableKey: "MTA", quantityUsed: 1 },
      { consumableKey: "CIMENT_PEDO", quantityUsed: 1 },
      { consumableKey: "GANTS", quantityUsed: 1 },
      { consumableKey: "COTON", quantityUsed: 2 },
    ],
  },
  {
    code: "SCELLEMENT",
    name: "Scellement de sillons",
    category: "Pédodontie",
    basePrice: 3_000,
    durationMinutes: 20,
    consumables: [
      { consumableKey: "MORDANCAGE", quantityUsed: 1 },
      { consumableKey: "SEALANT", quantityUsed: 1 },
      { consumableKey: "MICROBROSSE", quantityUsed: 1 },
      { consumableKey: "COTON", quantityUsed: 2 },
    ],
  },
];

export const demoSuppliers = [
  {
    name: "Dentale Oran — Fournitures Médicales",
    phone: "+213770012345",
    whatsapp: "+213770012345",
    email: "contact@dentale-oran.demo",
  },
  {
    name: "Algérie Dental Supply (ADS)",
    phone: "+213550098765",
    whatsapp: "+213550098765",
    email: "commandes@ads-dental.demo",
  },
  {
    name: "SARL Matériel Chirurgical El Amria",
    phone: "+213661122334",
    email: "ventes@el-amria-materiel.demo",
  },
] as const;

export const DEMO_USER_EMAILS = {
  owner: "proprietaire@demo-el-amria.test",
  dentist: "dentiste@demo-el-amria.test",
  assistant: "assistante@demo-el-amria.test",
  receptionist: "accueil@demo-el-amria.test",
} as const;

export const DEMO_USER_NAMES = {
  owner: "Samira Benali",
  dentist: "Dr. Benali",
  assistant: "Yanis Khelifi",
  receptionist: "Nora Saïdi",
} as const;

export const DEMO_FIRST_NAMES = [
  "Amina",
  "Karim",
  "Yasmine",
  "Mehdi",
  "Salima",
  "Nadir",
  "Lina",
  "Riad",
  "Samira",
  "Farid",
  "Inès",
  "Hocine",
  "Djamila",
  "Sofiane",
  "Nora",
  "Malik",
  "Sabrina",
  "Amine",
  "Leïla",
  "Bilal",
] as const;

export const DEMO_LAST_NAMES = [
  "Benali",
  "Meziani",
  "Khelifi",
  "Saïdi",
  "Boudiaf",
  "Hamidi",
  "Cherif",
  "Mansouri",
  "Bensaïd",
  "Hadji",
  "Ouahab",
  "Ziani",
  "Belkacem",
  "Taleb",
  "Rahmani",
  "Slimani",
  "Ferhat",
  "Amrani",
  "Bouzid",
  "Larbi",
] as const;

export const DEMO_WILAYAS = [31, 16, 25, 9, 19, 6, 35, 23, 42, 15] as const;

export const DEMO_RISK_COMBOS: readonly RiskTag[][] = [
  [],
  ["diabetes"],
  ["hypertension"],
  ["penicillin_allergy"],
  ["coagulation_risk"],
  ["pregnancy"],
  ["cardiac"],
  ["latex_allergy"],
  ["diabetes", "hypertension"],
  ["penicillin_allergy", "coagulation_risk"],
];

const weekdaySlots = [
  { start: "09:00" as const, end: "13:00" as const },
  { start: "14:00" as const, end: "17:00" as const },
];

export const DEMO_SCHEDULE: ClinicScheduleInput = {
  timezone: "Africa/Algiers",
  weekendDays: [5],
  workingHours: [
    { day: 0, slots: weekdaySlots },
    { day: 1, slots: weekdaySlots },
    { day: 2, slots: weekdaySlots },
    { day: 3, slots: weekdaySlots },
    { day: 4, slots: weekdaySlots },
    { day: 6, slots: [{ start: "09:00", end: "13:00" }] },
  ],
  seasonalHours: [],
  holidays: [],
  bookingBufferMinutes: 0,
};
